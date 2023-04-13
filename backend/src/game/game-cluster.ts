import { Injectable } from '@nestjs/common';
import { Game } from './game';
import { SavedGame } from 'src/model/saved-game.entity';
import { v4 as uuidv4 } from 'uuid';
import { UUID } from '../type';
import { Server, Socket } from 'socket.io'
import { GameStatus } from './game';

//server.to(gameId).emit('message')



//import { Map } from 'immutable';

@Injectable()
export class GameCluster {
	gamesMap: Map<UUID, Game> = new Map<UUID, Game>();
	private server: Server

	constructor() {
	}

	setServer(newserver: Server) {
		this.server = newserver
	}

	createGame(privateGame: boolean = false): Game {
		const game = new Game(this.generateGameId(), this.server, privateGame);
		this.gamesMap.set(game.id, game);
		return game;
	};

	findOne(gameId: UUID) {
		return this.gamesMap.get(gameId)
	}

	findAvailable() {
		for (const game of this.gamesMap.values()) {
			if (game.freeSlot)
				return game;
		}
		return null;
	}

	listAll() {
		const ar = []
		this.gamesMap.forEach((key, value) => {
			ar.push(JSON.stringify(value))
		})
		return ar;
	}

	private generateGameId(): UUID {
		return uuidv4();
	}

	findUserStateById(id: number) {
		let stateArray: string[] = []
		let gameIdArray: string[] = []
		for (const game of this.gamesMap.values()) {
			if (game.players.find(player => player.user.id === id)) {
				stateArray.push("Ingame")
				gameIdArray.push(game.gameId)
			}
			if (game.viewers.find(viewer => viewer.id === id)) {
				stateArray.push("Watching")
				gameIdArray.push(game.gameId)
			}
		}
		if (stateArray.length === 0)
			stateArray.push("Waiting")
		return { state: stateArray.join("-"), gameId: gameIdArray.join("-") }
	}

	destroyGame(gameId: UUID, userId?: number) {
		const game = this.gamesMap.get(gameId)
		if (userId) {
			if (game.status === GameStatus.playing) {
				if (game.players.find(player => player.user.id === userId)) {
					game.players.forEach(player => {
						if (player.user.id !== userId) player.score = 0;
						else player.score = 5;
					});
				}
			}
		}
		this.gamesMap.delete(gameId)
		return game;
	}
}
