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

type SocketInfo = {
	id: string,
	username: string,
	userId: number,
	actions: string[]
}

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
	private connectedSockets: SocketInfo[] = []

	constructor(private gameService: GameService, private authService: AuthService) {
		setInterval(() => { console.log("\x1b[33mSockets info are : \x1b[0m", this.connectedSockets) }, 5000)
	}

	updateSocket(socket: Socket, action: string): void {
		const toUpdate = this.connectedSockets.find((e: SocketInfo) => e.id == socket.id)
		if (toUpdate) {
			toUpdate.actions.push(action)
		}
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
		this.connectedSockets.push({ id: socket.id, username: foundUser.username, userId: foundUser.id, actions: ["connection"] })
	}

	async handleDisconnect(socket: Socket) {
		const bearerToken = socket.handshake.auth?.token
		const foundUser = await this.authService.decodeToken(bearerToken)

		if (foundUser)
			console.log("Disconnect User:", foundUser.username)
		const toRemove = this.connectedSockets.findIndex((e) => e.id == socket.id)
		if (toRemove != -1) {
			console.log("Removing Disconnected socket:", socket.id)
			this.connectedSockets.splice(toRemove, 1)
		}
	}

	@SubscribeMessage('ping')
	handleMessage(@ConnectedSocket() client: Socket, @EventUserDecorator() user: User, @MessageBody() data: any): void {
		client.broadcast.emit('message', `Server : new challenger`)
		this.updateSocket(client, "ping")
	}

	@SubscribeMessage('game.create')
	create(@ConnectedSocket() client: Socket, @EventUserDecorator() user: User, @MessageBody() data: GameCreateDto): { gameId: string } | { error: string } {
		console.log("New create event")
		this.updateSocket(client, "gamecreate")
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
		this.updateSocket(client, "findOrCreate")
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
		this.updateSocket(client, "join")
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
		this.updateSocket(client, "playerInput")
		this.gameService.handlePlayerInput(client, user, data[0])
	}

	@SubscribeMessage('createLobby')
	createLobby(client: Socket): void {
		this.updateSocket(client, "Lobby")
		client.broadcast.emit('newLobby', 'Lobby id 1');
	}
}
