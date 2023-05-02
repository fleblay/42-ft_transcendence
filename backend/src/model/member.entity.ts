import { Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Channel } from "./channel.entity";
import { Message } from "./message.entity";
import { User } from "./user.entity";

@Entity()
export class Member {
	@PrimaryGeneratedColumn()
	id: number;

	@ManyToOne(() => User, user => user.members)
	user: User;

	@ManyToOne(() => Channel, channel => channel.members)
	channel: Channel;

	@OneToMany(() => Message, message => message.owner)
	messages: Message[];
}