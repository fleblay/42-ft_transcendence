import { Injectable } from '@nestjs/common';
import { Game, Player, GameOptions } from './game';
import { v4 as uuidv4 } from 'uuid';
import { CurrentGame, SocketId, UUID, UserState, UserStatus } from '../type';
import { Server, Socket } from 'socket.io'
import { GameStatus } from './game';
import { User } from 'src/model/user.entity';

//server.to(gameId).emit('message')


//import { Map } from 'immutable';

@Injectable()
export class GameCluster {
	gamesMap: Map<UUID, Game> = new Map<UUID, Game>();
	private server: Server

	constructor() {
		setInterval(() => {
			/*
			const info = []
			this.gamesMap.forEach((e) => {
				info.push(e.players.map((e) => e.user.id).join('-'))
			})
			*/
			//console.log("This is the game cluster", info)
		}, 5000)
	}

	setServer(newserver: Server) {
		this.server = newserver
	}

	createGame(privateGame: boolean = false, options : GameOptions = {}): Game {
		const game = new Game(this.generateGameId(), this.server, privateGame, options);
		//const game = new Game(this.generateGameId(), this.server, privateGame, options);
		this.gamesMap.set(game.id, game);
		return game;
	};

	findOne(gameId: UUID) {
		return this.gamesMap.get(gameId)
	}

	findAvailable(user: User): Game | null {
		for (const game of this.gamesMap.values()) {
			if (!game.privateGame && game.freeSlot && game.status === GameStatus.waiting && !game.players.find((player) => player.user.id === user.id))
				return game;
		}
		return null;
	}

	findByClient(client: Socket): Game | null {
		for (const game of this.gamesMap.values()) {
			if (game.players.find((player) => player.clientId === client.id))
				return game;
		}
		return null;
	}

	listAllCurrent() {
		const ar: CurrentGame[] = []
		this.gamesMap.forEach((game, gameId) => {
			if (!game.privateGame && (game.status === GameStatus.playing || game.status === GameStatus.start)) {
				ar.push({
					id: gameId,
					players: game.players.map((player) => ({
						id: player.user.id,
						username: player.user.username as string,
						score: player.score,
					})),
					viewers: game.viewers.length,
				});
			}
		})
		return ar;
	}

	private generateGameId(): UUID {
		return uuidv4();
	}

	findUserStateById(id: number): UserState {
		let states: UserStatus[] = []
		let gameIds: UUID[] = []
		for (const game of this.gamesMap.values()) {
			if (!game.players)
				continue
			if (game.players.find(player => player.user.id === id && player.leaving === false)) {
				states.push("ingame")
				gameIds.push(!game.privateGame ? game.id : "private")
			}
			if (game.viewers.find(viewer => viewer.user.id === id)) {
				states.push("watching")
				gameIds.push(!game.privateGame ? game.id : "private")
			}
		}
		return { states, gameIds }
	}

	private getClientFromSocketId(socketId: SocketId): Socket | null {
		const sockets = this.server.sockets.sockets;
		return (sockets.get(socketId) || null);
	}

	/**
	 * If a player leave. Set his score to -42 and the other player to 5
	 * @param game Game
	 * @param quitter User who rage quit
	 * @returns void
	 */
	rageQuit(game: Game, quitter: Player) {
		if (!quitter) {
			console.error("GameCluster: rageQuit: quitter not found");
			return;
		}
		quitter.score = -42;
		game.players.forEach(player => {
			if (player.user.id !== quitter.user.id)
				player.score = game.victoryRounds;
		});
	}

	/*
		Waiting
		- 1 player: delete game: remove event

		Start | Playing
		- 1 player: rage quit : end

		End
		- 1 player: set leaving to true
		- 2 players: delete : save game

	*/
	playerQuit(gameId: UUID, userId: number): Game | null {
		const game = this.gamesMap.get(gameId);

		if (!game) return null;
		//if (!game.players) return;

		const player = game.players.find(player => player.user.id === userId);
		const viewer = game.viewers.find(viewer => viewer.user.id === userId);
		const userToFind = player || viewer
		if (!userToFind || (player && viewer)) {
			console.error("playerQuit: player and viewer not found or both found");
			return null;
		}
		const client = this.getClientFromSocketId(userToFind.clientId);

		if (!client) {
			console.warn("\x1b[31mMISSING CLIENT\x1b[0m")
		}
		if (viewer) {
			if (client)
				client.leave(game.viewerRoom);
			game.viewers = game.viewers.filter(viewer => viewer.user.id !== userId);
		}
		else if (player) {
			if (client)
				client.leave(game.playerRoom);
			player.leaving = true;
			if (game.status === GameStatus.playing || game.status === GameStatus.start) {
				this.rageQuit(game, player);
			}
			game.status = GameStatus.end;
		}
		if (game.players.every(player => player.leaving)) {
			for (const viewer of game.viewers) {
				const client = this.getClientFromSocketId(viewer.clientId);
				if (client)
					client.leave(game.viewerRoom);
			}
			this.gamesMap.delete(gameId);
			if (game.players.length >= 2)
				return game;
		}
		return null;
	}
}
