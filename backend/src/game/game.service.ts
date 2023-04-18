import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Server, Socket } from 'socket.io'
import { UsersService } from '../users/users.service';
import { Repository } from 'typeorm';
import { GameCluster } from './game-cluster';
import { User } from '../model/user.entity';
import { UUID } from '../type';
import { v4 as uuidv4 } from 'uuid';
import { PlayerInputDto } from '../events/dtos/player-input.dto'
import { IgameInfo } from './game';
import { SavedGame } from '../model/saved-game.entity';

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
		return { gameId: game.gameId, gameInfo: game.generateGameInfo() };
	}

	listAll() {
		return this.gameCluster.listAll()
	}

	findByClient(client: Socket) {
		return this.gameCluster.findByClient(client)
	}

	handlePlayerInput(client: Socket, user: User, data: PlayerInputDto) {
		//console.log("service input handle")
		//console.log("data is : ", data)
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
			this.repo.save(saveObject);
			return "Succes in leaving and saving game as last user"
		}
		else
			return "Success in leaving game, a user is still inside";
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
		return fullDB.filter((element) => element.players[0].id == id || element.players[1] .id == id)
	}

	async saveFakeGame() {
		const game = new SavedGame()
		const playersList : User[] = await this.usersService.getAll()
		if (playersList.length < 2)
			throw new NotFoundException('Only one useer in DB');
		let randUser1: User = playersList[Math.floor(Math.random() * playersList.length)]
		let randUser2: User = playersList[Math.floor(Math.random() * playersList.length)]

		while (randUser2 == randUser1)
			randUser2 = playersList[Math.floor(Math.random() * playersList.length)]
		const score1 = Math.floor(Math.random() * 6)
		const score2 = 5 - score1
		game.id = uuidv4();
		game.players = [randUser1, randUser2]
		game.score = [score1, score2]
		game.winner = (score1 > score2) ? randUser1 : randUser2
		console.log('game info is now', game)
		let saveObject = this.repo.create(game);
			return this.repo.save(saveObject);
	}

}
//.leftJoinAndSelect("game.players", "players")
//.where("game.id = :gameId", {gameId: "d38c3c7f-8f2f-4808-9645-fce150dcac3d"})
