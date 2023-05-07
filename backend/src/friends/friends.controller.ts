import { Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { FriendsService } from './friends.service';
import { FriendRequestStatus } from '../model/friend-request.entity';
import { ATGuard } from '../users/guard/access-token.guard';
import { CurrentUser } from '../users/decorators/current-user.decorator';
import { User } from '../model/user.entity';

@Controller('friends')
export class FriendsController {
	constructor(private friendsService: FriendsService) { }

	@UseGuards(ATGuard)
	@Get('/')
	getFriendsList(@CurrentUser() user: User, @Query('status') status: FriendRequestStatus) {
		return this.friendsService.getFriendsList(user, status);
	}

	@UseGuards(ATGuard)
	@Post('/accept/:id')
	async acceptFriend(@CurrentUser() user: User, @Param("id") id: string) {
		return await this.friendsService.acceptFriend(user, parseInt(id));
	}

	@UseGuards(ATGuard)
	@Post('/add/:id')
	async addFriend(@CurrentUser() user: User, @Param("id") id: string) {
		return await this.friendsService.addFriend(user, parseInt(id));
	}

	@UseGuards(ATGuard)
	@Post('/remove/:id')
	async removeFriend(@CurrentUser() user: User, @Param("id") id: string) {
		return await this.friendsService.removeFriend(user, parseInt(id));
	}

	@UseGuards(ATGuard)
	@Get('/:id')
	getRelationShip(@CurrentUser() user: User, @Param("id") id: string) {
		return this.friendsService.getFriend(user, parseInt(id));
	}

	@UseGuards(ATGuard)
	@Get('/received')
	async getPendingRequests(@CurrentUser() user: User) 
	{	
		return await this.friendsService.getFriendReceiveRequests(user);
	}


}
