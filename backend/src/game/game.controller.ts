import { Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import {GameService} from './game.service'
import { UUID, UserState } from '../type';
import { ATGuard } from '../users/guard/access-token.guard';
import { CurrentUser } from '../users/decorators/current-user.decorator';
import { User } from '../model/user.entity';

@Controller('game')
export class GameController {

	constructor(private gameService: GameService){}

	@Get("/current")
	getGames(){
		return this.gameService.listAll()
	}

	@Get("/fake")
	saveFakeGame(){
		return this.gameService.saveFakeGame()
	}


	@Get("/userstate/:id")
	getUserState(@Param('id') id: string) : UserState {
		return this.gameService.userState(parseInt(id))
	}

	@Get("/usergames/:id")
	getUserGames(@Param('id') id: string){
		return this.gameService.getListGamesByUser(parseInt(id))
	}


	@UseGuards(ATGuard)
	@Get("/quit/:gameId")
	quitGame(@Param('gameId') gameId: UUID, @CurrentUser() user: User) {
		if (!user) {
			throw new Error("No user");
		}
		return this.gameService.quitGame(user.id, gameId)
	}

	@UseGuards(ATGuard)
	@Get('/list/:page')
	async getLeaderboard(@Param('page') page: string) {
		const pageNumber = +page;
		if (isNaN(pageNumber) || pageNumber < 0) {
			throw new Error("Invalid page number");
		}
		const games = await this.gameService.getListGames(+page);
		//console.log('games: ', games);
		return games;
	}

	@UseGuards(ATGuard)
	@Get('/history/:id')
	async getLeaderboardById(@Param('id') id: number) {

		const games = await this.gameService.getListGamesByUser(id);
		console.log('games: ', games);
		return games;
	}


}
