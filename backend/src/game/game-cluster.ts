import { Injectable } from '@nestjs/common';
import { Game } from './game';
import { SavedGame } from 'src/model/saved-game.entity';
import { v4 as uuidv4 } from 'uuid';

//import { Map } from 'immutable';

@Injectable()
export class GameCluster
{
	gamesMap: Map<string, Game> = new Map<string, Game>();

	createGame(privateGame: boolean = false) : Game {
		const game = new Game(this.generateGameId(), privateGame);
		this.gamesMap.set(game.GameId, game);
		return game;
	};

	private generateGameId() : string {
		return uuidv4();
	}


}