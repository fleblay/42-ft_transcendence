import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Server, Socket } from 'socket.io'
import { SavedGame } from 'src/model/saved-game.entity';
import { UsersService } from 'src/users/users.service';
import { Repository } from 'typeorm';
import { GameCluster } from './game-cluster';
import { User } from 'src/model/user.entity';
import { UUID } from '../type';
import {PlayerInputDto} from '../events/dtos/player-input.dto'


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

	findOrCreate(map: number): UUID {
		let game = this.gameCluster.findAvailable()
		if (game === null)
			game = this.gameCluster.createGame();
		return game.GameId
	}

	join(client: Socket, user: User, gameId: UUID): UUID {
		let game = this.gameCluster.findOne(gameId);
		if (!game)
			throw new NotFoundException('Game not found');
		game.addUser(user, client);
		return game.GameId;
	}

	listAll() {
		return this.gameCluster.listAll()
	}

	handlePlayerInput(client: Socket, user: User, data: PlayerInputDto){
		this.gameCluster.findOne(data.gameId)?.applyPlayerInput(user.id, {move: data.move, powerUp: data.powerup})
	}
}
