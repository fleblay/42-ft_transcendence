import { Module, forwardRef } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Member } from '../model/member.entity';
import { Channel } from '../model/channel.entity';
import { Message } from '../model/message.entity';
import { UsersModule } from '../users/users.module';

@Module({
	imports: [
		TypeOrmModule.forFeature([
			Member,
			Channel,
			Message
		]),
		forwardRef(() => UsersModule),
	],
	providers: [ChatService],
	controllers: [ChatController],
	exports: [ChatService]
})
export class ChatModule { }
