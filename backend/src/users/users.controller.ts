import { Get, Body, Controller, UseGuards, Request, ForbiddenException, Param, Headers, UseInterceptors, forwardRef, Inject, Patch, Query } from '@nestjs/common';
import { Post } from '@nestjs/common';
import { CreateUserDto } from './dtos/create-user.dto';
import { UsersService } from './users.service';
import { AuthService } from './auth/auth.service';
import { GameService } from '../game/game.service';
import { LoginUserDto } from './dtos/login-user.dto';
import { ATGuard } from './guard/access-token.guard';
import { CurrentUser } from './decorators/current-user.decorator'
import { UserInfo, UserScore } from '../type'
import { User } from "../model/user.entity";
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadedFile } from '@nestjs/common';
import { FileSizeGuard } from './guard/File-size.guard';
import { SavedGame } from '../model/saved-game.entity';
import { Serialize } from '../interceptors/serialize.interceptor';
import { UserDto } from './dtos/user.dto';
import { FriendRequestStatus } from '../model/friend-request.entity';

@Controller('users')
export class UsersController {

	constructor(private usersService: UsersService,
		private authService: AuthService,
		@Inject(forwardRef(() => GameService))
		private gameService: GameService,
	) { }

	@UseGuards(ATGuard)
	@Get('/all')
	async findAll(): Promise<UserInfo[]> {
		const allUsers = (await this.usersService.getAll()).map((user: User) => {
			const userScore: UserScore = {
				totalplayedGames: user.savedGames.length,
				totalwonGames: user.wonGames.length,
				points: user.wonGames.reduce((acc, curr) => acc + Math.max(...curr.score), 0)
			}
			return ({
				...user,
				...this.gameService.userState(user.id),
				...userScore,
				userConnected: this.usersService.isConnected(user.id)
			})
		});
		allUsers.sort((a, b) => b.points - a.points)
		return allUsers
	}

	@UseGuards(ATGuard)
	@Get('/connected/:id')
	isConnected(@Param("id") id: string): boolean {
		return this.usersService.isConnected(parseInt(id));
	}

	@Get('/me')
	@UseGuards(ATGuard)
	@Serialize(UserDto)
	getMe(@Request() req) {
		const token = req.cookies['access_token'];
		if (!token) {
			throw new ForbiddenException('User not found');
		}
		return this.authService.validateAccessToken(token);
	}

	@Patch('/me')
	@UseGuards(ATGuard)
	@Serialize(UserDto)
	changeUsername(@CurrentUser() user: User, @Body() body: { username: string }) {
		return this.usersService.changeUsername(user, body.username);
	}

	@UseGuards(ATGuard)
	@UseGuards(FileSizeGuard)
	@Post('/uploadAvatar')
	@UseInterceptors(FileInterceptor('image'))
	uploadAvatar(@CurrentUser() user: User, @UploadedFile() file: Express.Multer.File) {
		this.usersService.uploadAvatar(user, file);
	}

	@UseGuards(ATGuard)
	@Get('/blocked/:id')
	getBlockedUsersList(@Param("id") id: string) {
		return this.usersService.getBlockedUsersList(parseInt(id));
	}

	@UseGuards(ATGuard)
	@Get('/getBlocked/:id')
	getBlockedUser(@CurrentUser() user: User, @Param("id") id: string) {
		return this.usersService.getBlocked(user, parseInt(id));
	}

	@UseGuards(ATGuard)
	@Post('/blockUser/:id')
	block(@CurrentUser() user: User, @Param("id") id: string) {
		this.usersService.blockUser(user, parseInt(id));
	}

	@UseGuards(ATGuard)
	@Post('/unblockUser/:id')
	unblock(@CurrentUser() user: User, @Param("id") id: string) {
		this.usersService.unblockUser(user, parseInt(id));
	}

	@UseGuards(ATGuard)
	@Post('/toggle2fa')
	toggleDfa(@CurrentUser() user: User) {
		if (!user.dfa)
			return this.authService.generateQRCodeDataURL(user);
		else {
			this.usersService.dfa(user)
			return ("turned-off")
		}
	};

	// TODO: In user controller return all channels that user is in
	@Get('/channels')
	@UseGuards(ATGuard)
	getChannels(@CurrentUser() user: User) {
		return 'users/ channels'
		return []
	}

	@Get('/:id')
	async findOne(@Param("id") id: string): Promise<UserInfo> {
		const user = await this.usersService.findOne(parseInt(id), true);
		if (!user) {
			throw new ForbiddenException('User not found');
		}
		const userScore: UserScore = {
			totalplayedGames: user.savedGames.length,
			totalwonGames: user.wonGames.length,
			points: user.wonGames.reduce((acc, curr) => acc + Math.max(...curr.score), 0)
		}

		return ({
			...user,
			...this.gameService.userState(user.id),
			...userScore,
			userConnected: this.usersService.isConnected(user.id)
		});
	}
}
