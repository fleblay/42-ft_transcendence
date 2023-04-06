import { Controller, Request } from '@nestjs/common';
import { Get } from '@nestjs/common';
import { UseGuards } from '@nestjs/common';
import { RtGuard } from '../guard/refresh-token.guard';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {

	constructor( private authService : AuthService){}

	@Get('/refresh')
	@UseGuards(RtGuard)
	async refresh(@Request() req){
		console.log('refresh');
		const token = req.headers.authorization.replace('Bearer ', '');
		return this.authService.refreshToken(token);
	}

	@Get('/allTokens')
	//@UseGuards(RtGuard)
	async findAll()
	{
		const allUser = await this.authService.findAllTokens();
		return allUser;
	}


}
