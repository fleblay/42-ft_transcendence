import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Server, Socket } from 'socket.io'
import { SavedGame } from 'src/model/saved-game.entity';
import { UsersService } from 'src/users/users.service';
import { Repository } from 'typeorm';
import { GameCluster } from './game-cluster';
import { User } from 'src/model/user.entity';
import { UUID } from '../type';


@Injectable()
export class GameService {

	private server: Server;
	constructor(private usersService: UsersService,
		@InjectRepository(SavedGame) private repo: Repository<SavedGame>,
		private gameCluster: GameCluster) { }

	setWsServer(server: Server) {
		this.server = server;
		this.gameCluster.setServer(server)
	}

	join(client: Socket, user: User, gameId?: UUID): UUID {
		let game;
		if (gameId) {
			game = this.gameCluster.findOne(gameId);
			if (!game)
				throw new NotFoundException('Game not found');
		}
		else
			game = this.gameCluster.findAvailable()
		if (game === null)
			game = this.gameCluster.createGame();

		game.addUser(user, client);
		return game.GameId;
	}

	listAll() {
		return this.gameCluster.listAll()
	}


}
