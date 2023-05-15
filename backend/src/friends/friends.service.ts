import { Inject, Injectable, NotFoundException, forwardRef } from "@nestjs/common";
import { UsersService } from "../users/users.service";
import { InjectRepository } from "@nestjs/typeorm";
import { FriendRequest, FriendRequestStatus } from "../model/friend-request.entity";
import { Repository } from "typeorm";
import { User } from "../model/user.entity";
import { Friend } from "../type";
import { GameService } from "../game/game.service";
import { Server } from 'socket.io'
import { ChatService } from "../chat/chat.service";

@Injectable()
export class FriendsService {
	private server: Server;
	constructor(
		@Inject(forwardRef(() => UsersService)) private usersService: UsersService,
		private chatService: ChatService,
		private gameService: GameService,
		@InjectRepository(FriendRequest) private friendReqRepo: Repository<FriendRequest>
	) {
	}

	setWsServer(server: Server) {
		this.server = server;
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
		if (friend.blockedId.includes(user.id)) {
			console.log("You can't add as user that has blocked you");
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
		console.log("new friend request :", newRequest)
		const save_request =await  this.friendReqRepo.save(newRequest);
		console.log("save friend request :", save_request)

		this.usersService.unblockUser(user, friendId);
		const newFriend = this.generateFriend(user, friend, newRequest);

		this.server.to(`/player/${user.id}`).emit('page.player', { userId: user.id, targetId: friendId, event: "add" })
		this.server.to(`/player/${friendId}`).emit('page.player', { userId: user.id, targetId: friendId, event: "me-add" })
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

		//FriendId
		user.friendId.push(friendId)
		friend.friendId.push(user.id)
		await this.usersService.update(user.id, user);
		await this.usersService.update(friend.id, friend);
		//FriendId

		this.server.to(`/player/${user.id}`).emit('page.player', { userId: user.id, targetId: friendId, event: "accept" })
		this.server.to(`/player/${friendId}`).emit('page.player', { userId: user.id, targetId: friendId, event: "me-accept" })

		const friendData = this.generateFriend(user, friend, friendRequest);
		this.server.to(`/chat/friends/${user.id}`).emit('chat.friends.update', {
			status: 'update',
			friend: friendData,
		})

		await this.chatService.joinDirectMessage(user, friendId);
		return friendData
	}

	async removeFriend(user: User, friendId: number) {
		const friend = await this.usersService.findOne(friendId);
		if (!friend) {
			console.log("User not found");
			return;
		}
		const friendRequest = await this.getFriendRequest(user, friendId);
		if (!friendRequest) {
			console.log("You are not friends with this user");
			return null;
		}
		const removeFriend = this.generateFriend(user, friendRequest.sender.id === user.id ? friendRequest.receiver : friendRequest.sender, friendRequest);
		this.friendReqRepo.softRemove(friendRequest);

		//FriendId
		const indexInUser = user.friendId.indexOf(friendId);
		const indexInFriend = friend.friendId.indexOf(user.id);
		if (indexInUser !== -1 && indexInFriend !== -1) {
			user.friendId.splice(indexInUser, 1);
			friend.friendId.splice(indexInFriend, 1);
			await this.usersService.update(user.id, user);
			await this.usersService.update(friend.id, friend);
		}
		//FriendId
		if (friendRequest.status == "pending") {
			this.server.to(`/player/${user.id}`).emit('page.player', { userId: user.id, targetId: friendId, event: "pending-delete" })
			this.server.to(`/player/${friendId}`).emit('page.player', { userId: user.id, targetId: friendId, event: "me-pending-delete" })
		}
		else if (friendRequest.status == "accepted") {
			this.server.to(`/player/${user.id}`).emit('page.player', { userId: user.id, targetId: friendId, event: "remove" })
			this.server.to(`/player/${friendId}`).emit('page.player', { userId: user.id, targetId: friendId, event: "me-remove" })
		}
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
			relations: { sender: true, receiver: true },
			select: {
				id: true,
				status: true,
				sender: { id: true, username: true },
				receiver: { id: true, username: true }
			}
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
				username: friend.username || "<UnamedUser>",
				online: this.usersService.isConnected(friend.id),
				status: this.gameService.userStatus(friend.id),
				type: sender.id === user.id ? 'sent' : 'received',
				requestStatus: wantedStatus
			};
		});
	}

	async getFriendReceiveRequests(user: User): Promise<Friend[]> {
		const wantedStatus = 'pending';
		if (!user)
			throw new NotFoundException("User not found");

		const friendList = await this.friendReqRepo.find({
			where: [
				{ receiver: { id: user.id }, status: wantedStatus }
			],
			relations: { sender: true, receiver: true }
		});

		return friendList.map(({ sender }) => {
			return {
				id: sender.id,
				username: sender.username || "<UnamedUser>",
				online: this.usersService.isConnected(sender.id),
				status: this.gameService.userStatus(sender.id),
				type: 'received',
				requestStatus: wantedStatus
			};
		});
	}
}
