
import { AfterInsert, AfterRemove, AfterUpdate, Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';

@Entity()
export class User {
	@PrimaryGeneratedColumn()
	id: number;

	@Column()
	username: string;
	@Column()
	email: string;
	@Column()
	password: string;

	@AfterInsert()
	logInsert() {
		console.log(`insert User with id ${this.id}`);
	}

	@AfterUpdate()
	logUpdate() {
		console.log(`update User with id ${this.id}`);
	}

	@AfterRemove()
	logRemove() {
		console.log(`remove User with id ${this.id}`);
	}
}