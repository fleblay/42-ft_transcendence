import { Inject, Injectable, forwardRef, BadRequestException, NotFoundException, OnModuleInit } from '@nestjs/common';
import { Member } from '../model/member.entity';
import { In, MoreThan, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Channel } from '../model/channel.entity';
import { Message } from '../model/message.entity';
import { UsersService } from '../users/users.service';
import { Server } from 'socket.io'
import { CreateChannelDto } from './dto/create-channel.dto';
import { User } from '../model/user.entity';
import { NewMessageDto } from './dto/new-message.dto';
import { ModifyMemberDto } from './dto/modify-member.dto';
import { ChangeChannelDto } from './dto/change-channel.dto';
import { GameService } from 'src/game/game.service';
import { ChannelInfo, PublicChannel, ShortUser } from '../type';

@Injectable()
export class ChatService implements OnModuleInit {

	private wsServer: Server;
	constructor(
		@InjectRepository(Member) private membersRepo: Repository<Member>,
		@InjectRepository(Channel) private channelsRepo: Repository<Channel>,
		@InjectRepository(Message) private messagesRepo: Repository<Message>,
		@Inject(forwardRef(() => UsersService)) private usersService: UsersService,
		@Inject(forwardRef(() => GameService)) private gameService: GameService,
	) { }

	async onModuleInit() {
		const adminUser = await this.usersService.findOneByUsername("admin")
		if (!adminUser) {
			return;
		}
		const generalChannel = await this.channelsRepo.findOne({ where: { name: "general" } })
		if (!generalChannel) {
			const channelId = await this.createChannel({ name: "general", private: false })
			await this.joinChannel(adminUser, channelId, { owner: true })
			//console.log("creating general channel", channelId)
			await this.newMessage(adminUser, channelId, { content: "Welcome to the general channel" })
			await this.newMessage(adminUser, channelId, { content: "vscode is better than vim" })
			await this.newMessage(adminUser, channelId, { content: "Minitalk is for bouffons" })
		}
	}

	setWsServer(server: Server) {
		this.wsServer = server;
	}

	getAllChannels(): Promise<Channel[]> {
		return this.channelsRepo.find();
	}

	async getAllPublicChannels(): Promise<PublicChannel[]> {
		const publicChannels = await this.channelsRepo.find({
			where: {
				private: false,
				directMessage: false,
				members: {
					left: false
				}
			},
			relations: {
				members: {
					user: true
				}
			},
			select: {
				id: true,
				name: true,
				password: true,
				members: {
					id: true,
					role: true,
					user: {
						id: true,
						username: true,
					},
				},
			}
		})
		return publicChannels.map((channel) => ({
			id: channel.id,
			name: channel.name,
			hasPassword: !!channel.password,
			membersLength: channel.members.length,
			owner: channel.members.find((member) => member.role === 'owner')?.user as ShortUser,
		}))
	}

	async createChannel(data: CreateChannelDto): Promise<number> {
		if (data.private && data.password)
			throw new BadRequestException("createChannel : Private channel creation data provide a password")

		const channel: Channel = await this.channelsRepo.save({
			name: data.name,
			private: data.private,
			password: data.password,
			directMessage: data.directMessage ? true : false
		})
		return channel.id
	}

