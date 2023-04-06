
import { AfterInsert, AfterRemove, AfterUpdate, Entity, Column, PrimaryGeneratedColumn, ManyToMany, JoinTable, OneToMany } from 'typeorm';
import { SavedGame } from './saved-game.entity';

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

	@Column()
	refreshtoken: string;
	
	@ManyToMany(() => SavedGame, (savedGame) => savedGame.players)
	@JoinTable()
	savedGames: SavedGame[];

	@OneToMany(() => SavedGame, (savedGame) => savedGame.winner)
	//@JoinTable()
	wonGames: SavedGame[];

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