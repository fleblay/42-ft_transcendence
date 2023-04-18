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
import { UsersService } from '../users/users.service'

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

	constructor(private gameService: GameService, private authService: AuthService, private userServices: UsersService) {
		setInterval(() => {
			const info = this.connectedSockets.map((e) => {
				return e.username
			})
			console.log("\x1b[33mSockets info are : \x1b[0m", info.join('-'))
		}, 5000)
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
		this.userServices.addConnectedUser(foundUser.id)
	}

	async handleDisconnect(socket: Socket) {
		const bearerToken = socket.handshake.auth?.token
		console.log("event gateway handleDisconnect")
		const foundUser = await this.authService.decodeToken(bearerToken)

		if (foundUser) {
			console.log("Disconnect User:", foundUser.username)
			this.userServices.disconnect(foundUser.id)
		}
		const currentGame = this.gameService.findByClient(socket)
		if (currentGame && foundUser)
			this.gameService.quitGame(foundUser.id, currentGame.id)

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
	create(@ConnectedSocket() client: Socket, @EventUserDecorator() user: User, @MessageBody() data: GameCreateDto):  string {
		console.log("New create event")
		this.updateSocket(client, "gamecreate")
		try {
			const gameId = this.gameService.create(data.map)
			//const gameId = this.gameService.create(data[0].map)
			//console.log("Game id is : ", gameId);
			return gameId
		}
		catch (e) {
			return e.message
		}
	}

	@SubscribeMessage('game.findOrCreate')
	findOrCreate(@ConnectedSocket() client: Socket, @EventUserDecorator() user: User, @MessageBody() data: GameCreateDto): string {
		console.log("New findOrCreate event")
		this.updateSocket(client, "findOrCreate")
		try {
			// TODO: data[0] is a circular object, need to find a way to fix it
			/*
			<ref *1> { '0': [Circular *1] }
			*/
			console.log('trying to find or create game', data)
			//const gameId = this.gameService.findOrCreate(data[0].map)
			const gameId = this.gameService.findOrCreate(data.map)
			console.log('After log', gameId)
			//console.log("Game id is : ", gameId);
			return gameId
		}

		catch (e) {
			return e.message
		}
	}

	@SubscribeMessage('game.join')
	handleJoin(@ConnectedSocket() client: Socket, @EventUserDecorator() user: User, @MessageBody() data: GameJoinDto): string {
		console.log("New join event")
		this.updateSocket(client, "join")

		try {
			const { gameId, gameInfo } = this.gameService.join(client, user, data.gameId)
			//console.log("Game id is : ", gameId);
			console.log("join event ok so far")
			return JSON.stringify({ gameId, gameInfo });
		}
		catch (e) {
			return e.message
		}
	}

	@SubscribeMessage('game.play.move')
	handlePlayerInput(@ConnectedSocket() client: Socket, @EventUserDecorator() user: User, @MessageBody() data: PlayerInputDto): void {
		console.log("gateway input handle")
		this.updateSocket(client, "playerInput")
		this.gameService.handlePlayerInput(client, user, data)
	}

	@SubscribeMessage('createLobby')
	createLobby(client: Socket): void {
		this.updateSocket(client, "Lobby")
		client.broadcast.emit('newLobby', 'Lobby id 1');
	}
}
