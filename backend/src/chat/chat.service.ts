import { Inject, Injectable, forwardRef, BadRequestException, NotFoundException} from '@nestjs/common';
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

	async createChannel(data : CreateChannelDto) : Promise<number> {
		if (data.private && data.password)
			throw new BadRequestException("createChannel : Private channel creation data provide a password")

		const channel : Channel = await this.channelsRepo.save({
			name: data.name,
			private: data.private,
			password : data.password,
		})
		return channel.id

	}

	async joinChannel(user : User, channelId: number, options ?: {owner ?: boolean, password ?: string}) : Promise<void> {
		const channel = await this.channelsRepo.findOne({where : {id : channelId}})
			if (!channel)
				throw new BadRequestException(`joinChannel : channel with id ${channelId} does not exist`)
			if (channel.password && (!options?.password || options.password != channel.password))
				throw new BadRequestException(`joinChannel : channel with id ${channelId} is protected and password provided is missing or false`)

		const joiner : Member = await this.membersRepo.save({
			user,
			channel,
			messages : [],
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
				owner: { id: true, user: { id: true, username: true } },
			},
		});
		return messages;
	}

	async getChannelMembers(channelId: number): Promise<Member[]>
	{
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
				user: { id: true, username: true },
			},
		});
		return members;
	}
		

	
}
