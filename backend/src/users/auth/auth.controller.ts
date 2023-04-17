import { Controller, Request } from '@nestjs/common';
import { Get } from '@nestjs/common';
import { UseGuards } from '@nestjs/common';
import { ATGuard } from '../guard/access-token.guard';
import { RTGuard } from '../guard/refresh-token.guard';
import { AuthService } from './auth.service';
import { Post } from '@nestjs/common';

@Controller('auth')
export class AuthController {

	constructor( private authService : AuthService){}

	@Get('/refresh')
	@UseGuards(RTGuard)
	async refresh(@Request() req){
		console.log('refresh');
		// token dans X-Refresh-Token
		const refreshToken = req.get('X-Refresh-Token');
		return this.authService.refreshToken(refreshToken);
	}

	@Get('/allTokens')
	async findAll()
	{
		const allUser = await this.authService.findAllTokens();
		return allUser;
	}

	@Post('/logout')
	@UseGuards(ATGuard)
	async logout(@Request() req){
		console.log('logout');
		const refreshToken = req.get('X-Refresh-Token');
		
		return this.authService.deleteRefreshToken(refreshToken);
	}
		

}
