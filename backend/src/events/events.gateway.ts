import {
	ConnectedSocket,
	SubscribeMessage,
	WebSocketGateway,
	WebSocketServer,
	MessageBody,
	OnGatewayInit,
	OnGatewayConnection,
	OnGatewayDisconnect
} from '@nestjs/websockets';
import {UseGuards, UseInterceptors} from '@nestjs/common';
import {Server, Socket } from 'socket.io'
import {EventGuard} from './guards/event.guard'
import {WebSocketUserInterceptor} from './interceptors/WebSocketUser.interceptor'
import {EventUserDecorator} from './decorators/EventUser.decorator'
import {User} from '../model/user.entity'
import {GameJoinDto} from './dtos/game-join.dto'
import {GameService} from '../game/game.service'

@WebSocketGateway({
	path: '/socket.io/',
	cors: {
		origin: '*',
	},
})

//@UseGuards(EventGuard)
// Adds client info into data of message -> Needed for EventUserDecorator
@UseInterceptors(WebSocketUserInterceptor)
export class EventsGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {

	@WebSocketServer() server: Server

	constructor(private gameService: GameService) {}

	afterInit(server: Server){
		this.gameService.setWsServer(server)
	}

	handleConnection(@EventUserDecorator() user : User) {
		console.log('New connection from : ', user.username)
	}

	handleDisconnect(@EventUserDecorator() user : User) {
		console.log('End of connection from : ', user.username)
	}

	@SubscribeMessage('ping')
	handleMessage(@ConnectedSocket() client: Socket, @EventUserDecorator() user: User, @MessageBody() data:any): void
	{
		client.broadcast.emit('message', `Server : new challenger`)
		//client.emit('message', {log: 'data is', data}) //
		//client.emit('message', user)
	}

	@SubscribeMessage('game.join')
	handleJoin(@ConnectedSocket() client: Socket, @EventUserDecorator() user: User, @MessageBody() data:GameJoinDto): string
	{
		console.log("New join event")
		const gameId = this.gameService.join(client, user , data.gameId)
		console.log("Game id is : ", gameId);
		return gameId;
	}

	@SubscribeMessage('createLobby')
	createLobby(client: Socket):void
	{
		client.broadcast.emit('newLobby', 'Lobby id 1');
	}
}
