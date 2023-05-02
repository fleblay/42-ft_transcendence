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

	async createChannel(user : User, data : CreateChannelDto) : Promise<void> {
		if (data.private && data.password)
			throw new BadRequestException("Private channel creation data provide a password")

		const channel : Channel = await this.channelsRepo.save({
			name: data.name,
			private: data.private,
			password : data.password,
		})

		const owner : Member = await this.membersRepo.save({
			user,
			channel,
			messages : [],
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
}