	async joinChannel(user: User, channelId: number, options: { owner?: boolean, password?: string, targetUser?: string } = {}): Promise<void> {
		const channel = await this.channelsRepo.findOne({
			where: { id: channelId },
			relations: { members: { user: true } },
			select: { id: true, private: true, name: true, members: { id: true, role: true, banned: true, left: true, muteTime: true, user: { id: true, username: true } } }
		})
		//console.log("joinChannel : ", channel, options)
		if (!channel)
			throw new BadRequestException(`joinChannel : channel with id ${channelId} does not exist`)
		if (channel.password && (!options?.password || options.password != channel.password))
			throw new BadRequestException(`joinChannel : channel with id ${channelId} is protected and password provided is missing or false`)
		if (channel.private && (!options.owner && channel.members.find((member) => (member.user.id == user.id))?.role != "owner"))
			throw new BadRequestException(`joinChannel : channel with id ${channelId} is private, and you are not an admin or the owner of the channel`)
		//console.log("joinChannel2 : ", channel, options)
		let addedUser: User = user
		if (options?.targetUser) {
			addedUser = await this.usersService.findOneByUsername(options.targetUser) as User
			if (!addedUser) {
				throw new BadRequestException(`joinChannel : the username ${options.targetUser} matches no user in database`)
			}
		}
		let joiner: Member;
		// Find if the user is already in the channel
		const member = channel.members.find((member) => (member.user.id == addedUser!.id))
		if (member) {
			if (member.banned)
				throw new BadRequestException(`joinChannel : channeld with id ${channelId} : ${addedUser.username} is banned from the channel`)
			if (!member.left)
				throw new BadRequestException(`joinChannel : channeld with id ${channelId} : ${addedUser.username} is already in the channel`)
			else {
				member.left = false
				joiner = await this.membersRepo.save(member)
			}
		}
		// If not, create a new member
		else {
			joiner = this.membersRepo.create({
				user: addedUser,
				channel,
				messages: [],
				role: (options?.owner) ? "owner" : "regular"
			})
			channel.members.push(joiner)
			await this.channelsRepo.save(channel)
			joiner = await this.membersRepo.save(joiner)
		}
		this.wsServer.to(`/chat/${channelId}`).emit('chat.member.new', {
			joinedMember: {
				...joiner,
				isConnected: this.usersService.isConnected(joiner.user.id),
				...this.gameService.userState(joiner.user.id),
			}
		});
		this.wsServer.to(`/chat/myChannels/${addedUser!.id}`).emit('chat.modify.channel', channel);
		this.emitToAllMembers(channelId, 'chat.modify.channel', this.cbEmitAll);

		if (!channel.private) {
			this.wsServer.to('/chat/public').emit('chat.public.update', {
				id: channel.id,
				name: channel.name,
				hasPassword: !!channel.password,
				membersLength: channel.members.filter(member => !member.left).length,
				owner: channel.members.find((member) => member.role === 'owner')?.user as ShortUser,
			} as PublicChannel);
		}
	}

	private async cbEmitAll(member: Member, channel: Channel) {
		return {
			...channel,
			password: undefined,
			hasPassword: channel.password.length !== 0,
			members: channel.members.filter((member) => !member.left)
				.map((member: Member) => (
					{
						...member,
						isConnected: this.usersService.isConnected(member.user.id)
					}
				))
		};
	}

	private getMemberOfChannel(user: User, channelId: number): Promise<Member | null> {
		return this.membersRepo.findOne({
			where: { user: { id: user.id }, channel: { id: channelId } },
			relations: ['channel', 'user'],
			select: {
				id: true,
				role: true,
				banned: true,
				left: true,
				muteTime: true,
				channel: {
					id: true,
				},
				user: {
					id: true,
					username: true,
				}
			},
		});
	}
	private memberIsAllowed(member: Member, ignore: { banned?: boolean, left?: boolean, mute?: boolean } = {}): boolean {
		if (ignore.banned !== true && member.banned)
			throw new BadRequestException('You are banned from this channel');
		if (ignore.left !== true && member.left)
			throw new BadRequestException('You are kicked from this channel');
		if (ignore.mute !== true && member.muteTime && new Date(member.muteTime) > new Date())
			throw new BadRequestException('You are muted from this channel');
		return true;
	}
	private memberHasRole(member: Member, role: string): boolean {
		if (!member)
			throw new NotFoundException('Member not found, the channel may have been deleted');
		if (member.role != role)
			throw new BadRequestException(`You must be ${role} to do this`);
		return true;
	}
	async newMessage(owner: User, channelId: number, messageData: NewMessageDto) {
		const member = await this.getMemberOfChannel(owner, channelId);
		if (!member)
			throw new NotFoundException('Member not found, the channel may have been deleted');
		this.memberIsAllowed(member);
		const newMessage = this.messagesRepo.create({
			channel: member.channel,
			owner: member,
			gameId: messageData.gameId,
			content: messageData.content
		});
		await this.messagesRepo.save(newMessage);
		this.wsServer.to(`/chat/${channelId}`).emit('chat.message.new', newMessage);
		this.emitToAllMembers(channelId, 'unreadMessage', async (member: Member) => {
			const unreadMessages = await this.getUnreadMessages(member.user, channelId);
			return {
				id: channelId,
				unreadMessages,
			};
		});
	}

