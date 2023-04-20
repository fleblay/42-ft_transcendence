import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from '../dtos/create-user.dto';
import { UsersService } from '../users.service';
import { JwtService } from '@nestjs/jwt';
import { User } from '../../model/user.entity'
import { LoginUserDto } from '../dtos/login-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { RefreshToken } from '../../model/refresh-token.entity';
import { Repository } from 'typeorm';

type Tokens = {
	access_token: string;
	refresh_token: string;
};

const access_token_options = { expiresIn: '1m', secret: 'access' };
const refresh_token_options = { expiresIn: '7d', secret: 'refresh' };

@Injectable()
export class AuthService {


	constructor(@InjectRepository(RefreshToken) private repo: Repository<RefreshToken>, private usersService: UsersService, private jwtService: JwtService) { }

	async validateUser(email: string, pass: string): Promise<any> {
		const user = await this.usersService.findOneByEmail(email);
		if (user && user.password === pass) {
			const { password, ...result } = user;
			return result;
		}
		return null;
	}

	async validateAccessToken(bearerToken: string): Promise<User> | null {
		try {
			const jwtResponse = this.jwtService.verify(bearerToken, access_token_options) // compliant to security rules of year 3000
			//console.log(`User id is `, jwtResponse)
			return this.usersService.findOne(jwtResponse.sub)
		} catch (e) {
			console.log(`Error in validate Token access is ${e}`)
			return null
		}
	}

	decodeToken(bearerToken: string): Promise<User> | null {
		try {
			//console.log(`Bearer token is ${bearerToken}`)
			const jwtResponse = this.jwtService.decode(bearerToken);
			if (jwtResponse == null) {
				console.log(`error in decode token`)
				return null
			}
			//console.log(`Decode :  `, jwtResponse);
			return this.usersService.findOne(jwtResponse.sub);
		} catch (e) {
			console.log("Error in decode Token is :", e)
			return null
		}
	}

	async login(dataUser: LoginUserDto) {
		const user = await this.usersService.findOneByEmail(dataUser.email);
		if (!user)
			throw new NotFoundException("User not existing");
		if (user.password !== dataUser.password)
			throw new ForbiddenException('Password not match');
		const tokens = this.getTokens(user);
		await this.saveRefreshToken(user.id, tokens.refresh_token);
		console.log(`tokens are ${tokens.access_token}`);
		return tokens;
	}

	getTokens(user: User) {
		const access_token_payload = { username: user.username, sub: user.id };
		const access_token = this.jwtService.sign(access_token_payload, access_token_options);

		const refresh_token_payload = { username: user.username, sub: user.id };
		const refresh_token = this.jwtService.sign(refresh_token_payload, refresh_token_options);

		return { access_token, refresh_token };
	}


	async register(dataUser: CreateUserDto) {
		if (await this.usersService.findOneByEmail(dataUser.email))
			throw new ForbiddenException('Email is not unique');
		if (await this.usersService.findOneByUsername(dataUser.username))
			throw new ForbiddenException('username is not unique');

		const user = await this.usersService.create(dataUser);
		const tokens = this.getTokens(user);
		await this.saveRefreshToken(user.id, tokens.refresh_token);
		console.log(`tokens are access [${tokens.access_token}], refresh [${tokens.refresh_token}]`);
		return tokens;
	}

	async login42API(dataUser: CreateUserDto) {
		if (await this.usersService.findOneByEmail(dataUser.email))
			return this.login(dataUser)
		else
			return this.register(dataUser)
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
		await this.updateRefreshToken(user.id, tokens.refresh_token);
		console.log("tokens are ", tokens);
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

	async findAllTokens() {
		return await this.repo.find();
	}

	async deleteRefreshToken(refreshToken: string) {
		const report = await this.repo.findOne({ where: { refreshToken } });
		await this.repo.delete(report.id);
	}
}
