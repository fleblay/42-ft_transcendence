import { UUID } from '../type';

export class Game {

	constructor(private gameId: UUID, private privateGame : boolean = false) {}

	get GameId() : UUID {
		return this.gameId;
	}
	
}