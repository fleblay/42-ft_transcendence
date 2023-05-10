import { AfterInsert, AfterUpdate, AfterRemove, Column, DeleteDateColumn, Entity, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
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

	@Column({ type: 'timestamptz', default: new Date() })
	muteTime: Date;

	@Column({ default: false })
	banned: boolean;

	@Column({ default: false })
	left: boolean;

	@Column({ default: "regular" })
	role: "owner" | "admin" | "regular"

	@DeleteDateColumn()
	deletedAt: Date;

	@AfterInsert()
	logInsert() {
		console.log('Inserted Member', this);
	}
	@AfterUpdate()
	logUpdate() {
		console.log('Updated Member', this);
	}
	@AfterRemove()
	logRemove() {
		console.log('Removed Member', this);
	}
}
