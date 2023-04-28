import { Controller, Request, Query, Redirect, Response, Body, HttpCode, UnauthorizedException } from '@nestjs/common';
import { Response as ExpressResponse } from 'express'
import { Get } from '@nestjs/common';
import { UseGuards } from '@nestjs/common';
import { ATGuard } from '../guard/access-token.guard';
import { RTGuard } from '../guard/refresh-token.guard';
import { AuthService } from './auth.service';
import { Post } from '@nestjs/common';
import { DfaCodeDto } from '../dtos/dfa-code.dto'
import { Tokens } from '../../type';
import { LoginUserDto } from '../dtos/login-user.dto';
import { CreateUserDto } from '../dtos/create-user.dto';


@Controller('auth')
export class AuthController {

	constructor(private authService: AuthService) { }

	@Get('/refresh')
	@UseGuards(RTGuard)
	async refresh(@Request() req, @Response({ passthrough: true }) res: ExpressResponse) {
		//console.log('refresh');
		// token dans X-Refresh-Token
		const refreshToken = req.cookies['refresh_token'];
		const tokens = await this.authService.refreshToken(refreshToken) as Tokens;
		res.cookie('access_token', tokens.accessToken, { maxAge: 1000 * 60 * 60 * 24 * 7 });
		res.cookie('refresh_token', tokens.refreshToken, { httpOnly: true, maxAge: 1000 * 60 * 60 * 24 * 7 });
		return;
	}

	//@UseGuards(LocalAuthGuard)
	@Post('/register')
	async createUser(@Body() body: CreateUserDto, @Response({ passthrough: true }) res: ExpressResponse) {
		const tokens = await this.authService.register(body) as Tokens;
		res.cookie('access_token', tokens.accessToken, { maxAge: 1000 * 60 * 60 * 24 * 7 });
		res.cookie('refresh_token', tokens.refreshToken, { httpOnly: true, maxAge: 1000 * 60 * 60 * 24 * 7 });
		return;
	}

	@Post('/login')
	async login(@Body() body: LoginUserDto, @Request() req) {

		const tokens = await this.authService.login(body) as Tokens;
		req.res.cookie('access_token', tokens.accessToken, { maxAge: 1000 * 60 * 60 * 24 * 7 });
		req.res.cookie('refresh_token', tokens.refreshToken, { httpOnly: true, maxAge: 1000 * 60 * 60 * 24 * 7 });
		return;
	};

	@Get('/allTokens')
	async findAll() {
		const allUser = await this.authService.findAllTokens();
		return allUser;
	}

	@Get('/logout')
	@UseGuards(ATGuard)
	async logout(@Request() req) {
		//console.log('logout');
		const refreshToken = req.cookies['refresh_token'];
		return this.authService.deleteRefreshToken(refreshToken);
	}
	@Get('/42externalauth')
	redirectTo42Api(@Response({ passthrough: true }) res: ExpressResponse) {
		res.redirect(302, `https://api.intra.42.fr/oauth/authorize?client_id=${process.env.API_CLIENT_ID}&redirect_uri=${encodeURI(this.authService.redirectURI)}&response_type=code`)
	}

	@Get('/42auth')
	async externalAuth(@Response({ passthrough: true }) res: ExpressResponse, @Query() query: { code: string }) {

		//Code received after user granted acces to our app visiting the link in this.redirectTo42Api
		console.log("\x1b[32mReceived code is :\x1b[0m", query.code)
		const tokens = await this.authService.validate42Code(query.code)
		res.cookie('access_token', `${tokens.accessToken}`)
		res.cookie('refresh_token', `${tokens.refreshToken}`)
		res.redirect(302, '/')
	}

	@Post('turn-on-2fa')
	@HttpCode(200)
	@UseGuards(ATGuard)
	async turnDfaOn(@Request() req, @Body() { code }: DfaCodeDto) {
		const isValidCode = this.authService.is2faCodeValid(code, req.currentUser)

		if (!isValidCode)
			throw new UnauthorizedException("I don't think so")
		this.authService.turnOnDfa(req.currentUser.id)
	}
}
