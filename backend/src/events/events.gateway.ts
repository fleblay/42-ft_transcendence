import { SubscribeMessage, WebSocketGateway, WebSocketServer} from '@nestjs/websockets';
import { Server } from 'ws'

@WebSocketGateway()
export class EventsGateway {

	@WebSocketServer() server: Server

	@SubscribeMessage('gameinfo')
	handleMessage(client: any, data: any): string {
		console.log(data)
		this.server.clients.forEach((c) => {c.send('hi all ' + this.server.clients.size)})
		return 'Hello world!!';
	}
}
