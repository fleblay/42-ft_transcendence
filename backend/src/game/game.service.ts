import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Server, Socket } from 'socket.io'
import { SavedGame } from 'src/model/saved-game.entity';
import { UsersService } from 'src/users/users.service';
import { Repository } from 'typeorm';

@Injectable()
export class GameService {

	private server: Server;
	
	constructor(private usersService: UsersService, @InjectRepository(SavedGame) private repo: Repository<SavedGame>){}

	setWsServer(server: Server) {
		this.server = server;
	}

	join(client: Socket) {

	}
}
