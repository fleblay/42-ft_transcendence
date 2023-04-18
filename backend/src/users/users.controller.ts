import { Get, Body, Controller, UseGuards, Request, ForbiddenException, Param, Headers, UseInterceptors} from '@nestjs/common';
import { Post } from '@nestjs/common';
import { CreateUserDto } from './dtos/create-user.dto';
import { UsersService } from './users.service';
import { AuthService } from './auth/auth.service';
import { LoginUserDto } from './dtos/login-user.dto';
import { ATGuard } from './guard/access-token.guard';
import {CurrentUser} from './decorators/current-user.decorator'
import { User } from "../model/user.entity";
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadedFile } from '@nestjs/common';
//import { Serialize } from '../interceptors/serialize.interceptor';
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

	@UseGuards(ATGuard)
	@Post('/uploadAvatar')
	@UseInterceptors(FileInterceptor('image'))
	async uploadAvatar(@CurrentUser() user: User, @UploadedFile() file: Express.Multer.File)
	{
		console.log("coucou");
		return await this.usersService.uploadAvatar(user, file);
		//return await this.usersService.uploadAvatar(user.id, body);
	}

	@Get('/:id')
	async findOne(@Param("id") id: string)
	{
		const user = await this.usersService.findOne(parseInt(id));
		return user;
	}
}
