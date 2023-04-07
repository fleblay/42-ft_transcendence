import { Get, Body, Controller, UseGuards, Request, ForbiddenException, Param} from '@nestjs/common';
import { Post } from '@nestjs/common';
import { CreateUserDto } from './dtos/create-user.dto';
import { UsersService } from './users.service';
import { AuthService } from './auth/auth.service';
import { JwtAuthGuard } from './guard/jwt-auth.guard';
import { LoginUserDto } from './dtos/login-user.dto';

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

	@UseGuards(JwtAuthGuard)
	@Get('/all')
	async findAll()
	{
		const allUser = await this.usersService.getAll();
		return allUser;
	}

	@UseGuards(JwtAuthGuard)
	@Get('/connected/:id')
	isConnected(@Param("id") id: number): boolean
	{
		return this.authService.isConnected(id);
	}

	@UseGuards(JwtAuthGuard)
	@Get('/me')
	getMe(@Request() req) {
		const token = req.headers.authorization.replace('Bearer ', '');
		return this.authService.validateToken(token);
	}
}
