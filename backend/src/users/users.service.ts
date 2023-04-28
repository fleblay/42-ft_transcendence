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
import { Server, Socket } from 'socket.io'
import { FriendsService } from '../friends/friends.service';



@Injectable()
export class UsersService {

	private connectedUsers: Map<number, UserStatus[]> = new Map<number, UserStatus[]>();
	private server : Server;
	constructor(
		@InjectRepository(User) private repo: Repository<User>,
		@Inject(forwardRef(() => GameService)) private gameService: GameService,
		@Inject(forwardRef(() => FriendsService)) private friendsService: FriendsService
	) {
		//setInterval(() => { console.log("\x1b[34mConnected users are : \x1b[0m", this.connectedUsers) }, 5000)
	}

	setWsServer(server: any) {
		this.server = server;
	}


	create(dataUser: CreateUserDto & {dfaSecret: string}) {
		console.log(`create user ${dataUser.username} : ${dataUser.email} : ${dataUser.password}`);
		const user = this.repo.create(dataUser)
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


	findOne(id: number, withGames: boolean = false) {
		if (!id) return null;
		return this.repo.findOne({
			where: { id },
			relations: withGames ? ["savedGames", "wonGames"] : []
		})
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

	async update(id: number, partialUser: Partial<User>) {
		await this.repo.update(id, partialUser);
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


	blockUser(user: User, blockedId: number) {
		if (user.blockedId.includes(blockedId)) {
			console.log("User is already blocked");
			return;
		}
		this.friendsService.removeFriend(user, blockedId);
		user.blockedId.push(blockedId);
		this.server.to(`/player/${user.id}`).emit('page.player', {})
		this.server.to(`/player/${blockedId}`).emit('page.player', {})
		return this.repo.save(user);
	}

	unblockUser(user: User, blockedId: number) {
		const index = user.blockedId.indexOf(blockedId);
		if (index === -1) {
			console.log("User is not blocked");
			return;
		}
		user.blockedId.splice(index, 1);
		this.server.to(`/player/${user.id}`).emit('page.player', {})
		this.server.to(`/player/${blockedId}`).emit('page.player', {})
		return this.repo.save(user);
	}


	async getBlocked(user: User, friendId: number): Promise <Blocked | null> {
		if (!user)
			throw new NotFoundException("User not found");
		if (user.blockedId.includes(friendId))
			return {
				id: friendId,
				username: (await this.findOne(friendId)).username
			}
		return null;
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

	dfa(user: User): Promise<User> {
		return this.update(user.id, {dfa: !user.dfa})
	}
}
