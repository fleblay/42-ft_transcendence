import { Injectable, NotFoundException, forwardRef, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Server, Socket } from 'socket.io'
import { UsersService } from '../users/users.service';
import { Repository } from 'typeorm';
import { GameCluster } from './game-cluster';
import { User } from '../model/user.entity';
import { UUID, UserState } from '../type';
import { v4 as uuidv4 } from 'uuid';
import { PlayerInputDto } from '../events/dtos/player-input.dto'
import { IgameInfo } from './game';
import { SavedGame } from '../model/saved-game.entity';
import { UserStatus } from '../type';
import { GameOptions } from './game'


@Injectable()
export class GameService {

	private server: Server;
	constructor(
		@InjectRepository(SavedGame) private repo: Repository<SavedGame>,
		private gameCluster: GameCluster,
		@Inject(forwardRef(() => UsersService))
		private usersService: UsersService,
	) { }

	setWsServer(server: Server) {
		this.server = server;
		this.gameCluster.setServer(server)
	}

	create(options: GameOptions): UUID {
		let game = this.gameCluster.createGame(true, options);
		return game.id
	}

	findOrCreate(options: GameOptions): UUID {
		let game = this.gameCluster.findAvailable()
		if (game === null)
			game = this.gameCluster.createGame(false, options);
		return game.id
	}

	join(client: Socket, user: User, gameId: UUID): { gameId: UUID, gameInfo: IgameInfo } {
		let game = this.gameCluster.findOne(gameId);
		if (!game)
			throw new NotFoundException('Game not found');
		const joinType: string = game.addUser(user, client);
		//this.usersService.addConnectedUser(user.id)
		this.server.to(`/player/${user.id}`).emit('page.player', {userId : user.id, event : joinType})
		return { gameId: game.gameId, gameInfo: game.generateGameInfo() };
	}

	listAllCurrent() {
		return this.gameCluster.listAllCurrent()
	}

	findByClient(client: Socket) {
		return this.gameCluster.findByClient(client)
	}

	handlePlayerInput(client: Socket, user: User, data: PlayerInputDto) {
		//console.log("service input handle")
		//console.log("data is : ", data)
		this.gameCluster.findOne(data.gameId)?.applyPlayerInput(user.id, { move: data.move, powerUp: data.powerup })
	}

	userState(id: number): UserState {
		return this.gameCluster.findUserStateById(id)
	}

	userStatus(id: number): UserStatus {
		const allStates = this.gameCluster.findUserStateById(id) as UserState;
		if (allStates.states.length === 0)
			return 'offline'
		else
			return allStates.states[allStates.states.length - 1];

	}

	quitGame(userId: number, gameId: UUID) {
		this.server.to(`/player/${userId}`).emit('page.player', {userId, event: "leave"})
		const game = this.gameCluster.playerQuit(gameId, userId);
		if (game) {
			const savedGame = game.generateSavedGameInfo();
			let saveObject = this.repo.create(savedGame);
			this.repo.save(savedGame);
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
		return fullDB.filter((element: SavedGame) => element.players.find((player) => player.id == id) != undefined);
	}

	async saveFakeGame() {
		const game = new SavedGame()
		const playersList: User[] = await this.usersService.getAll()
		if (playersList.length < 2)
			throw new NotFoundException('Only one useer in DB');
		let randUser1: User = playersList[Math.floor(Math.random() * playersList.length)]
		let randUser2: User = playersList[Math.floor(Math.random() * playersList.length)]

		while (randUser2 == randUser1)
			randUser2 = playersList[Math.floor(Math.random() * playersList.length)]
		let score1 = Math.floor(Math.random() * 5)
		let score2 = 5
		if (Math.random() > 0.5)
			[score1, score2] = [score2, score1]
		game.id = uuidv4();
		game.players = [randUser1, randUser2]
		game.score = [score1, score2]
		game.winner = (score1 > score2) ? randUser1 : randUser2
		let saveObject = this.repo.create(game);
		return this.repo.save(saveObject);
	}

}
//.leftJoinAndSelect("game.players", "players")
//.where("game.id = :gameId", {gameId: "d38c3c7f-8f2f-4808-9645-fce150dcac3d"})
