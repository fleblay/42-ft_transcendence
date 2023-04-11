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
import { UseGuards, UseInterceptors } from '@nestjs/common';
import { Server, Socket } from 'socket.io'
import { EventGuard } from './guards/event.guard'
import { WebSocketUserInterceptor } from './interceptors/WebSocketUser.interceptor'
import { EventUserDecorator } from './decorators/EventUser.decorator'
import { User } from '../model/user.entity'
import { GameJoinDto } from './dtos/game-join.dto'
import { PlayerInputDto } from './dtos/player-input.dto'
import { GameService } from '../game/game.service'
import { GameCreateDto } from './dtos/game-create.dto';
import { AuthService } from 'src/users/auth/auth.service';
import { IgameInfo } from 'src/game/game';

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
	private socketInfo: { socketId: string, username: string }[] = []

	constructor(private gameService: GameService, private authService: AuthService) {
		setInterval(() => { console.log("Sockets info are : ", this.socketInfo) }, 10000)
	}


	afterInit(server: Server) {
		this.gameService.setWsServer(server)
	}

	async handleConnection(socket: Socket) {
		const bearerToken = socket.handshake.auth?.token
		const foundUser = await this.authService.validateAccessToken(bearerToken)

		if (!foundUser)
			return
		console.log("New Connection User:", foundUser.username)
		console.log("handleConnection headers is : ", socket.request.headers)
		this.socketInfo.push({ socketId: socket.id, username: foundUser.username })
	}

	async handleDisconnect(socket: Socket) {
		const bearerToken = socket.handshake.auth?.token
		const foundUser = await this.authService.decodeToken(bearerToken)

		if (foundUser)
			console.log("Disconnect User:", foundUser.username)
		const toRemove = this.socketInfo.findIndex((e) => e.socketId == socket.id)
		if (toRemove != -1) {
			console.log("Removing Disconnected socket:", socket.id)
			this.socketInfo.splice(toRemove, 1)
		}
	}

	@SubscribeMessage('ping')
	handleMessage(@ConnectedSocket() client: Socket, @EventUserDecorator() user: User, @MessageBody() data: any): void {
		client.broadcast.emit('message', `Server : new challenger`)
	}

	@SubscribeMessage('goodbye')
	goodbyMessage(@ConnectedSocket() client: Socket, @EventUserDecorator() user: User, @MessageBody() data: any): void {
		client.broadcast.emit('message', `Server : a challenger has left`)
	}

	@SubscribeMessage('game.create')
	create(@ConnectedSocket() client: Socket, @EventUserDecorator() user: User, @MessageBody() data: GameCreateDto): { gameId: string } | { error: string } {
		console.log("New create event")
		try {
			const gameId = this.gameService.create(data[0].map)
			console.log("Game id is : ", gameId);
			return { gameId };
		}
		catch (e) {
			return { error: e.message as string }
		}
	}

	@SubscribeMessage('game.findOrCreate')
	findOrCreate(@ConnectedSocket() client: Socket, @EventUserDecorator() user: User, @MessageBody() data: GameCreateDto): { gameId: string } | { error: string } {
		console.log("New findOrCreate event")
		try {
			const gameId = this.gameService.findOrCreate(data[0].map)
			console.log("Game id is : ", gameId);
			return { gameId };
		}
		catch (e) {
			return { error: e.message as string }
		}
	}

	@SubscribeMessage('game.join')
	handleJoin(@ConnectedSocket() client: Socket, @EventUserDecorator() user: User, @MessageBody() data: GameJoinDto): { gameId: string, gameInfo: IgameInfo } | { error: string } {
		console.log("New join event")
		try {
			const { gameId, gameInfo } = this.gameService.join(client, user, data[0].gameId)
			console.log("Game id is : ", gameId);
			return { gameId, gameInfo };
		}
		catch (e) {
			return { error: e.message as string }
		}
	}

	@SubscribeMessage('game.play.move')
	handlePlayerInput(@ConnectedSocket() client: Socket, @EventUserDecorator() user: User, @MessageBody() data: PlayerInputDto): void {
		console.log("gateway input handle")
		this.gameService.handlePlayerInput(client, user, data[0])
	}

	@SubscribeMessage('createLobby')
	createLobby(client: Socket): void {
		client.broadcast.emit('newLobby', 'Lobby id 1');
	}
}
