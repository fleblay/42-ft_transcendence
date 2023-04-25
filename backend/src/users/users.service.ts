import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../model/user.entity'
import { CreateUserDto } from './dtos/create-user.dto';
import { UserStatus, Blocked } from '../type';
import * as sharp from 'sharp';
import { In } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { Friend } from '../type';
import { GameService } from '../game/game.service';
import { forwardRef } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { FriendRequest, FriendRequestStatus } from '../model/friend-request.entity';


@Injectable()
export class UsersService {

	private connectedUsers: Map<number, UserStatus[]> = new Map<number, UserStatus[]>();

	constructor(
		@InjectRepository(User) private repo: Repository<User>,
		@Inject(forwardRef(() => GameService)) private gameService: GameService,
		@InjectRepository(FriendRequest) private friendReqRepo: Repository<FriendRequest>
	) {
		//setInterval(() => { console.log("\x1b[34mConnected users are : \x1b[0m", this.connectedUsers) }, 5000)
	}

	create(dataUser: CreateUserDto) {
		console.log(`create user ${dataUser.username} : ${dataUser.email} : ${dataUser.password}`);
		const user = this.repo.create(dataUser);
		console.log("save user :", user);
		return this.repo.save(user);
	}

	getAll(): Promise<User[]> {
		const allDB = this.repo.createQueryBuilder("user")
			.leftJoinAndSelect("user.savedGames", "savedgames")
			.leftJoinAndSelect("user.wonGames", "wongames")
			.leftJoinAndSelect("user.sentRequests", "sentrequests")
			.leftJoinAndSelect("user.receivedRequests", "receivedrequests")
			.getMany()
		return allDB
	}


	findOne(id: number) {
		if (!id) return null;
		//return this.repo.findOneBy({ id });
		return this.repo.createQueryBuilder("user")
			.leftJoinAndSelect("user.savedGames", "savedgames")
			.leftJoinAndSelect("user.wonGames", "wongames")
			.where("user.id = :userId", { userId: id })
			.getOne()
	}

	async findOneByUsername(username: string) {
		if (!username) return null;
		try {
			return await this.repo.findOneBy({ username });
		} catch (e) {
			console.log("Error while findOneByUsername : ", e)
			return null
		}
	}

	async findOneByEmail(email: string) {
		if (!email) return null;
		return await this.repo.findOneBy({ email });
	}

	async update(id: number, dataUser: CreateUserDto) {
		await this.repo.update(id, dataUser);
		return this.findOne(id);
	}

	async remove(id: number) {
		await this.repo.delete(id);
		return true;
	}

	isConnected(id: number): boolean {

		//WTF ne marche pas avec elem.id === id !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
		console.log(`id is ${id}user found connected status is`, this.connectedUsers.get(id))
		return (this.connectedUsers.get(+id) != undefined)
	}


	addConnectedUser(id: number) {
		if (this.isConnected(id))
			this.connectedUsers.get(id).push("online")
		else
			this.connectedUsers.set(id, ["online"])
	}

	changeStatus(id: number, { newStatus, oldStatus }: { newStatus?: UserStatus, oldStatus?: UserStatus }) {
		console.log('changing status : new ', newStatus, 'old :', oldStatus)
		if (!this.isConnected(id))
			this.addConnectedUser(id);

		if (oldStatus) {
			const index = this.connectedUsers.get(id).indexOf(oldStatus);
			if (index > -1) {
				this.connectedUsers.get(id).splice(index, 1);
			}
		}
		if (newStatus)
			this.connectedUsers.get(id).push(newStatus)
		if (this.connectedUsers.get(id).length == 0)
			this.connectedUsers.delete(id)
	}

	disconnect(id: number) {
		console.log("user.service.disconnect")
		this.changeStatus(id, { oldStatus: "online" })
	}

	uploadAvatar(user: User, file: Express.Multer.File) {
		const path = '/usr/src/app/avatars/' + user.id + '.png';
		console.log("user.controller.uploadAvatar", file.buffer);
		sharp(file.buffer)
			.resize(200, 200)
			.toFile(path, (err, info) => {
				if (err) {
					console.log("error while resizing image", err)
				}
				else {
					console.log("image resized", info)
				}
			})
		console.log("path", path);
		console.log("user", user);
		return this.repo.save(user);
	}

