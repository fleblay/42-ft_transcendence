import { Injectable } from '@nestjs/common';
import { Game } from './game';
import { SavedGame } from 'src/model/saved-game.entity';
import { v4 as uuidv4 } from 'uuid';
import { UUID } from '../type';
import {Server, Socket} from 'socket.io'

//server.to(gameId).emit('message')



//import { Map } from 'immutable';

@Injectable()
export class GameCluster
{
	gamesMap: Map<UUID, Game> = new Map<UUID, Game>();
	private server : Server

	constructor() {
	}

	setServer(newserver: Server){
		this.server = newserver
	}

	createGame(privateGame: boolean = false) : Game {
		const game = new Game(this.generateGameId(), this.server, privateGame);
		this.gamesMap.set(game.GameId, game);
		return game;
	};

	findOne(gameId: UUID){
		return this.gamesMap.get(gameId)
	}

	findAvailable()
	{
		for (const game of this.gamesMap.values())
		{
			if (game.freeSlot)
				return game;
		}
		return null;
	}

	listAll()
	{
		const ar = []
		this.gamesMap.forEach((key, value) => {
			ar.push(JSON.stringify(value))
		})
		return ar;
	}

	private generateGameId() : UUID {
		return uuidv4();
	}


}
