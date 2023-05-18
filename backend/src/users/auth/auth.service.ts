import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from '../dtos/create-user.dto';
import { UsersService } from '../users.service';
import { JwtService } from '@nestjs/jwt';
import { User } from '../../model/user.entity'
import { LoginUserDto } from '../dtos/login-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { RefreshToken } from '../../model/refresh-token.entity';
import { Repository } from 'typeorm';
import { toDataURL } from 'qrcode'
import { authenticator } from 'otplib'
import { Login42User, Tokens } from '../../type';
import { hashPassword, verifyPassword } from './hashPassword';
import * as sharp from 'sharp';

var http = require('http');
var fs = require('fs');

const access_token_options = { expiresIn: '1d', secret: 'access' };
const refresh_token_options = { expiresIn: '10d', secret: 'refresh' };
const dfa_token_options = { expiresIn: '1h', secret: 'dfa_secret' };

@Injectable()
export class AuthService {

	redirectURI = `http://${process.env.HOSTNAME}:8080/api/auth/42auth`

	constructor(@InjectRepository(RefreshToken) private repo: Repository<RefreshToken>, private usersService: UsersService, private jwtService: JwtService) { }

	async generateQRCodeDataURL(user: User): Promise<string> {
		return toDataURL(authenticator.keyuri(
			user.email,
			"CYBER_PONG",
			user.dfaSecret
		))
	}

	turnOnDfa(userID: number): void {
		this.usersService.update(userID, { dfa: true })
	}


	is2faCodeValid(dfaCode: string, user: User) {
		console.log("is2facodevalid")
		return authenticator.verify({ token: dfaCode, secret: user.dfaSecret })
	}

	async validateUser(email: string, pass: string): Promise<any> {
		const user = await this.usersService.findOneByEmail(email);
		if (user && user.password === pass) {
			const { password, ...result } = user;
			return result;
		}
		return null;
	}

	async validateAccessToken(bearerToken: string): Promise<User | null> {
		try {
			// console.log(`Bearer token in validate access token is ${bearerToken}`)
			const jwtResponse = this.jwtService.verify<{ sub: number, email: string }>(bearerToken, access_token_options) // compliant to security rules of year 3000
			//console.log(`User id is `, jwtResponse)
			return await this.usersService.findOne(jwtResponse.sub)
		} catch (e) {
			console.log(`Error in validate Token access is ${e}`)
			return null
		}
	}

	async validateDfaToken(dfaToken: string): Promise<User | null> {
		try {
			const jwtResponse = this.jwtService.verify(dfaToken, dfa_token_options) // compliant to security rules of year 3000
			return await this.usersService.findOne(jwtResponse.sub)
		} catch (e) {
			console.log(`Error in validate Dfa access is ${e}`)
			return null
		}
	}

	async decodeToken(bearerToken: string): Promise<User | null> {
		try {
			// console.log(`Bearer token is ${bearerToken}`)
			const jwtResponse = this.jwtService.decode(bearerToken);
			if (jwtResponse == null) {
				console.log(`error in decode token`)
				return null
			}
			//console.log(`Decode :  `, jwtResponse);
			return await this.usersService.findOne(jwtResponse.sub);
		} catch (e) {
			console.log("Error in decode Token is :", e)
			return null
		}
	}

	async login(dataUser: LoginUserDto, checkStud: boolean = true): Promise<Partial<Tokens>> {
		const user = await this.usersService.findOneByEmail(dataUser.email);
		if (!user)
			throw new NotFoundException("User not existing");

		if (user.stud && checkStud)
			throw new ForbiddenException('Stud accout detected : You must login with 42 !');

		if (await verifyPassword(user.password, dataUser.password) === false)
			throw new ForbiddenException('Password not match');
		if (user.dfa) {
			// return dfa token
			const access_token_payload = { email: user.email, sub: user.id };
			const accessToken = this.jwtService.sign(access_token_payload, dfa_token_options);
			return { dfaToken: accessToken };
		}
		const tokens = this.getTokens(user);
		await this.saveRefreshToken(user.id, tokens.refreshToken);
		// console.log(`tokens are ${tokens accessToken}`);
		return tokens;
	}

	getTokens(user: User) {
		const access_token_payload = { email: user.email, sub: user.id };
		const accessToken = this.jwtService.sign(access_token_payload, access_token_options);

		const refresh_token_payload = { email: user.email, sub: user.id };
		const refreshToken = this.jwtService.sign(refresh_token_payload, refresh_token_options);

		return { accessToken, refreshToken } as Tokens;
	}