	async ackChannel(user: User, channelId: number) {
		const member = await this.getMemberOfChannel(user, channelId);
		if (!member)
			throw new NotFoundException('Member not found, the channel may have been deleted');
		this.memberIsAllowed(member, { mute: true });
		const lastMessage = await this.messagesRepo.findOne({
			where: {
				channel: {
					id: channelId,
				},
			},
			order: {
				createdAt: 'DESC',
			},
			select: {
				id: true,
				createdAt: true,
			},
		});
		if (!lastMessage)
			return null;
		member.lastRead = lastMessage;
		await this.membersRepo.save(member);
	}

	async getMessages(user: User, channelId: number, offset: number = 0): Promise<Message[]> {
		const member = await this.getMemberOfChannel(user, channelId);
		if (!member)
			throw new NotFoundException('Member not found, the channel may have been deleted');
		this.memberIsAllowed(member, { mute: true });
		const messages = await this.messagesRepo.find({
			where: {
				channel: {
					id: channelId,
				},
			},
			order: {
				createdAt: 'ASC',
			},
			relations: {
				owner: { user: true }
			},
			select: {
				id: true,
				gameId: true,
				content: true,
				createdAt: true,
				owner: { user: { id: true, username: true }, role: true, banned: true, left: true, muteTime: true },
			},
		});
		member.lastRead = messages[messages.length - 1];
		await this.membersRepo.save(member);
		return messages;
	}

	async getChannelMembers(channelId: number): Promise<Member[]> {
		const members = await this.membersRepo.find({
			where: {
				channel: {
					id: channelId,
				},
			},
			relations: {
				user: true,
			},
			select: {
				id: true,
				role: true,
				banned: true,
				muteTime: true,
				left: true,
				user: { id: true, username: true },
			},
		});
		return members.filter((member) => !member.left && !member.banned);
	}

	async getChannelInfo(user: User, channelId: number): Promise<ChannelInfo | undefined> {
		const channel = await this.channelsRepo.findOne({
			where: { id: channelId },
			select: {
				id: true,
				name: true,
				directMessage: true,
			}
		})
		if (!channel)
			throw new NotFoundException('Channel not found');
		if (channel.directMessage) {
			const members = await this.getChannelMembers(channelId);
			const otherMember = members.find((member) => (member.user.id != user.id))
			if (!otherMember)
				throw new NotFoundException('Channel not found');
			console.log("getChannelName : ", otherMember.user.username)
			return { id: channel.id, directMessage: true, name: (otherMember.user.username || 'Unknown') };
		}
		return { id: channel.id, name: channel.name, directMessage: false };
	}


	private checkModifyPermissions(requestingMember: Member, modifyMember: Member, options: ModifyMemberDto) {

		if (requestingMember.role === 'regular')
			throw new BadRequestException('You must be owner or admin to do this');
		if (modifyMember.role === 'owner')
			throw new BadRequestException('You can\'t modify owner');
		if (modifyMember.role === 'admin' && requestingMember.role !== 'owner')
			throw new BadRequestException('You can\'t modify admin, only owner can do this');
		if (options.role && options.role === 'owner' && requestingMember.role !== 'owner')
			throw new BadRequestException('You can\'t set owner, only owner can do this');
	}


