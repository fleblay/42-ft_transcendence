import { SubscribeMessage, WebSocketGateway, WebSocketServer} from '@nestjs/websockets';
import { Server } from 'ws'

@WebSocketGateway()
export class EventsGateway {

	@WebSocketServer() server: Server

	@SubscribeMessage('gameinfo')
	handleMessage(client: any, data: any): string {
		console.log(data)
		return 'Hello world!!';
	}
}
