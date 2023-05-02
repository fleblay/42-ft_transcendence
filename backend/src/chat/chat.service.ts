import { Inject, Injectable, forwardRef } from '@nestjs/common';
import { Member } from '../model/member.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Channel } from '../model/channel.entity';
import { Message } from '../model/message.entity';
import { UsersService } from '../users/users.service';

@Injectable()
export class ChatService {
	constructor (
		@InjectRepository(Member) private membersRepo: Repository<Member>,
		@InjectRepository(Channel) private channelsRepo: Repository<Channel>,
		@InjectRepository(Message) private messagesRepo: Repository<Message>,
		@Inject(forwardRef(() => UsersService)) private usersService: UsersService,
	) { }

}
