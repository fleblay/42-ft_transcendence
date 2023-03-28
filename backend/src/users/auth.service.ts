import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dtos/create-user.dto';
import { UsersService } from './users.service';

@Injectable()
export class AuthService {

	constructor(private usersService: UsersService) {}

	async validateUser(id: number, email: string, pass: string): Promise<any> {
		const user = await this.usersService.findOne(id);
		if (user && user.password === pass) {
			const { password, ...result } = user;
			return result;
		}
		return null;
	}

	async signup(dataUser : CreateUserDto)
	{
		const user = await this.usersService.create(dataUser);
		return user;
	}

}
