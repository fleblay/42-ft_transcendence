import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../model/user.entity'
import { CreateUserDto } from './dtos/create-user.dto';

@Injectable()
export class UsersService {

	
	constructor(@InjectRepository(User) private repo: Repository<User>){}

	create(dataUser: CreateUserDto){
		console.log(`create user ${dataUser.username} : ${dataUser.email} : ${dataUser.password}`);
		const user = this.repo.create(dataUser);
		console.log(`save user : ${user}`);
		return this.repo.save(user);
	}

	find(email: string) {
		console.log("find :", email);
		return this.repo.find();
	}

	async findOne(id: number) {
		if (!id) return null;
		return await this.repo.findOneBy({ id });
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
}