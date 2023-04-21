
import { AfterInsert, AfterRemove, AfterUpdate, Entity, Column, PrimaryGeneratedColumn, ManyToMany, JoinTable, OneToMany } from 'typeorm';
import { SavedGame } from './saved-game.entity';

@Entity()
export class User {
	@PrimaryGeneratedColumn()
	id: number;

	@Column({ nullable: true })
	username: string | null;
	@Column()
	email: string;
	@Column()
	password: string;

	@Column({ type: 'simple-array', default: [] })
	friendsId: number[];

	@Column({ type: 'simple-array', default: [] })
	blockedId: number[];

	@Column({default : false})
	stud : boolean;

	@Column({default : false})
	dfa: boolean;

	@ManyToMany(() => SavedGame, (savedGame) => savedGame.players)
	@JoinTable({})
	savedGames: SavedGame[];

	@OneToMany(() => SavedGame, (savedGame) => savedGame.winner)
	//@JoinTable()
	wonGames: SavedGame[];

/* 	@AfterInsert()
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
	} */

}
