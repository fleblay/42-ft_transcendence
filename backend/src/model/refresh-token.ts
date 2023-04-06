import { Column, Entity, ManyToMany, ManyToOne, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./user.entity";

@Entity()
export class RefreshToken {
    @PrimaryGeneratedColumn()
    id: number;
	@Column()
	refreshtoken: string;

	@Column()
	userid: number;

}