import { SubscribeMessage, WebSocketGateway, WebSocketServer} from '@nestjs/websockets';
//import { Server } from 'ws'
import {Server, Socket } from 'socket.io'

@WebSocketGateway({
	path: '/socket.io/',
	cors: {
		origin: '*',
	},
})
export class EventsGateway {

	@WebSocketServer() server: Server

	@SubscribeMessage('ping')
	onPing(client: Socket, data:any): void
	{
		console.log('ici')
		console.log(data)
		client.emit('pong', {message: 'this is pong'})
	}
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
