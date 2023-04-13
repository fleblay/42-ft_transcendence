import { Get, Body, Controller, UseGuards, Request, ForbiddenException, Param, Headers} from '@nestjs/common';
import { Post } from '@nestjs/common';
import { CreateUserDto } from './dtos/create-user.dto';
import { UsersService } from './users.service';
import { AuthService } from './auth/auth.service';
import { LoginUserDto } from './dtos/login-user.dto';
import { ATGuard } from './guard/access-token.guard';
import {CurrentUser} from './decorators/current-user.decorator'
import { User } from "src/model/user.entity";
//import { Serialize } from 'src/interceptors/serialize.interceptor';
//import { UserDto } from './dtos/user.dto';

@Controller('users')
export class UsersController {

	constructor(private usersService : UsersService, private authService : AuthService){}

	//@UseGuards(LocalAuthGuard)
	@Post('/register')
	async createUser(@Body() body: CreateUserDto){
		return await this.authService.register(body);
	}

	@Post('/login')
	async login(@Body() body: LoginUserDto, @Request() req){
		return await this.authService.login(body);
	};

	@UseGuards(ATGuard)
	@Get('/all')
	async findAll()
	{
		const allUser = await this.usersService.getAll();
		return allUser;
	}

	@UseGuards(ATGuard)
	@Get('/logout')
	logout(@CurrentUser() user: User)
	{
		//Todo : supprimer le refresh de la BDD
		console.log("user.controller.logout")
		return ("OK")
	}

	@UseGuards(ATGuard)
	@Get('/connected/:id')
	isConnected(@Param("id") id: string): boolean
	{
		return this.usersService.isConnected(parseInt(id));
	}

	@UseGuards(ATGuard)
	@Get('/me')
	//@Serialize(UserDto)
	getMe(@Headers('authorization') auth: string) {
		if (!auth) {
			throw new ForbiddenException('No token provided');
		}
		const token = auth.replace('Bearer ', '');
		return this.authService.validateAccessToken(token);
	}

}
