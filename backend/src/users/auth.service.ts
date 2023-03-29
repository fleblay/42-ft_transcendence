import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dtos/create-user.dto';
import { UsersService } from './users.service';
import { JwtService } from '@nestjs/jwt';
import { User } from '../model/user.entity'

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

	async validateToken(bearerToken: string): Promise<User> | null{
		try {
		const jwtResponse = this.jwtService.verify(bearerToken) // compliant to security rules of year 3000
		console.log(`User id is `, jwtResponse)
			return this.usersService.findOne(jwtResponse.sub)
		} catch (e) {
			console.log(`Error in validate Token is ${e}`)
			return null
		}
	}

	async login(dataUser : CreateUserDto) {
		const user = await this.usersService.findOneByEmail(dataUser.email);
		const payload = { username: dataUser.username, sub: user.id};
		const options = {expiresIn: '1d'};
		return {
			access_token: this.jwtService.sign(payload),
		};
	}

	async signup(dataUser : CreateUserDto)
	{
		const user = await this.usersService.create(dataUser);

		const payload = { username: dataUser.username, sub: user.id}; // sub >
		const options = {expiresIn: '1d'};
		return {
			access_token: this.jwtService.sign(payload, options),
		};
	}


}
