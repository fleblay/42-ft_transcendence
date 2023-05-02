import { BadRequestException, Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { CreateChannelDto } from './dto/create-channel.dto';
import { NewMessageDto } from './dto/new-message.dto';
import { ChatService } from './chat.service';
import { ATGuard } from '../users/guard/access-token.guard';
import { CurrentUser } from '../users/decorators/current-user.decorator';
import { User } from '../model/user.entity';
import { UsersService } from '../users/users.service';
import { Member } from 'src/model/member.entity';

@Controller('chat')
export class ChatController {

	constructor(
		private chatService: ChatService, private userService: UsersService
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
	@Post('channels')
	async createChannel(@CurrentUser() user: User, @Body() body: CreateChannelDto) : Promise<void> {
		const channelId : number = await this.chatService.createChannel(body)
		this.chatService.joinChannel(user, channelId)
	}

	// TODO: Limit the number of messages to 50
	// NOTE: Offset is message id or number?
	@Get('channels/:id/messages')
	getMessages(@Param('id') id: string, @Query('offset') offset: string) {
		const channelId = parseInt(id);
		if (isNaN(channelId))
			throw new BadRequestException('Invalid channel id');
		return this.chatService.getMessages(channelId, parseInt(offset) || 0);
	}

	@Post('channels/:id/messages')
	@UseGuards(ATGuard)
	createMessage(@CurrentUser() user: User, @Param('id') id: string, @Body() body: NewMessageDto) {
		const channelId = parseInt(id);
		if (isNaN(channelId))
			throw new BadRequestException('Invalid channel id');
		this.chatService.newMessage(user, channelId, body);
		return `createMessage ${id} ${JSON.stringify(body)}`
		return {};
	}

	// NOTE: Return password if user is owner and return all members
	@Get('channels/:id/info')
	getChannelInfo(@Param('id') id: string) {
		return `getChannelInfo ${id}`
		return {};
	}

	@Get('channels/:id/members')
	async getChannelMembers(@Param('id') id: string) {
		let members = await this.chatService.getChannelMembers(parseInt(id));
		return members.map(async (member: Member) => ({...member, isConnected: await this.userService.isConnected(member.user.id)}));
	}

}
