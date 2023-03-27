import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dtos/create-user.dto';
import { UsersService } from './users.service';

@Injectable()
export class AuthService {

	constructor(private usersService: UsersService) {}
	async signup(dataUser : CreateUserDto)
	{
		const user = await this.usersService.create(dataUser);
		return user;
	}

}
