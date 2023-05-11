import { AfterInsert, AfterUpdate, AfterRemove, Column, DeleteDateColumn, Entity, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn, JoinTable } from "typeorm";
import { Channel } from "./channel.entity";
import { Message } from "./message.entity";
import { User } from "./user.entity";
import { FriendRequest } from "./friend-request.entity";

@Entity()
export class Notification {
	@PrimaryGeneratedColumn()
	id: number;

	@ManyToOne(() => User, user => user.members)
	user: User;

    @Column()
	type: "directMessage" | "invitation" | "invitationChat"

    @OneToOne(() => FriendRequest , (friendRequest) => friendRequest.receiver)
	@JoinTable({})
	receiveRequests: FriendRequest

    @OneToOne(() => Message, message => message.owner)
    newMessage : Message;

    // for invitation 
    
	@DeleteDateColumn()
	deletedAt: Date;

}
