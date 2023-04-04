

export class Game {

	constructor(private gameId: string, private privateGame : boolean = false) {}

	get GameId() : string {
		return this.gameId;
	}
	
}