	async changeUsername(user: User, newUsername: string) {
		if (!newUsername)
			throw new BadRequestException("Username is required");
		if (user.username == newUsername)
			if (newUsername.length < 3 || newUsername.length > 20)
				throw new BadRequestException("Username must be between 3 and 20 characters");
		if (await this.findOneByUsername(newUsername))
			throw new BadRequestException("Username already taken");
		user.username = newUsername;
		return this.repo.save(user);
	}

	async addFriend(user: User, friendId: number) {

		const friend = await this.findOne(friendId);
		if (!friend) {
			console.log("User not found");
			return;
		}

		if (user.id === friendId) {
			console.log("You can't add yourself as a friend");
			return;
		}
		if (await this.friendReqRepo.createQueryBuilder("friendreq")
			.leftJoin("friendreq.sender", "sender")
			.addSelect("sender.id")
			.leftJoin("friendreq.receiver", "receiver")
			.addSelect("receiver.id")
			.where("sender.id = :senderId", { senderId: user.id })
			.andWhere("receiver.id = :receiverId", { receiverId: friendId })
			.getOne()) {
			console.log("You already sent a friend request to this user");
			return;
		}

		const newRequest = this.friendReqRepo.create({
			sender: user,
			receiver: friend,
			status: 'pending'
		});
		this.friendReqRepo.save(newRequest);
		this.unblockUser(user, friendId);
	}

	async acceptFriend(user: User, friendId: number) {
		const friend = await this.findOne(friendId);
		if (!friend) {
			console.log("User not found");
			return;
		}

		if (user.id === friendId) {
			console.log("You can't add yourself as a friend");
			return;
		}
		const friendShip = await this.getFriendRequest(user, friendId, 'pending');
		if (!friendShip) {
			console.log("You don't have a friend request from this user");
			return;
		}
		friendShip.friendRequest.status = 'accepted';
		this.friendReqRepo.save(friendShip.friendRequest);
		this.unblockUser(user, friendId);
	}

	async removeFriend(user: User, friendId: number) {
		const friendShip = await this.getFriendRequest(user, friendId);
		if (!friendShip) {
			console.log("You are not friends with this user");
			return null;
		}
		this.friendReqRepo.softRemove(friendShip.friendRequest);
	}

	blockUser(user: User, blockedId: number) {
		if (user.blockedId.includes(blockedId)) {
			console.log("User is already blocked");
			return;
		}
		this.removeFriend(user, blockedId);
		user.blockedId.push(blockedId);
		return this.repo.save(user);
	}

	unblockUser(user: User, blockedId: number) {
		const index = user.blockedId.indexOf(blockedId);
		if (index === -1) {
			console.log("User is not blocked");
			return;
		}
		user.blockedId.splice(index, 1);
		return this.repo.save(user);
	}

	async getFriendRequest(user: User, friendId: number, status?: FriendRequestStatus ): Promise<{ friendRequest: FriendRequest, type: 'sent' | 'received' } | null> {
		const friend = await this.findOne(friendId);
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

		return {
			friendRequest,
			type: friendRequest.sender.id === user.id ? 'sent' : 'received'
		}
	}

	async getFriendsList(userId: number, wantedStatus: FriendRequestStatus = 'accepted'): Promise<Friend[]> {

		const user = await this.findOne(userId);
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
				online: this.isConnected(friend.id),
				status: this.gameService.userStatus(friend.id),
				type: sender.id === user.id ? 'sent' : 'received'
			};
		});
	}


	async getBlockedUsersList(userId: number): Promise<Blocked[]> {

		const user = await this.findOne(userId);
		if (!user)
			throw new NotFoundException("User not found");
		const BlockedList = await this.repo.find({
			select: ['id', 'username'],
			where: { id: In(user.blockedId) },
		}) as Blocked[];
		return BlockedList;
	}

	async dfa(user: User): Promise<User> {

		if (user.dfa)
			user.dfa = false;
		else
			user.dfa = true;
		return this.repo.save(user);
	}
}
