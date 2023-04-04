import { Column, Entity, ManyToMany, ManyToOne, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./user.entity";

@Entity()
export class SavedGame {
    @PrimaryColumn()
    id: string;

    @ManyToMany(() => User, (user) => user.savedGames)
    players: User[];

	@Column("int", { array: true })
	score : number[];

	@ManyToOne(() => User, (user) => user.wonGames)
	winner : User;
}