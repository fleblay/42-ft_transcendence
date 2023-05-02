import { BadRequestException, Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { CreateChannelDto } from './dto/create-channel.dto';
import { JoinChannelDto } from './dto/join-channel.dto';
import { NewMessageDto } from './dto/new-message.dto';
import { ChatService } from './chat.service';
import { ATGuard } from '../users/guard/access-token.guard';
import { CurrentUser } from '../users/decorators/current-user.decorator';
import { User } from '../model/user.entity';
import { Message } from '../model/message.entity';

@Controller('chat')
export class ChatController {

	constructor(
		private chatService: ChatService
	) { }

	// NOTE: DEBUG PURPOSES ONLY !
	@Get('/channels/ALL')
	getAll() {
		return [];
	}
	// Return all channels public and protected
	@Get('/channels/public')
	getAllPublic() {
		return 'getAllPublic';
	}

	@UseGuards(ATGuard)
	@Post('channel/create')
	async createChannel(@CurrentUser() user: User, @Body() body: CreateChannelDto): Promise<void> {
		const channelId: number = await this.chatService.createChannel(body)
		this.chatService.joinChannel(user, channelId, { owner: true, password: body.password })
	}

	@UseGuards(ATGuard)
	@Post('channel/join')
	async joinChannel(@CurrentUser() user: User, @Body() body: JoinChannelDto): Promise<void> {
		this.chatService.joinChannel(user, body.id, { password: body.password, targetUser: body.username })
	}

	// TODO: Limit the number of messages to 50
	// NOTE: Offset is message id or number?
	@Get('channels/:id/messages')
	getMessages(@Param('id') id: string, @Query('offset') offset: string): Promise<Message[]> {
		const channelId = parseInt(id);
		if (isNaN(channelId))
			throw new BadRequestException('Invalid channel id');
		return this.chatService.getMessages(channelId, parseInt(offset) || 0);
	}

	@Post('channels/:id/messages')
	@UseGuards(ATGuard)
	createMessage(@CurrentUser() user: User, @Param('id') id: string, @Body() body: NewMessageDto): void {
		const channelId = parseInt(id);
		if (isNaN(channelId))
			throw new BadRequestException('Invalid channel id');
		this.chatService.newMessage(user, channelId, body);
	}
	// NOTE: Return password if user is owner and return all members
	@Get('channels/:id/info')
	getChannelInfo(@Param('id') id: string) {
		return `getChannelInfo ${id}`
		return {};
	}
}