	async register(dataUser: CreateUserDto) {
		if (dataUser.email.endsWith('@student.42.fr'))
			throw new ForbiddenException('You can\'t register with a 42 email');
		if (await this.usersService.findOneByEmail(dataUser.email.toLocaleLowerCase('en-US')))
			throw new ForbiddenException('Email is not unique');
		let username = dataUser.username;
		if (!username)
			throw new BadRequestException('Username is required');
		username = username.replace(/\s/g, '');
		if (username.length < 3 || username.length > 10)
			throw new BadRequestException('Username must be between 3 and 10 characters');
		if (await this.usersService.findOneByUsername(username.toLocaleLowerCase('en-US')))
			throw new ForbiddenException('Username is not unique');

		dataUser.username = username;
		dataUser.password = await hashPassword(dataUser.password);

		const user = await this.usersService.create(dataUser);
		const tokens = this.getTokens(user);
		await this.saveRefreshToken(user.id, tokens.refreshToken);
		// console.log(`tokens are access [${tokens accessToken}], refresh [${tokens.refresh_token}]`);
		return tokens;
	}

	async login42API(dataUser: Login42User): Promise<Partial<Tokens> & { newUserId?: number }> {
		if (await this.usersService.findOneByEmail(dataUser.email))
			return this.login(dataUser, false)
		else {
			dataUser.password = await hashPassword(dataUser.password);
			const user = await this.usersService.create(dataUser);
			const tokens = this.getTokens(user);
			await this.saveRefreshToken(user.id, tokens.refreshToken);
			return { ...tokens, newUserId: user.id }
		}

	}

	async validate42Code(code: string): Promise<Partial<Tokens>> {
		//Fetch a token of type grant_type
		const formData = new FormData()
		formData.append("grant_type", "authorization_code")
		formData.append("client_id", `${process.env.API_CLIENT_ID}`)
		formData.append("client_secret", `${process.env.API_CLIENT_SECRET}`)
		formData.append("redirect_uri", this.redirectURI) // Where users will be sent after authentification (here...)
		formData.append("code", code)

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
		const { refreshToken, accessToken, dfaToken, newUserId } = await this.login42API({ stud: true, email, password: "42" })
		if (newUserId) {
			try {
				const img = await fetch(imageURL.link).then((response) => response.arrayBuffer())
				console.log("img is : >\x1b[33m", img, "\x1b[0m<")
				await sharp(img).resize(200, 200).toFile(`/usr/src/app/avatars/${newUserId}.png`)
			} catch (e) {
				console.log("Failed to sharp intra img url : ", e)
			}
		}
		return { refreshToken, accessToken, dfaToken }
	}

	async saveRefreshToken(userId: number, refreshToken: string) {
		await this.repo.save({ userId, refreshToken });
	}

	async updateRefreshToken(userId: number, refreshToken: string) {
		const report = await this.repo.findOne({ where: { userId: userId } });
		if (!report) {
			throw new NotFoundException('User not found');
		}
		report.refreshToken = refreshToken;
		await this.repo.save(report);
		//await this.repo.save({userId, refreshToken})
	}

	async refreshToken(refreshToken: string) {
		const user = await this.decodeToken(refreshToken);
		if (!user) {
			throw new ForbiddenException('Invalid refresh token');
		}
		const tokens = this.getTokens(user);
		await this.updateRefreshToken(user.id, tokens.refreshToken);
		// console.log("tokens are ", tokens);
		return tokens;
	}

	async validateRefreshToken(refreshToken: string) {

		try {
			const jwtResponse = this.jwtService.verify(refreshToken, refresh_token_options)
			console.log(`User id is `, jwtResponse)
		}
		catch (e) {
			console.log(`Error in validate Token refresh is ${e}`)
			return null;
		}
		const user = await this.decodeToken(refreshToken);
		if (!user) {
			console.log('Invalid refresh token');
			return null;
		}
		const report = await this.repo.findOne({ where: { refreshToken } });
		if (!report) {
			console.log('User not found');
			return null;
		}
		if (report.userId !== user.id) {
			console.log('User id is not match');
			return null;
		}
		return user;
	}

	async deleteRefreshToken(refreshToken: string) {
		const report = await this.repo.findOne({ where: { refreshToken } });
		if (!report) return;
		await this.repo.delete(report.id);
	}
}
