import { Column, Entity, ManyToMany, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./user.entity";

@Entity()
export class SavedGame {
    @PrimaryColumn()
    id: string;

    @ManyToMany(() => User, (user) => user.savedGames)
    players: User[];
}