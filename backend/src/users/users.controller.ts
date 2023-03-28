import { Get, Body, Controller, UseGuards, Request} from '@nestjs/common';
import { Post } from '@nestjs/common';
import { CreateUserDto } from './dtos/create-user.dto';
import { UsersService } from './users.service';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './local-auth.guard';
import { AuthentificatedGuard } from './authenticated.guard';
import { JwtAuthGuard } from './jwt-auth.guard';

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
	async login(@Body() body: CreateUserDto, @Request() req){
		return this.authService.login(body);};

	@UseGuards(JwtAuthGuard)
	@Get('/all')
	async findAll()
	{
		const allUser = await this.usersService.find("*");
		return allUser;
	}
}
