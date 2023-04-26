import { Inject, Injectable, NotFoundException, forwardRef } from "@nestjs/common";
import { UsersService } from "./users.service";
import { InjectRepository } from "@nestjs/typeorm";
import { FriendRequest, FriendRequestStatus } from "../model/friend-request.entity";
import { Repository } from "typeorm";
import { User } from "../model/user.entity";
import { Friend } from "../type";
import { GameService } from "../game/game.service";

@Injectable()
export class FriendsService {
	constructor(
		@Inject(forwardRef(() => UsersService)) private usersService: UsersService,
		@Inject(forwardRef(() => GameService)) private gameService: GameService,
		@InjectRepository(FriendRequest) private friendReqRepo: Repository<FriendRequest>
	) {
	}

	async addFriend(user: User, friendId: number) {

		const friend = await this.usersService.findOne(friendId);
		if (!friend) {
			console.log("User not found");
			return null;
		}

		if (user.id === friendId) {
			console.log("You can't add yourself as a friend");
			return null;
		}
		if (await this.getFriendRequest(user, friendId)) {
			console.log("You already sent a friend request to this user");
			return null;
		}
		const newRequest = this.friendReqRepo.create({
			sender: user,
			receiver: friend,
			status: 'pending'
		});
		this.friendReqRepo.save(newRequest);
		this.usersService.unblockUser(user, friendId);
		const newFriend = this.generateFriend(user, friend, newRequest);

		// this.server.to(`/player/${user.id}`).emit('page.player', {})
		// this.server.to(`/player/${friendId}`).emit('page.player', {})
		return newFriend;
	}

	generateFriend(user: User, friend: User, friendRequest: FriendRequest) {
		return {
			id: friend.id,
			username: friend.username,
			online: this.usersService.isConnected(friend.id),
			status: this.gameService.userStatus(friend.id),
			type: friendRequest.sender.id === user.id ? 'sent' : 'received',
			requestStatus: friendRequest.status
		} as Friend
	}
	async acceptFriend(user: User, friendId: number) {
		const friend = await this.usersService.findOne(friendId);
		if (!friend) {
			console.log("User not found");
			return;
		}

		if (user.id === friendId) {
			console.log("You can't add yourself as a friend");
			return;
		}
		const friendRequest = await this.getFriendRequest(user, friendId, 'pending');
		if (!friendRequest) {
			console.log("You don't have a friend request from this user");
			return;
		}
		friendRequest.status = 'accepted';
		this.friendReqRepo.save(friendRequest);
		this.usersService.unblockUser(user, friendId);
		// this.server.to(`/player/${user.id}`).emit('page.player', {})
		// this.server.to(`/player/${friendId}`).emit('page.player', {})
		return this.generateFriend(user, friend, friendRequest);
	}

	async removeFriend(user: User, friendId: number) {
		const friendRequest = await this.getFriendRequest(user, friendId);
		if (!friendRequest) {
			console.log("You are not friends with this user");
			return null;
		}
		this.friendReqRepo.softRemove(friendRequest);
		// this.server.to(`/player/${user.id}`).emit('page.player', {})
		// this.server.to(`/player/${friendId}`).emit('page.player', {})
		return {
			friendId: friendId,
			status: 'declined'
		}
	}


	async getFriendRequest(user: User, friendId: number, status?: FriendRequestStatus): Promise<FriendRequest | null> {
		const friend = await this.usersService.findOne(friendId);
		if (!friend) {
			console.log("User not found");
			return null;
		}

		if (user.id === friendId) {
			console.log("You can't add yourself as a friend");
			return null;
		}

		const friendRequest = await this.friendReqRepo.findOne({
			where: [
				{ sender: { id: friend.id }, receiver: { id: user.id }, status },
				{ receiver: { id: friend.id }, sender: { id: user.id }, status },
			],
			relations: { sender: true, receiver: true }
		});
		return friendRequest;
	}


	async getFriend(user: User, friendId: number): Promise<Friend | null> {
		const friendRequest = await this.getFriendRequest(user, friendId);
		if (!friendRequest)
			return null;
		const friend = await this.usersService.findOne(friendId);
		if (!friend)
			return null;
		return this.generateFriend(user, friend, friendRequest);
	}


	async getFriendsList(user: User, wantedStatus: FriendRequestStatus = 'accepted'): Promise<Friend[]> {

		if (!user)
			throw new NotFoundException("User not found");

		const friendList = await this.friendReqRepo.find({
			where: [
				{ sender: { id: user.id }, status: wantedStatus },
				{ receiver: { id: user.id }, status: wantedStatus }
			],
			relations: { sender: true, receiver: true }
		});

		return friendList.map(({ sender, receiver }) => {
			let friend = sender.id === user.id ? receiver : sender;

			return {
				id: friend.id,
				username: friend.username,
				online: this.usersService.isConnected(friend.id),
				status: this.gameService.userStatus(friend.id),
				type: sender.id === user.id ? 'sent' : 'received',
				requestStatus: wantedStatus
			};
		});
	}

}
