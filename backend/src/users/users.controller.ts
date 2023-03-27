import { Get, Body, Controller } from '@nestjs/common';
import { Post } from '@nestjs/common';
import { CreateUserDto } from './dtos/create-user.dto';
import { UsersService } from './users.service';
import { AuthService } from './auth.service';

@Controller('users')
export class UsersController {

	constructor(private usersService : UsersService, private authService : AuthService){}

	@Post('/signup')
	async createUser(@Body() body: CreateUserDto){
		const user =  await this.authService.signup(body);
		return user;
	}

	@Get('/all')
	async findAll()
	{
		const allUser = await this.usersService.find("*");
		return allUser; 
	}
}