	async modifyMembers(user: User, channelId: number, memberId: number, options: ModifyMemberDto) {

		const requestingMember = await this.getMemberOfChannel(user, channelId);
		if (!requestingMember)
			throw new NotFoundException('Request member not found');
		const channel = await this.channelsRepo.findOne({
			where: { id: channelId },
			relations: ['members', 'members.user'],
			select: {
				id: true,
				members: {
					id: true,
					role: true,
					banned: true,
					left: true,
					muteTime: true,
					user: {
						id: true,
						username: true,
					}
				}
			}
		});
		if (!channel)
			throw new NotFoundException('Channel not found');
		if (channel.directMessage)
			throw new BadRequestException(`modifyChannel : channeld with id ${channelId} is a direct message channel`)
		const modifyMember = channel.members.find((member) => (member.id == memberId))
		if (!modifyMember)
			throw new NotFoundException('Member not found');
		this.checkModifyPermissions(requestingMember, modifyMember, options);
		if (options.role) {
			if (modifyMember.role == options.role)
				throw new BadRequestException(`modifyMembers : channeld with id ${channelId} : ${memberId} is already ${options.role}`)
			modifyMember.role = options.role
		}
		if (options.ban !== undefined) {
			if (modifyMember.banned == options.ban)
				throw new BadRequestException(`modifyMembers : channeld with id ${channelId} : ${memberId} is already ${options.ban ? 'banned' : 'unbanned'}}`)
			modifyMember.banned = options.ban
		}
		if (options.kick) {
			if (modifyMember.left == options.kick)
				throw new BadRequestException(`modifyMembers : channeld with id ${channelId} : ${memberId} is already ${options.kick ? 'kicked' : 'unkicked'}`)
			modifyMember.left = options.kick
		}
		if (options.mute) {
			modifyMember.muteTime = new Date(options.mute)
		}
		await this.membersRepo.save(modifyMember)
		this.wsServer.to(`/chat/${channelId}`).emit('chat.modify.members', {
			modifyMember: {
				...modifyMember,
				isConnected: this.usersService.isConnected(modifyMember.user.id),
				...this.gameService.userState(modifyMember.user.id),
			}
		})
		this.emitToAllMembers(channelId, 'chat.modify.channel', this.cbEmitAll);
	}

	async modifyChannel(user: User, channelId: number, changeChannelData: ChangeChannelDto) {
		const requestingMember = await this.getMemberOfChannel(user, channelId);
		if (!requestingMember)
			throw new NotFoundException('Member not found, the channel may have been deleted');
		this.memberHasRole(requestingMember, 'owner');
		const channel = await this.channelsRepo.findOne({
			where: { id: channelId },
			select: {
				id: true,
				name: true,
				password: true,
				private: true,
			}
		});
		if (!channel)
			throw new NotFoundException('Channel not found');
		if (channel.directMessage)
			throw new BadRequestException(`modifyChannel : channeld with id ${channelId} is a direct message channel`)
		if (changeChannelData.name && changeChannelData.name === channel.name)
			throw new BadRequestException(`modifyChannel : channeld with id ${channelId} is already named ${changeChannelData.name}`)
		if (changeChannelData.password && changeChannelData.password === channel.password)
			throw new BadRequestException(`modifyChannel : channeld with id ${channelId} is already passworded ${changeChannelData.password}`)
		if (changeChannelData.name)
			channel.name = changeChannelData.name
		if (changeChannelData.password)
			channel.password = changeChannelData.password
		await this.channelsRepo.save(channel)
		this.wsServer.to(`/chat/${channelId}`).emit('chat.modify.channel', { channel });
		this.emitToAllMembers(channelId, 'chat.modify.channel', this.cbEmitAll);

	}

	async emitToAllMembers(channelId: number, event: string, cb: (member: Member, channe?: Channel) => Promise<any>) {
		const channel = await this.getOneChannel(channelId);

		if (!channel)
			return;
		for (const member of channel.members) {
			if (!member.left)
				this.wsServer.to(`/chat/myChannels/${member.user.id}`).emit(event, await cb.bind(this)(member, channel));
		}
	}

	async leaveChannel(user: User, channelId: number) {
		const member = await this.getMemberOfChannel(user, channelId);
		if (!member)
			throw new NotFoundException('Member not found, the channel may have been deleted');
		member.left = true;
		const leftMember = await this.membersRepo.save(member);
		this.wsServer.to(`/chat/${channelId}`).emit('chat.member.leave', { leftMember });
		this.wsServer.to(`/chat/myChannels/${user.id}`).emit('chat.channel.leave', member.channel.id);
		this.emitToAllMembers(channelId, 'chat.modify.channel', this.cbEmitAll);

		const channel = await this.getOneChannel(channelId, user);
		if (!channel) return;

		if (!channel.private) {
			this.wsServer.to('/chat/public').emit('chat.public.update', {
				id: channel.id,
				name: channel.name,
				hasPassword: !!channel.password,
				membersLength: channel.members.filter(member => !member.left).length,
				owner: channel.members.find(member => member.role === 'owner')?.user as ShortUser,
			} as PublicChannel);
		}
	}

