import { Inject, Injectable, forwardRef, BadRequestException, NotFoundException } from '@nestjs/common';
import { Member } from '../model/member.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Channel } from '../model/channel.entity';
import { Message } from '../model/message.entity';
import { UsersService } from '../users/users.service';
import { Server } from 'socket.io'
import { CreateChannelDto } from './dto/create-channel.dto';
import { User } from '../model/user.entity';
import { NewMessageDto } from './dto/new-message.dto';

@Injectable()
export class ChatService {

	private wsServer: Server;
	constructor(
		@InjectRepository(Member) private membersRepo: Repository<Member>,
		@InjectRepository(Channel) private channelsRepo: Repository<Channel>,
		@InjectRepository(Message) private messagesRepo: Repository<Message>,
		@Inject(forwardRef(() => UsersService)) private usersService: UsersService,
	) { }

	setWsServer(server: Server) {
		this.wsServer = server;
	}

	async createChannel(data: CreateChannelDto): Promise<number> {
		if (data.private && data.password)
			throw new BadRequestException("createChannel : Private channel creation data provide a password")

		const channel: Channel = await this.channelsRepo.save({
			name: data.name,
			private: data.private,
			password: data.password,
		})
		return channel.id

	}

	async joinChannel(user: User, channelId: number, options?: { owner?: boolean, password?: string, targetUser?: string }): Promise<void> {
		const channel = await this.channelsRepo.findOne({
			where: { id: channelId },
			relations: { members: { user: true } },
			select: { id: true, private: true, members: { role: true, banned: true, kicked: true, user: { id: true } } }
		})
		let addedUser: User = user
		if (options?.targetUser) {
			try {
				addedUser = await this.usersService.findOneByUsername(options.targetUser)
			} catch (e) {
				throw new BadRequestException(`joinChannel : the username ${options.targetUser} matches no user in database`)
			}
		}
		if (!channel)
			throw new BadRequestException(`joinChannel : channel with id ${channelId} does not exist`)
		if (channel.password && (!options?.password || options.password != channel.password))
			throw new BadRequestException(`joinChannel : channel with id ${channelId} is protected and password provided is missing or false`)
		if (channel.private && channel.members.find((member) => (member.user.id == user.id) && ((member.role == "owner") || (member.role == "admin"))))
			throw new BadRequestException(`joinChannel : channel with id ${channelId} is private, and you are not an admin or the owner of the channel`)
		if (channel.members.find((member) => (member.user.id == addedUser.id) && member.banned))
			throw new BadRequestException(`joinChannel : channeld with id ${channelId} : ${addedUser} is banned from the channel`)
		if (channel.members.find((member) => (member.user.id == addedUser.id) && !member.banned && !member.kicked))
			throw new BadRequestException(`joinChannel : channeld with id ${channelId} : ${addedUser} is already in the channel`)
		if (channel.members.find((member) => (member.user.id == addedUser.id) && member.kicked)) {
			const kickedMember = channel.members.find((member) => member.user.id == addedUser.id)
			kickedMember.kicked = false
			this.membersRepo.save(kickedMember)
		}

		const joiner: Member = await this.membersRepo.save({
			user: addedUser,
			channel,
			messages: [],
			role: (options?.owner) ? "owner" : "regular"
		})
	}

	async newMessage(owner: User, channelId: number, messageData: NewMessageDto) {
		const channel = await this.channelsRepo.findOneBy({ id: channelId });
		if (!channel)
			throw new NotFoundException('Channel not found');
		const newMessage = this.messagesRepo.create({
			channel,
			owner,
			gameId: messageData.gameId,
			content: messageData.content
		});
		await this.messagesRepo.save(newMessage);
		this.wsServer.to(`/chat/${channelId}`).emit('chat.newMessage', messageData);
	}

	async getMessages(channelId: number, offset: number = 0): Promise<Message[]> {
		const channel = await this.channelsRepo.findOneBy({ id: channelId });
		if (!channel)
			throw new NotFoundException('Channel not found');
		// TODO: Limit the number of messages to 50
		const messages = await this.messagesRepo.find({
			where: {
				channel: {
					id: channelId,
				},
			},
			order: {
				createdAt: 'DESC',
			},
			relations: {
				owner: { user: true }
			},
			select: {
				id: true,
				gameId: true,
				content: true,
				createdAt: true,
				owner: { user: { id: true, username: true } },
			},
		});
		return messages;
	}
}
