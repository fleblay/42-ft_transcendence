import { Controller, Request, Query } from '@nestjs/common';
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
	async externalAuth(@Query() query: { code: string }) {
		console.log("\x1b[32mReceived code is :\x1b[0m", query.code)

		const formData = new FormData()
		formData.append("grant_type", "client_credentials")
		formData.append("client_id", "u-s4t2ud-8dd21f008d6200a9e400a2deb0ccfe47fd119667e4de9dbb68559d40af8f70a2")
		formData.append("client_secret", "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")
		formData.append("code", query.code)

		const response = await fetch('https://api.intra.42.fr/oauth/token', {
			method: "POST",
			body: formData
		})
		const data: {
			access_token: string,
			token_type: string,
			expires_in: number,
			scope: string,
			created_at: number
		} = await response.json()
		console.log("\x1b[32mResponse data is :\x1b[0m", data.access_token)
	}
}
