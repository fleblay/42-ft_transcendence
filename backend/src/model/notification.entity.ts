import { AfterInsert, AfterUpdate, AfterRemove, Column, DeleteDateColumn, Entity, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn, JoinTable, CreateDateColumn, JoinColumn } from "typeorm";
import { Channel } from "./channel.entity";
import { Message } from "./message.entity";
import { User } from "./user.entity";
import { FriendRequest } from "./friend-request.entity";

export type NotificationContent = FriendRequest | Channel | Message;
export type NotificationType = "directMessage" | "friendRequest" | "channelInvitation"

@Entity()
export class Notification {
	@PrimaryGeneratedColumn()
	id: number;


	@ManyToOne(() => User, (user) => user.notifications)
	user: User;

    @Column()
	type: NotificationType;


	// user or channel id
	@Column()
	contentId : number;

	@Column()
	name : string;

	@Column({ default: false })
	read: boolean;
	
	@CreateDateColumn()
	createdAt: Date;
    // for invitation 
    
	@DeleteDateColumn()
	deletedAt: Date;

}
