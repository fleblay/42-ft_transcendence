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
		//this.usersService.addConnectedUser(user.id)
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

	quitGame(Userid: number, gameId: UUID) {
		const gameInfo = this.gameCluster.playerQuit(gameId, Userid);
		//console.log("game", this.gameCluster.findOne(gameId));
		console.log("game", gameInfo)
		if (gameInfo) {
			let saveObject = this.repo.create(gameInfo);
			return this.repo.save(saveObject);
		}
		else
			return null;
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

	async getListGamesByUser(id: number) {
		const fullDB = await this.repo.createQueryBuilder("game")
			.leftJoin("game.players", "player")
			.addSelect(['player.id', 'player.username'])
			.getMany()
		return fullDB.filter((element) => element.players[0].id == id || element.players[1] .id== id)
	}
}
//.leftJoinAndSelect("game.players", "players")
//.where("game.id = :gameId", {gameId: "d38c3c7f-8f2f-4808-9645-fce150dcac3d"})
