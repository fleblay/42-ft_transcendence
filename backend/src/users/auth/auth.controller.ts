import { Controller, Request, Query, Redirect, Response, Body, HttpCode, UnauthorizedException } from '@nestjs/common';
import { Response as ExpressResponse, Request as ExpressRequest } from 'express'
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
import { DfaGuard } from '../guard/2fa-token.guard';
import { CurrentUser } from '../decorators/current-user.decorator';
import { User } from 'src/model/user.entity';


const RefreshTokenTime = 1000 * 60 * 60 * 24 * 7; // 7 days
const AccessTokenTime = 1000 * 60 * 60 * 24; // 1 day
const DfaTokenTime = 1000 * 60 * 5; // 5 minutes

@Controller('auth')
export class AuthController {

	constructor(private authService: AuthService) { }

	@Get('/refresh')
	@UseGuards(RTGuard)
	async refresh(@Request() req: ExpressRequest, @Response({ passthrough: true }) res: ExpressResponse) {
		// token dans X-Refresh-Token
		const refreshToken = req.cookies['refresh_token'];
		const tokens = await this.authService.refreshToken(refreshToken) as Tokens;
		res.cookie('access_token', tokens.accessToken, { sameSite: true, maxAge: AccessTokenTime });
		res.cookie('refresh_token', tokens.refreshToken, { sameSite: true, httpOnly: true, maxAge: RefreshTokenTime});
		return { ok: true };
	}

	//@UseGuards(LocalAuthGuard)
	@Post('/register')
	async createUser(@Body() body: CreateUserDto, @Response({ passthrough: true }) res: ExpressResponse) {
		const tokens = await this.authService.register(body) as Tokens;
		res.cookie('access_token', tokens.accessToken, { sameSite: 'lax', maxAge: RefreshTokenTime});
		res.cookie('refresh_token', tokens.refreshToken, { sameSite: 'lax', httpOnly: true, maxAge: RefreshTokenTime});
		return;
	}

	@Post('/login')
	async login(@Body() body: LoginUserDto, @Response({ passthrough: true }) res: ExpressResponse) {

		const tokens = await this.authService.login(body);
		if (tokens.dfaToken) {
			res.cookie('dfa_token', tokens.dfaToken, { sameSite: 'lax', httpOnly: false, maxAge: DfaTokenTime });
			return { needDfa: true }
		}
		else if (tokens.accessToken && tokens.refreshToken) {
			res.cookie('access_token', tokens.accessToken, { sameSite: 'lax', maxAge: RefreshTokenTime});
			res.cookie('refresh_token', tokens.refreshToken, { sameSite: 'lax', httpOnly: true, maxAge: RefreshTokenTime });
		}
	};

	@Get('/logout')
	@UseGuards(ATGuard)
	async logout(@Request() req: ExpressRequest, @Response({ passthrough: true }) res: ExpressResponse) {
		const refreshToken = req.cookies['refresh_token'];
		res.cookie('access_token', '', { sameSite: 'lax', maxAge: 0 });
		res.cookie('refresh_token', '', { sameSite: 'lax', httpOnly: true, maxAge: 0 });
		return this.authService.deleteRefreshToken(refreshToken);
	}
	@Get('/42externalauth')
	redirectTo42Api(@Response({ passthrough: true }) res: ExpressResponse) {
		res.redirect(302, `https://api.intra.42.fr/oauth/authorize?client_id=${process.env.API_CLIENT_ID}&redirect_uri=${encodeURI(this.authService.redirectURI)}&response_type=code`)
	}

	@Get('/42auth')
	async externalAuth(@Response({ passthrough: true }) res: ExpressResponse, @Query() query: { code: string }) {
		if (!query.code)
			throw new UnauthorizedException("No code provided")
		//Code received after user granted acces to our app visiting the link in this.redirectTo42Api
		console.log("\x1b[32mReceived code is :\x1b[0m", query.code)
		const tokens = await this.authService.validate42Code(query.code)
		if (tokens.dfaToken) {
			res.cookie('dfa_token', tokens.dfaToken, { sameSite: 'lax', httpOnly: false, maxAge: DfaTokenTime });
			res.redirect(302, '/dfa')
		}
		else if (tokens.accessToken && tokens.refreshToken) {
			res.cookie('access_token', `${tokens.accessToken}`,  { sameSite: 'lax', httpOnly: false, maxAge: AccessTokenTime })
			res.cookie('refresh_token', `${tokens.refreshToken}`,  { sameSite: 'lax', httpOnly: true, maxAge: RefreshTokenTime })
			res.redirect(302, '/')
		}
	}

	@Post('turn-on-2fa')
	@HttpCode(200)
	@UseGuards(ATGuard)
	async turnDfaOn(@CurrentUser() user: User, @Request() req: ExpressRequest, @Body() { code }: DfaCodeDto) {

		const isValidCode = this.authService.is2faCodeValid(code, user)
		if (!isValidCode)
			throw new UnauthorizedException("I don't think so")
		this.authService.turnOnDfa(user.id)
	}

	@Post('validate-dfa')
	@HttpCode(200)
	@UseGuards(DfaGuard)
	async validateDfa(@Body() { code }: DfaCodeDto, @Request() req: ExpressRequest, @Response({ passthrough: true }) res: ExpressResponse) {
		// get user
		const user = await this.authService.validateDfaToken(req.cookies['dfa_token'])
		if (!user)
			throw new UnauthorizedException("I don't think so")
		const isValidCode = this.authService.is2faCodeValid(code, user)
		if (!isValidCode)
			throw new UnauthorizedException("I don't think so")
		const tokens = this.authService.getTokens(user);
		if (tokens.accessToken && tokens.refreshToken) {
			this.authService.saveRefreshToken(user.id, tokens.refreshToken);
			res.cookie('access_token', tokens.accessToken, { sameSite: 'lax', maxAge: RefreshTokenTime});
			res.cookie('refresh_token', tokens.refreshToken, { sameSite: 'lax', httpOnly: true, maxAge: RefreshTokenTime});
			res.cookie('dfa_token', '', { sameSite: 'lax', httpOnly: false, maxAge: 0 });
		}
	}
}
//