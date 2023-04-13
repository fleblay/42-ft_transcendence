import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Server, Socket } from 'socket.io'
import { UsersService } from 'src/users/users.service';
import { Repository } from 'typeorm';
import { GameCluster } from './game-cluster';
import { User } from 'src/model/user.entity';
import { UUID } from '../type';
import { PlayerInputDto } from '../events/dtos/player-input.dto'
import { IgameInfo } from './game';
import { SavedGame } from '../model/saved-game.entity';
import { Game } from './game';

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

	create(map: number): UUID {
		let game = this.gameCluster.createGame(true);
		return game.id
	}

	findOrCreate(map: number): UUID {
		let game = this.gameCluster.findAvailable()
		if (game === null)
			game = this.gameCluster.createGame();
		return game.id
	}

	join(client: Socket, user: User, gameId: UUID): { gameId: UUID, gameInfo: IgameInfo } {
		let game = this.gameCluster.findOne(gameId);
		if (!game)
			throw new NotFoundException('Game not found');
		game.addUser(user, client);
		this.usersService.addConnectedUser(user.id)
		return { gameId: game.id, gameInfo: game.generateGameInfo() };
	}

	listAll() {
		return this.gameCluster.listAll()
	}

	handlePlayerInput(client: Socket, user: User, data: PlayerInputDto) {
		console.log("service input handle")
		console.log("data is : ", data)
		this.gameCluster.findOne(data.gameId)?.applyPlayerInput(user.id, { move: data.move, powerUp: data.powerup })
	}

	userState(id: number): { state: string, gameId?: UUID } {
		return this.gameCluster.findUserStateById(id)
	}

	saveGame(game: Game, gameId: UUID) {
		if (!game)
			throw new NotFoundException('Game not found');
		const savedGame = new SavedGame();
		savedGame.id = gameId;
		savedGame.players = game.players.map(player => player.user);
		savedGame.score = game.players.map(player => player.score);
		console.log("savedGame", savedGame);
		this.repo.save(savedGame);
	}

	quitGame(Userid: number, gameId: UUID) {
		console.log("game", this.gameCluster.findOne(gameId));
		this.usersService.disconnect(Userid)
		const game = this.gameCluster.destroyGame(gameId, Userid);
		console.log("game", game)
		if (game)
			return this.saveGame(game, gameId);
		else
			return "null"
	}

	getListGames(page: number) {
		return this.repo.find({
			order: {
				date: 'DESC'
			},
			take: 10,
			skip: page * 10
		})
	}

}
