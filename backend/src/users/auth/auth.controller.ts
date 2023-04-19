import { Controller, Request, Query, Redirect, Response } from '@nestjs/common';
import { Response as ExpressResponse } from 'express'
import { Get } from '@nestjs/common';
import { UseGuards } from '@nestjs/common';
import { ATGuard } from '../guard/access-token.guard';
import { RTGuard } from '../guard/refresh-token.guard';
import { AuthService } from './auth.service';
import { Post } from '@nestjs/common';

@Controller('auth')
export class AuthController {

	constructor(private authService: AuthService) { }

	@Get('/refresh')
	@UseGuards(RTGuard)
	async refresh(@Request() req) {
		console.log('refresh');
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
		console.log('logout');
		const refreshToken = req.get('X-Refresh-Token');
		return this.authService.deleteRefreshToken(refreshToken);
	}

	@Get('/42auth')
	async externalAuth(@Response() res: ExpressResponse, @Query() query: { code: string }) {

		console.log("\x1b[32mReceived code is :\x1b[0m", query.code)

		const formData = new FormData()
		formData.append("grant_type", "authorization_code")
		formData.append("client_id", `${process.env.API_CLIENT_ID}`)
		formData.append("client_secret", `${process.env.API_CLIENT_SECRET}`)
		formData.append("redirect_uri", "http://localhost:8080/api/auth/42auth") // Where users will be sent after authentification (here...)
		formData.append("code", query.code)

		//Fetch a token of type grant_type
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
		const { id: userId, email: userEmail, login: userLogin, image: imageURL } = await fetch('https://api.intra.42.fr/v2/me', {
			headers: {
				"Authorization": `Bearer ${tokenRequest.access_token}`
			}
		}).then(response => response.json())

		//Proof the token is valid
		console.log(`
			userID : ${userId}
			userEmail : ${userEmail}
			userLogin : ${userLogin}
			imageURL : ${imageURL.link}
					`)
		//Must use COOKIE to send access token because we cannot send Data Back AND send a redirect
		res.cookie('testCookie', `${userId}`)
		res.redirect(302, 'http://localhost:8080/')
	}
}