	async getMyChannels(user: User): Promise<Channel[]> {
		return await this.channelsRepo.find({
			where: {
				members: {
					user: {
						id: user.id,
					},
					left: false,
				},
				directMessage: false,
			},
			relations: ['members', 'members.user'],
			select: {
				id: true,
				name: true,
				private: true,
				password: true,
				members: {
					id: true,
					user: { id: true, username: true },
					left: true,
				},
			},
			relationLoadStrategy: "query",
		});
	}

	async getOneChannel(channelId: number, user?: User): Promise<Channel | null> {
		return await this.channelsRepo.findOne({
			where: {
				id: channelId,
				members: user ? {
					user: { id: user.id },
				} : undefined,
			},
			relations: ['members', 'members.user'],
			select: {
				id: true,
				name: true,
				private: true,
				password: true,
				members: {
					id: true,
					left: true,
					role: true,
					user: { id: true, username: true },
				},
			},
			relationLoadStrategy: "query",
		});
	}

	getMyDirectMessage(user: User): Promise<Channel[]> {
		return this.channelsRepo.find({
			where: {
				members: {
					user: {
						id: user.id,
					},
					left: false,
				},
				directMessage: true,
			},
			relations: ['members', 'members.user'],
			select: {
				id: true,
				name: true,
				private: true,
				password: true,
				members: {
					id: true,
					user: { id: true, username: true },
				},
			},
			relationLoadStrategy: "query",
		});
	}

	async getUnreadMessages(user: User, channelId: number): Promise<number> {
		const member = await this.membersRepo.findOne({
			where: {
				user: {
					id: user.id,
				},
				channel: {
					id: channelId,
				},
			},
			relations: ['lastRead'],
			select: {
				id: true,
				lastRead: {
					id: true,
				},
			},
		});
		if (!member || !member.lastRead)
			return 0;
		return await this.messagesRepo.count({
			where: {
				channel: {
					id: channelId,
				},
				id: MoreThan(member.lastRead.id),
			},
		});

	}

	async getDMChannel(me: User, friend: Partial<User>): Promise<Channel | null> {
		//console.log("getDMChannel : ", me, friend);
		if (!friend.id || friend.id === me.id)
			return null;
		//console.log("getDMChannel :searching channel");
		return await this.membersRepo.findOne({
			where: {
				user: {
					id: me.id,
				},
				channel: {
					directMessage: true,
					members: {
						user: {
							id: friend.id,
						},
					},
				},
			},
			relations: ['channel', 'channel.members', 'channel.members.user'],
			select: {
				channel: {
					id: true,
					name: true,
					private: true,
					password: true,
					members: {
						id: true,
						user: { id: true, username: true },
					},
				},
			},
		}).then((member) => {
			if (!member)
				return null;
			return member.channel;
		}

		);
	}

	async joinDirectMessage(user: User, targetUser: number) {
		// check if channel exists
		const channel = await this.getDMChannel(user, { id: targetUser });
		//console.log("findChannel : ", channel);
		if (channel)
			return channel.id;
		else {

			const directMessage = {
				name: `directMessage_${user.id}_${targetUser}`,
				private: true,
				password: '',
				directMessage: true,
			}
			const friendUser = await this.usersService.findOne(targetUser);
			if (!friendUser)
				throw new NotFoundException('Friend not found');

			const channelId = await this.createChannel(directMessage);
			//console.log("joinDirectMessage : channel created", channelId)
			await this.joinChannel(user, channelId, { owner: true });
			//console.log("joinDirectMessage : channel joined", channelId)
			await this.joinChannel(user, channelId, { targetUser: friendUser.username });
			//console.log("joinDirectMessage : channel joined", channelId)
			return channelId;
		}
	}
}
