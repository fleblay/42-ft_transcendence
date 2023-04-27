import { Controller, Request, Query, Redirect, Response, Body, HttpCode, UnauthorizedException} from '@nestjs/common';
import { Response as ExpressResponse } from 'express'
import { Get } from '@nestjs/common';
import { UseGuards } from '@nestjs/common';
import { ATGuard } from '../guard/access-token.guard';
import { RTGuard } from '../guard/refresh-token.guard';
import { AuthService } from './auth.service';
import { Post } from '@nestjs/common';
import {DfaCodeDto} from '../dtos/dfa-code.dto'

@Controller('auth')
export class AuthController {
	redirectURI = `http://${process.env.HOSTNAME}:8080/api/auth/42auth`

	constructor(private authService: AuthService) { }

	@Get('/refresh')
	@UseGuards(RTGuard)
	async refresh(@Request() req) {
		//console.log('refresh');
		// token dans X-Refresh-Token
		const refreshToken = req.get('X-Refresh-Token');
		return this.authService.refreshToken(refreshToken);
	}

	@Get('/allTokens')
	async findAll() {
		const allUser = await this.authService.findAllTokens();
		return allUser;
	}

	@Get('/logout')
	@UseGuards(ATGuard)
	async logout(@Request() req) {
		//console.log('logout');
		const refreshToken = req.get('X-Refresh-Token');
		return this.authService.deleteRefreshToken(refreshToken);
	}
	@Get('/42externalauth')
	redirectTo42Api(@Response() res: ExpressResponse) {
		res.redirect(302, `https://api.intra.42.fr/oauth/authorize?client_id=${process.env.API_CLIENT_ID}&redirect_uri=${encodeURI(this.redirectURI)}&response_type=code`)
	}

	@Get('/42auth')
	async externalAuth(@Response() res: ExpressResponse, @Query() query: { code: string }) {

		//Code received after user granted acces to our app visiting the link in this.redirectTo42Api
		console.log("\x1b[32mReceived code is :\x1b[0m", query.code)

		//Fetch a token of type grant_type
		const formData = new FormData()
		formData.append("grant_type", "authorization_code")
		formData.append("client_id", `${process.env.API_CLIENT_ID}`)
		formData.append("client_secret", `${process.env.API_CLIENT_SECRET}`)
		formData.append("redirect_uri", this.redirectURI) // Where users will be sent after authentification (here...)
		formData.append("code", query.code)

		const tokenRequest = await fetch('https://api.intra.42.fr/oauth/token', {
			method: "POST",
			body: formData
		}).then(response => response.json())
		console.log("\x1b[32mResponse data is :\x1b[0m", tokenRequest)

		//Fetch info about the received token
		const tokenInfo = await fetch('https://api.intra.42.fr/oauth/token/info', {
			headers: {
				"Authorization": `Bearer ${tokenRequest.access_token}`
			}
		}).then(response => response.json())
		console.log("\x1b[32mToken Info is :\x1b[0m", tokenInfo)

		//Make request using that token
		const { id: userId, email, login: username, image: imageURL, ...rest } = await fetch('https://api.intra.42.fr/v2/me', {
			headers: {
				"Authorization": `Bearer ${tokenRequest.access_token}`
			}
		}).then(response => response.json())

		//Proof the token is valid
		console.log(`
			userID : ${userId}
			userEmail : ${email}
			userLogin : ${username}
			imageURL : ${imageURL.link}
					`)
		console.log("Other keys", Object.keys(rest))

		//Must use COOKIE to send access token because we cannot send Data Back AND send a redirect
		const tokens: { access_token: string, refresh_token: string } = await this.authService.login42API({ stud: true, email, username: null, password: "42" })
		res.cookie('42API_access_token', `${tokens.access_token}`)
		res.cookie('42API_refresh_token', `${tokens.refresh_token}`)
		res.redirect(302, '/')
	}

	@Post('turn-on-2fa')
	@HttpCode(200)
	@UseGuards(ATGuard)
	async turnDfaOn(@Request() req ,  @Body() {code} : DfaCodeDto) {
		const isValidCode = this.authService.is2faCodeValid(code, req.currentUser)

		if (!isValidCode)
			throw new UnauthorizedException("I don't think so")
		this.authService.turnOnDfa(req.currentUser.id)
	}
}
