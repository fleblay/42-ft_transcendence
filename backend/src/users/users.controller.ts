import { Get, Body, Controller, UseGuards, Request} from '@nestjs/common';
import { Post } from '@nestjs/common';
import { CreateUserDto } from './dtos/create-user.dto';
import { UsersService } from './users.service';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './local-auth.guard';
import { AuthenticatedGuard } from './authenticated.guard';

@Controller('users')
export class UsersController {

	constructor(private usersService : UsersService, private authService : AuthService){}

	//@UseGuards(LocalAuthGuard)
	@Post('/signup')
	async createUser(@Body() body: CreateUserDto){
		const user =  await this.authService.signup(body);
		return user;
	}

	@UseGuards(LocalAuthGuard)
	@Post('/login')
	async login(@Request() req){
		return {msg: 'Logged in successfully', user: req.user};
	}


	@UseGuards(AuthenticatedGuard)
	@Get('/all')
	async findAll()
	{
		const allUser = await this.usersService.find("*");
		return allUser;
	}
}
