import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Channel } from "./channel.entity";
import { Member } from "./member.entity";

@Entity()
export class Message {
	@PrimaryGeneratedColumn()
	id: number;

	@ManyToOne(() => Channel, channel => channel.messages)
	channel: Channel;

	@ManyToOne(() => Member, member => member.messages)
	owner: Member

	@Column({ default: new Date() })
	date: Date;

	@Column({ nullable: true})
	gameId: string | null;

	@Column()
	content: string;
}