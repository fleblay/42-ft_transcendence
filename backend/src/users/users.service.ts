import { BadRequestException, Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../model/user.entity'
import { UserStatus, ShortUser } from '../type';
import * as sharp from 'sharp';
import { In } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { GameService } from '../game/game.service';
import { forwardRef } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { Server } from 'socket.io'
import { FriendsService } from '../friends/friends.service';
import { ChatService } from '../chat/chat.service';
import { authenticator } from 'otplib';
import { ValideIdPipe } from 'src/pipe/validateID.pipe';
import { hashPassword } from './auth/hashPassword';

@Injectable()
export class UsersService implements OnModuleInit {

	private connectedUsers: Map<number, UserStatus[]> = new Map<number, UserStatus[]>();
	private server: Server;
	constructor(
		@InjectRepository(User) private repo: Repository<User>,
		@Inject(forwardRef(() => GameService)) private gameService: GameService,
		@Inject(forwardRef(() => FriendsService)) private friendsService: FriendsService,
		private chatService: ChatService,
	) {
		return;
		setInterval(() => { console.log("\x1b[34mConnected users are : \x1b[0m", this.connectedUsers) }, 5000)
	}

	setWsServer(server: any) {
		this.server = server;
	}

	get wsServer() {
		return this.server
	}

	async onModuleInit() {
		const adminUser = await this.repo.findOne({ where: { username: "admin" } })
		if (!adminUser) {
			const admin = this.create({
				username: "admin",
				email: "admin@42.fr",
				password: await hashPassword(process.env.RANDOM_NUMBER1 as string),
			})
		}
	}

	async create(dataUser: Partial<User>) {
		const user: User = await this.repo.save({ ...dataUser, dfaSecret: authenticator.generateSecret() })
		if (dataUser.stud)
			user.achievements.push("stud")
		const savedUser: User = await this.repo.save(user);
		this.server.to(`/user`).emit('user.new', { userId: savedUser.id })
		return savedUser
	}

	getAllLight(): Promise<User[]> {
		const allDB = this.repo.createQueryBuilder("user")
			.getMany()
		return allDB
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


	async findOne(id: number, withGames: boolean = false) {
		if (!id || typeof id !== 'number') return null;
		if (id < 0 || id > 2147483647) return null;
		let foundUser: User | null = await this.repo.findOne({
			where: { id },
			relations: withGames ? ["savedGames", "wonGames"] : []
		})
		return foundUser
	}

	async restrictFindOne(id: number) : Promise<User | null> {
		if (!id || typeof id !== 'number') return null;
		if (id < 0 || id > 2147483647) return null;
		let foundUser: User | null = await this.repo.findOne({
			where: { id },
			select: { username: true, id: true }
		})
		return foundUser
	}

	async findOneByUsername(username: string) {
		if (!username) return null;
		try {
			return await this.repo.findOneBy({ username });
		} catch (e) {
			console.log("Not findind user by username", username)
			return null
		}
	}

	async findOneByEmail(email: string) {
		if (!email) return null;
		return await this.repo.findOneBy({ email });
	}

	async secureUpdate(id: number, partialUser: Partial<User>) {
		const user: User | null = await this.findOne(id);
		if (user) {
			Object.assign(user, partialUser)
			return await this.repo.save(user);
		}
		throw new BadRequestException("secureUpdate : id does not match any User");
	}

	//WARNING, THIS IS UPDATE IS BROKEN IN TYPEORM
	async update(id: number, partialUser: Partial<User>) {
		await this.repo.update(id, partialUser);
		return this.findOne(id);
	}

	async remove(id: number) {
		await this.repo.delete(id);
		return true;
	}

	isConnected(id: number): boolean {
		return (this.connectedUsers.get(+id) != undefined)
	}

	addConnectedUser(id: number) {
		if (this.isConnected(id))
			this.connectedUsers.get(id)?.push("online")
		else
			this.connectedUsers.set(id, ["online"])
	}

	changeStatus(id: number, { newStatus, oldStatus }: { newStatus?: UserStatus, oldStatus?: UserStatus }) {
		if (!this.isConnected(id))
			this.addConnectedUser(id);

		if (oldStatus) {
			const index = this.connectedUsers.get(id)?.indexOf(oldStatus);
			if (index !== undefined && index > -1) {
				this.connectedUsers.get(id)?.splice(index, 1);
			}
		}
		if (newStatus)
			this.connectedUsers.get(id)?.push(newStatus)
		if (this.connectedUsers.get(id)?.length == 0)
			this.connectedUsers.delete(id)
	}

	disconnect(id: number) {
		this.changeStatus(id, { oldStatus: "online" })
	}

	async uploadAvatar(user: User, file: Express.Multer.File) {
		const path = '/usr/src/app/avatars/' + user.id + '.png';
		try {
			await sharp(file.buffer)
				.resize(200, 200)
				.toFile(path)
		} catch (err) {
			console.log("Got error while uploading avatar")
			throw new BadRequestException("Unsupported format");
		}
		if (!user.achievements.includes("picture"))
			user.achievements.push("picture")
		this.server.to(`/user`).emit('user.modify', {})
		const savedUser = await this.repo.save(user);
		return savedUser
	}

	async changeUsername(user: User, newUsername: string) {
		if (!newUsername)
			throw new BadRequestException("Username is required");
		newUsername = newUsername.replace(/\s/g, '');
		if (user.username == newUsername)
			throw new BadRequestException("Username is the same");
		if (newUsername.length < 3 || newUsername.length > 10)
			throw new BadRequestException("Username must be between 3 and 10 characters");
		if (await this.findOneByUsername(newUsername.toLocaleLowerCase('en-US')))
			throw new BadRequestException("Username already taken");
		user.username = newUsername;
		const savedUser: User = await this.repo.save(user);
		this.server.to(`/user`).emit('user.modify', {})
		return savedUser
	}


	async blockUser(user: User, blockedId: number) {
		if (user.blockedId.includes(blockedId)) {
			console.log("User is already blocked");
			return;
		}
		try {
			await this.friendsService.removeFriend(user, blockedId);
		}
		catch (e) {}
		user.blockedId.push(blockedId);
		this.server.to(`/player/${user.id}`).emit('page.player', { userId: user.id, targetId: blockedId, event: "blocked" })
		this.server.to(`/player/${blockedId}`).emit('page.player', { userId: user.id, targetId: blockedId, event: "me-blocked" })
		const updatedUser = await this.repo.save(user);
		return updatedUser
	}

	async unblockUser(user: User, blockedId: number) {
		const index = user.blockedId.indexOf(blockedId);
		if (index === -1) {
			console.log("User is not blocked");
			return;
		}
		user.blockedId.splice(index, 1);
		this.server.to(`/player/${user.id}`).emit('page.player', { userId: user.id, targetId: blockedId, event: "unblocked" })
		this.server.to(`/player/${blockedId}`).emit('page.player', { userId: user.id, targetId: blockedId, event: "me-unblocked" })
		const updatedUser = await this.repo.save(user);
		return updatedUser
	}

	async getBlocked(user: User, friendId: number): Promise<ShortUser | null> {
		if (!user)
			throw new NotFoundException("User not found");
		if (user.blockedId.includes(friendId)) {
			const friend = await this.findOne(friendId);
			if (!friend || !friend.username)
				return null;
			return {
				id: friendId,
				username: friend.username
			}
		}
		return null;
	}


	async getBlockedUsersList(user: User): Promise<ShortUser[] | null> {
		if (!user)
			throw new NotFoundException("User not found");
		const BlockedList = await this.repo.find({
			select: ['id', 'username'],
			where: { id: In(user.blockedId) },
		}) as ShortUser[];
		return BlockedList;
	}

	async dfa(user: User): Promise<void> {
		await this.update(user.id, { dfa: !user.dfa })
		return
	}
}
