import { Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { GameService } from './game.service'
import { UUID, UserState } from '../type';
import { ATGuard } from '../users/guard/access-token.guard';
import { CurrentUser } from '../users/decorators/current-user.decorator';
import { User } from '../model/user.entity';
import { ValideIdPipe } from '../pipe/validateID.pipe';

@Controller('game')
export class GameController {

	constructor(private gameService: GameService) { }

	@Get("/current")
	getGames() {
		return this.gameService.listAllCurrent()
	}

	@Get("/fake")
	saveFakeGame() {
		return this.gameService.saveFakeGame()
	}


	@Get("/userstate/:id")
	getUserState(@Param('id', ValideIdPipe) id: number): UserState {
		return this.gameService.userState(id)
	}

	@Get("/usergames/:id")
	getUserGames(@Param('id', ValideIdPipe) id: number) {
		return this.gameService.getListGamesByUser(id)
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
	async getLeaderboard(@Param('page', ValideIdPipe) page: number) {
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
	async getHistory(@Param('id', ValideIdPipe) id: number) {

		const games = await this.gameService.getListGamesByUser(id);
		//console.log('games: ', games);
		return games;
	}


}
