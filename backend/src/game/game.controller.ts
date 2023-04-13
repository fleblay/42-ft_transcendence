import { Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import {GameService} from './game.service'
import { UUID } from '../type';
import { ATGuard } from 'src/users/guard/access-token.guard';
import { CurrentUser } from 'src/users/decorators/current-user.decorator';
import { User } from 'src/model/user.entity';

@Controller('game')
export class GameController {

	constructor(private gameService: GameService){}

	@Get("/current")
	getGames(){
		return this.gameService.listAll()
	}

	@Get("/userinfo/:id")
	getUserState(@Param('id') id: number) : {state: string, gameId?: UUID}{
		return this.gameService.userState(id)
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
		console.log('games: ', games);
		return games;
	}

}
