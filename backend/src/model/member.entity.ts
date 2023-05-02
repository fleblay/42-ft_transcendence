import { Column, Entity, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
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

	@ManyToOne(() => Message)
	lastRead: Message;

	@Column({ nullable: true, default: null })
	muteTime: Date | null;

	@Column({ default: false })
	banned: boolean;

	@Column({ default: false })
	kicked: boolean;

	@Column({ default: "regular" })
	role: "owner" | "admin" | "regular"

}
