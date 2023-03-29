import {ConnectedSocket, SubscribeMessage, WebSocketGateway, WebSocketServer} from '@nestjs/websockets';
import {UseGuards} from '@nestjs/common';
import {Server, Socket } from 'socket.io'
import {EventGuard} from './guards/event.guard'

@WebSocketGateway({
	path: '/socket.io/',
	cors: {
		origin: '*',
	},
})


export class EventsGateway {

	@WebSocketServer() server: Server

	@UseGuards(EventGuard)
	@SubscribeMessage('ping')
	handleMessage(client: Socket, data:any): void
	{
		client.broadcast.emit('message', `Server : new challenger`)
		client.emit('message', `Acknowledgde connection from ${client.handshake.auth.token}`)
	}

	/*
	@SubscribeMessage('createLobby')
	createLobby(
	*/
}

/*
@WebSocketGateway()
export class EventsGateway {

	@WebSocketServer() server: Server

	@SubscribeMessage('gameinfo')
	handleMessage(client: any, data: any): string {
		console.log(data)
		this.server.clients.forEach((c) => {c.send('hi all ' + this.server.clients.size)})
		return 'Hello world!!';
	}

	@SubscribeMessage('keyPress')
	handleKey(client: any, data: any) {
		console.log(data)
	}
}
*/
