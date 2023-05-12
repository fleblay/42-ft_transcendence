import { AfterInsert, Column, CreateDateColumn, Entity, InsertEvent, ManyToMany, ManyToOne, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./user.entity";

@Entity()
export class SavedGame {
    @PrimaryColumn()
    id: string;

    @ManyToMany(() => User, (user) => user.savedGames, {eager: true})
    players: User[];

	@Column("int", { array: true })
	score : number[];

	@CreateDateColumn()
	date : Date;

	@ManyToOne(() => User, (user) => user.wonGames, {eager: true})
	winner : User;

}
