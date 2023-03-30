import {ConnectedSocket, SubscribeMessage, WebSocketGateway, WebSocketServer, MessageBody } from '@nestjs/websockets';
import {UseGuards, UseInterceptors} from '@nestjs/common';
import {Server, Socket } from 'socket.io'
import {EventGuard} from './guards/event.guard'
import {WebSocketUserInterceptor} from './interceptors/WebSocketUser.interceptor'
import {EventUserDecorator} from './decorators/EventUser.decorator'
import {User} from '../model/user.entity'

@WebSocketGateway({
	path: '/socket.io/',
	cors: {
		origin: '*',
	},
})

//@UseGuards(EventGuard)
// Adds client info into data of message -> Needed for EventUserDecorator
@UseInterceptors(WebSocketUserInterceptor)
export class EventsGateway {

	@WebSocketServer() server: Server

	@SubscribeMessage('ping')
	handleMessage(@ConnectedSocket() client: Socket, @EventUserDecorator() user: User, @MessageBody() data:any): void
	{
		client.broadcast.emit('message', `Server : new challenger`)
		//client.emit('message', {log: 'data is', data}) //
		//client.emit('message', user)
	}

	@SubscribeMessage('createLobby')
	createLobby(client: Socket):void
	{
		client.broadcast.emit('newLobby', 'Lobby id 1');
	}
}
