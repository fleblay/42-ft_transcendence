import { Injectable } from '@nestjs/common';
import { Game } from './game';
import { SavedGame } from 'src/model/saved-game.entity';
import { v4 as uuidv4 } from 'uuid';
import { UUID } from '../type';


//import { Map } from 'immutable';

@Injectable()
export class GameCluster
{
	gamesMap: Map<UUID, Game> = new Map<UUID, Game>();

	createGame(privateGame: boolean = false) : Game {
		const game = new Game(this.generateGameId(), privateGame);
		this.gamesMap.set(game.GameId, game);
		return game;
	};

	private generateGameId() : UUID {
		return uuidv4();
	}


}