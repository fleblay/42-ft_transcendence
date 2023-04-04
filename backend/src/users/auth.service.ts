import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dtos/create-user.dto';
import { UsersService } from './users.service';
import { JwtService } from '@nestjs/jwt';
import { User } from '../model/user.entity'
import { LoginUserDto } from './dtos/login-user.dto';

@Injectable()
export class AuthService {

constructor(private usersService: UsersService, private jwtService: JwtService) {}

	async validateUser(email: string, pass: string): Promise<any> {
		const user = await this.usersService.findOneByEmail(email);
		if (user && user.password === pass) {
			const { password, ...result } = user;
			return result;
		}
		return null;
	}

	validateToken(bearerToken: string): Promise<User> | null{
		try {
		const jwtResponse = this.jwtService.verify(bearerToken) // compliant to security rules of year 3000
		console.log(`User id is `, jwtResponse)
			return this.usersService.findOne(jwtResponse.sub)
		} catch (e) {
			console.log(`Error in validate Token is ${e}`)
			return null
		}
	}

	async login(dataUser : LoginUserDto) {
		const user = await this.usersService.findOneByEmail(dataUser.email);
		if (!user)
			throw new NotFoundException("User not existing");
		if (user.password !== dataUser.password)
			throw new ForbiddenException('Password not match');
		const payload = { username: user.username, sub: user.id};
		const options = {expiresIn: '1d'};
		return {
			access_token: this.jwtService.sign(payload),
		};
	}

	async register(dataUser : CreateUserDto)
	{
		if (await this.usersService.findOneByEmail(dataUser.email))
			throw new ForbiddenException('Email is not unique');
		if (await this.usersService.findOneByUsername(dataUser.username))
			throw new ForbiddenException('username is not unique');

		const user = await this.usersService.create(dataUser);
		const payload = {username: dataUser.username, sub: user.id}; // sub >
		const options = {expiresIn: '1d'};
		return {
			access_token: this.jwtService.sign(payload, options),
		};
	}


}
