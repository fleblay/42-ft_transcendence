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
import {PlayerInputDto} from './dtos/player-input.dto'
import {GameService} from '../game/game.service'
import { AuthService } from 'src/users/auth/auth.service';

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

	constructor(private gameService: GameService, private authService: AuthService) {}

	afterInit(server: Server){
		this.gameService.setWsServer(server)
	}

	async handleConnection(socket: Socket) {
		const bearerToken = socket.handshake.auth?.token
		const foundUser =  await this.authService.validateToken(bearerToken)

		if (foundUser)
			//console.log("New Connection User:", foundUser.username)
	}

	async handleDisconnect(socket: Socket) {
		const bearerToken = socket.handshake.auth?.token
		const foundUser =  await this.authService.validateToken(bearerToken)
		if (foundUser)
			//console.log("Disconnect User:", foundUser.username)
	}

	@SubscribeMessage('ping')
	handleMessage(@ConnectedSocket() client: Socket, @EventUserDecorator() user: User, @MessageBody() data:any): void
	{
		client.broadcast.emit('message', `Server : new challenger`)
		//client.emit('message', {log: 'data is', data}) //
		//client.emit('message', user)
	}

	@SubscribeMessage('game.join')
	handleJoin(@ConnectedSocket() client: Socket, @EventUserDecorator() user: User, @MessageBody() data:GameJoinDto): { gameId?: string, error?: string, user?: User}
	{
		console.log("New join event")
		try {
			const gameId = this.gameService.join(client, user, data.gameId)
			console.log("Game id is : ", gameId);
			return {gameId, user};
		}
		catch (e) {
			return {error: e.message as string}
		}
	}

	@SubscribeMessage('game.play.move')
	handlePlayerInput(@ConnectedSocket() client: Socket, @EventUserDecorator() user: User, @MessageBody() data:PlayerInputDto): void
	{
		this.gameService.handlePlayerInput(client, user, data)
	}

	@SubscribeMessage('createLobby')
	createLobby(client: Socket):void
	{
		client.broadcast.emit('newLobby', 'Lobby id 1');
	}
}
