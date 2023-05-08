import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Member } from "./member.entity";
import { Message } from "./message.entity";

@Entity()
export class Channel {
	@PrimaryGeneratedColumn('uuid')
	id: string;

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

	@CreateDateColumn()
	createdAt: Date;

	@Column({ default: false })
	directMessage: boolean;
}
//