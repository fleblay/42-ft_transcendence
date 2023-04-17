import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../model/user.entity'
import { CreateUserDto } from './dtos/create-user.dto';
import { UserStatus } from '../type';

@Injectable()
export class UsersService {

	private connectedUsers: Map<number, UserStatus[]> = new Map<number, UserStatus[]>();

	constructor(@InjectRepository(User) private repo: Repository<User>) {
		setInterval(() => { console.log("\x1b[34mConnected users are : \x1b[0m", this.connectedUsers) }, 5000)
}

	create(dataUser: CreateUserDto) {
		console.log(`create user ${dataUser.username} : ${dataUser.email} : ${dataUser.password}`);
		const user = this.repo.create(dataUser);
		console.log("save user :", user);
		return this.repo.save(user);
	}

	getAll() {
		return this.repo.createQueryBuilder("user")
			.leftJoinAndSelect("user.savedGames", "savedgames")
			.leftJoinAndSelect("user.wonGames", "wongames")
			/*
			.leftJoin("savedgames.players", "players")
			.addSelect(["players.id", "players.username"])
			.leftJoin("games.winner", "winner")
			.addSelect(["winner.id", "winner.username"])
			*/
			.getMany()
	}


	findOne(id: number) {
		if (!id) return null;
		//return this.repo.findOneBy({ id });
		return this.repo.createQueryBuilder("user")
			.leftJoinAndSelect("user.savedGames", "savedgames")
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
			this.connectedUsers.get(id).push(UserStatus.online)
		else
			this.connectedUsers.set(id, [UserStatus.online])
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
		this.changeStatus(id, { oldStatus: UserStatus.online })
	}


}
