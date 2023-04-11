import { Controller, Get, Param } from '@nestjs/common';
import {GameService} from './game.service'
import { UUID } from '../type';

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
}
