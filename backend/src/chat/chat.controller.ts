import { BadRequestException, Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { CreateChannelDto } from './dto/create-channel.dto';
import { JoinChannelDto } from './dto/join-channel.dto';
import { NewMessageDto } from './dto/new-message.dto';
import { ChatService } from './chat.service';
import { ATGuard } from '../users/guard/access-token.guard';
import { CurrentUser } from '../users/decorators/current-user.decorator';
import { User } from '../model/user.entity';
import { UsersService } from '../users/users.service';
import { Member } from '../model/member.entity';
import { Channel } from '../model/channel.entity';
import { Message } from 'src/model/message.entity';
import { ChangeChannelDto } from './dto/change-channel.dto';
import { ModifyMemberDto } from './dto/modify-member.dto';

@Controller('chat')
@UseGuards(ATGuard)
export class ChatController {

	constructor(
		private chatService: ChatService, private userService: UsersService
	) { }

	// NOTE: DEBUG PURPOSES ONLY !
	@Get('/channels/all')
	getAll(): Promise<Channel[]> {
		return this.chatService.getAllChannels()
	}
	// Return all channels public and protected
// NOTE: A TESTER
	@Get('/channels/public')
	async getAllPublic() {
		const publicChannels = await this.chatService.getAllPublicChannels()
		return publicChannels.map((channel: Channel) => ({
			...channel,
			password: undefined,
			hasPassword: channel.password.length !== 0
		}));
	}

	@Get('/channels/my')
	async getMyChannels(@CurrentUser() user: User){
		const channels = await this.chatService.getMyChannels(user);
		return channels.map((channel: Channel) => ({
			...channel,
			password: undefined,
			hasPassword: channel.password.length !== 0}));
	}


	// NOTE: A TESTER
	// to: /chat emit :chat.new.channel
	@Post('channels/create')
	async createChannel(@CurrentUser() user: User, @Body() body: CreateChannelDto): Promise<void> {
		const channelId: number = await this.chatService.createChannel(body)
		await this.chatService.joinChannel(user, channelId, { owner: true, password: body.password })
	}

	// NOTE: A TESTER
	// to: /chat/${channelId} emit :chat.join.channel
	@Post('channels/:id/join')
	async joinChannel(@CurrentUser() user: User, @Param('id') id: string, @Body() body: JoinChannelDto): Promise<void> {
		const channelId = parseInt(id);
		if (isNaN(channelId))
			throw new BadRequestException('Invalid channel id');
		await this.chatService.joinChannel(user, channelId, { password: body.password, targetUser: body.username })
	}

	// TODO: Limit the number of messages to 50
	// NOTE: Offset is message id or number?
	// a tester
	// NOTE: A TESTER
	@Get('channels/:id/messages')
	getMessages(@CurrentUser() user: User, @Param('id') id: string, @Query('offset') offset: string): Promise<Message[]> {
		const channelId = parseInt(id);
		if (isNaN(channelId))
			throw new BadRequestException('Invalid channel id');
		return this.chatService.getMessages(user, channelId, parseInt(offset) || 0);
	}

	// NOTE: A TESTER
	// to: /chat/${channelId} emit :chat.new.message
	@Post('channels/:id/messages')
	async createMessage(@CurrentUser() user: User, @Param('id') id: string, @Body() body: NewMessageDto): Promise<void> {
		const channelId = parseInt(id);
		if (isNaN(channelId))
			throw new BadRequestException('Invalid channel id');
		await this.chatService.newMessage(user, channelId, body);
	}
	// NOTE: Return password if user is owner and return all members
	@Get('channels/:id/info')
	getChannelInfo(@CurrentUser() user: User, @Param('id') id: string) {
		const channelId = parseInt(id);
		if (isNaN(channelId))
			throw new BadRequestException('Invalid channel id');
		return this.chatService.getChannelInfo(user, channelId)
	}

	// NOTE: A TESTER
	@Get('channels/:id/members')
	async getChannelMembers(@Param('id') id: string) : Promise<Member[]>{
		let members = await this.chatService.getChannelMembers(parseInt(id));
		return members.map((member: Member) =>
		({
			...member,
			isConnected: this.userService.isConnected(member.user.id)
		}));
	}

	// IF KICK
	// to: /chat/${channelId} emit :chat.leave.members -> leaver.id
	// ELSE
	// to: /chat/${channelId} emit :chat.modify.members -> { playerId, username, role, isMuted, isBanned }
	// john
	@Post('channels/:id/members/:playerId')
	async modifyMembers(@CurrentUser() user: User, @Param('id') id: string, @Param('playerId') playerId : string, @Body() body: ModifyMemberDto): Promise<void>  {
		const channelId = parseInt(id);
		if (isNaN(channelId))
			throw new BadRequestException('Invalid channel id');
		const targetId = parseInt(playerId);
		if (isNaN(targetId))
			throw new BadRequestException('Invalid player id');
		await this.chatService.modifyMembers(user, channelId, targetId, body);
		return
	}

	// to: /chat/${channelId} emit :chat.leave.members -> leaver.id
	// john
	@Post('channels/:id/leave')
	async leaveChannel(@CurrentUser() user: User, @Param('id') id: string): Promise<void> {
		this.chatService.leaveChannel(user, parseInt(id));
	}

	//to: /chat/${channelId} emit :chat.modify.channel -> { name, hasPassword }
	// john
	@Post('channels/:id/info')
	async modifyChannel(@CurrentUser() user : User, @Param('id') id: string, @Body() body: ChangeChannelDto) : Promise<void> {
		const channelId = parseInt(id);
		if (isNaN(channelId))
			throw new BadRequestException('Invalid channel id');
		await this.chatService.modifyChannel(user, channelId, body);
	}



}
