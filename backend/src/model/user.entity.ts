
import { AfterInsert, AfterRemove, AfterUpdate, Entity, Column, PrimaryGeneratedColumn, OneToMany} from 'typeorm';

@Entity()
export class User{
	@PrimaryGeneratedColumn()
	id: number;
	@Column()
	email: string;
	@Column()
	password: string;

	@Column({ default: true })
	admin: boolean;

	@AfterInsert()
	logInsert(){
		console.log(`insert User with id ${this.id}`);
	}

	@AfterUpdate()
	logUpdate(){
		console.log(`update User with id ${this.id}`);
	}

	@AfterRemove()
	logRemove(){
		console.log(`remove User with id ${this.id}`);
	}
}