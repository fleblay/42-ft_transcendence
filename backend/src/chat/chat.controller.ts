import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { CreateChannelDto } from './dto/create-channel.dto';
import { NewMessageDto } from './dto/new-message.dto';

@Controller('chat')
export class ChatController {

	// Return all channels public and protected
	@Get('/channels/public')
	getAllPublic() {
		return 'getAllPublic';
		return [];
	}

	@Post('channels')
	createChannel(@Body() body: CreateChannelDto) {
		return {};
	}

	// TODO: Limit the number of messages to 50
	// NOTE: Offset is message id or number?
	@Get('channels/:id/messages')
	getMessages(@Param('id') id: string, @Query('offset') offset: string) {
		return `getMessages ${id} ${offset}`
		return {};
	}

	@Post('channels/:id/messages')
	createMessage(@Param('id') id: string, @Body() body: NewMessageDto) {
		return `createMessage ${id} ${body}`
		return {};
	}

	// NOTE: id is a string, dont forget to convert it to number
	@Get('channels/:id')
	getChannel(@Param('id') id: string) {
		return {};
	}
}
