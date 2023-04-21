import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../model/user.entity'
import { CreateUserDto } from './dtos/create-user.dto';
import { UserStatus } from '../type';
import { createWriteStream } from 'fs';
import * as sharp from 'sharp';
import { In } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { Friend } from '../type';
import { GameService } from '../game/game.service';
import { forwardRef } from '@nestjs/common';
import { Inject } from '@nestjs/common';


@Injectable()
export class UsersService {

	private connectedUsers: Map<number, UserStatus[]> = new Map<number, UserStatus[]>();

	constructor(@InjectRepository(User) private repo: Repository<User>, @Inject(forwardRef(() => GameService))
	private gameService: GameService) {
		//setInterval(() => { console.log("\x1b[34mConnected users are : \x1b[0m", this.connectedUsers) }, 5000)
}

	create(dataUser: CreateUserDto) {
		console.log(`create user ${dataUser.username} : ${dataUser.email} : ${dataUser.password}`);
		const user = this.repo.create(dataUser);
		console.log("save user :", user);
		return this.repo.save(user);
	}

	getAll() : Promise<User[]> {
		const allDB =this.repo.createQueryBuilder("user")
			.leftJoinAndSelect("user.savedGames", "savedgames")
			.leftJoinAndSelect("user.wonGames", "wongames")
			.getMany()
		return allDB
	}


	findOne(id: number) {
		if (!id) return null;
		//return this.repo.findOneBy({ id });
		return this.repo.createQueryBuilder("user")
			.leftJoinAndSelect("user.savedGames", "savedgames")
			.leftJoinAndSelect("user.wonGames", "wongames")
			.where("user.id = :userId", {userId: id})
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
		console.log('changing status : new ', newStatus,'old :', oldStatus)
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

	async uploadAvatar(user: User , file: Express.Multer.File) {
		const path = '/usr/src/app/avatars/' + user.id + '.png';
		console.log("user.controller.uploadAvatar", file.buffer);
		await sharp(file.buffer)
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
		console.log ("user", user);
		return this.repo.save(user);
	}

	async changeUsername(user: User, newUsername: string) {
		if (!newUsername)
			throw new BadRequestException("Username is required");
		if (user.username == newUsername)
			return user;
		if (await this.findOneByUsername(newUsername))
			throw new BadRequestException("Username already taken");
		if (newUsername.length < 3 || newUsername.length > 20)
			throw new BadRequestException("Username must be between 3 and 20 characters");
		user.username = newUsername;
		return this.repo.save(user);
	}

	addFriend(user: User, friendId: number) {
		if (user.friendsId.includes(friendId))
			throw new BadRequestException("User is already your friend");
		user.friendsId.push(friendId);
		return this.repo.save(user);
	}

	removeFriend(user: User, friendId: number) {
		const index = user.friendsId.indexOf(friendId);
		if (index > -1) {
			user.friendsId.splice(index, 1);
		}
		return this.repo.save(user);
	}


	blockUser(user: User, blockedId: number) {
		if (user.blockedId.includes(blockedId))
			throw new BadRequestException("User is already blocked");
		user.blockedId.push(blockedId);
		return this.repo.save(user);
	}

	unblockUser(user: User, blockedId: number) {
		const index = user.blockedId.indexOf(blockedId);
		if (index > -1) {
			user.blockedId.splice(index, 1);
		}
		return this.repo.save(user);
	}

	async getFriendsList(userId: number) : Promise<Friend[]>{
		
		const user = await this.findOne(userId);
		if (!user)
			throw new NotFoundException("User not found");
		const partialFriendList = await this.repo.find({
			select: ['id', 'username'],
			where: { id: In(user.friendsId) },
		  }) as Partial<Friend>[];

		  const friendList = partialFriendList.map((friend : Partial<Friend>) => {
			  return {
				  id: friend.id,
				  username: friend.username,
				  online : this.isConnected(friend.id),
				  status : this.gameService.userStatus(friend.id)
			  }
			}
		  );
		  return friendList;
	}

}
