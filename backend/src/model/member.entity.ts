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

	@Column({ default: new Date('28/07/2021 07:00').toDateString() })
	muteTime: string ;

	@Column({ default: false })
	banned: boolean;

	@Column({ default: false })
	kicked: boolean;

	@Column({ default: "regular" })
	role: "owner" | "admin" | "regular"

}
