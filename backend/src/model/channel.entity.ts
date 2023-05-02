import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Member } from "./member.entity";
import { Message } from "./message.entity";

@Entity()
export class Channel {
	@PrimaryGeneratedColumn()
	id: number;

	@Column()
	name: string;

	@Column()
	private: boolean;

	@Column({ default: '' })
	password: string;

	@OneToMany(() => Message, message => message.channel)
	messages: Message[];

	@OneToMany(() => Member, member => member.channel)
	members: Member[];
}