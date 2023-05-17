import { Get, Body, Controller, UseGuards, Request, ForbiddenException, Param, Headers, UseInterceptors, forwardRef, Inject, Patch, Query, UsePipes, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { Post } from '@nestjs/common';
import { CreateUserDto } from './dtos/create-user.dto';
import { UsersService } from './users.service';
import { AuthService } from './auth/auth.service';
import { GameService } from '../game/game.service';
import { LoginUserDto } from './dtos/login-user.dto';
import { ATGuard } from './guard/access-token.guard';
import { CurrentUser } from './decorators/current-user.decorator'
import { Friend, UserInfo, UserScore } from '../type'
import { User } from "../model/user.entity";
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadedFile } from '@nestjs/common';
import { FileSizeGuard } from './guard/File-size.guard';
import { SavedGame } from '../model/saved-game.entity';
import { Serialize } from '../interceptors/serialize.interceptor';
import { UserDto } from './dtos/user.dto';
import { FriendRequestStatus } from '../model/friend-request.entity';
import { Request as ExpressRequest } from 'express';
import { ValideIdPipe } from 'src/pipe/validateID.pipe';
import { FriendsService } from '../friends/friends.service';
import { RestrictedUserDto } from './dtos/user-restricted.dto';

@Controller('users')
export class UsersController {

	constructor(private usersService: UsersService,
		private authService: AuthService,
		@Inject(forwardRef(() => GameService))
		private gameService: GameService,
		private friendsService: FriendsService,
	) { }

	@UseGuards(ATGuard)
	@Get('/all')
	@Serialize(RestrictedUserDto)
	async findAll(): Promise<UserInfo[]> {
		const allUsers = (await this.usersService.getAll()).map((user: User) => {
			return ({
				...user,
				...this.gameService.userState(user.id),
				userConnected: this.usersService.isConnected(user.id)
			})
		});
		allUsers.sort((a, b) => b.points - a.points)
		return allUsers
	}

	@UseGuards(ATGuard)
	@Get('/connected/:id')

	isConnected(@Param("id", ValideIdPipe) id: number): boolean {
		return this.usersService.isConnected(id);
	}

	@Get('/me')
	@UseGuards(ATGuard)
	@Serialize(UserDto)
	async getMe(@CurrentUser() user: User, @Request() req: ExpressRequest) {
		return user
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
	async uploadAvatar(@CurrentUser() user: User, @UploadedFile() file: Express.Multer.File) {
		await this.usersService.uploadAvatar(user, file);
	}

	@UseGuards(ATGuard)
	@Get('/blocked/:id')
	getBlockedUsersList(@Param("id", ValideIdPipe) id: number) {
		return this.usersService.getBlockedUsersList(id);
	}

	@UseGuards(ATGuard)
	@Get('/getBlocked/:id')
	getBlockedUser(@CurrentUser() user: User, @Param("id", ValideIdPipe) id: number) {
		return this.usersService.getBlocked(user, id);
	}

	@UseGuards(ATGuard)
	@Post('/blockUser/:id')
	block(@CurrentUser() user: User, @Param("id", ValideIdPipe) id: number) {
		this.usersService.blockUser(user, id);
	}

	@UseGuards(ATGuard)
	@Post('/unblockUser/:id')
	unblock(@CurrentUser() user: User, @Param("id", ValideIdPipe) id: number) {
		this.usersService.unblockUser(user, id);
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

	@Get('/:id')
	@UseGuards(ATGuard)
	@Serialize(UserDto)
	async findOne(@CurrentUser() me: User, @Param("id", ValideIdPipe) id: number): Promise<UserInfo> {
		const user = await this.usersService.findOne(id, false);
		if (!user) {
			throw new NotFoundException('User not found');
		}

		return ({
			...user,
			...this.gameService.userState(user.id),
			...(id !== me.id ? {
				email: undefined as any,
				dfa: undefined as any,
			}: {}),
			userConnected: this.usersService.isConnected(user.id)
		});
	}
}
