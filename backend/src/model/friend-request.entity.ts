import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, DeleteDateColumn } from 'typeorm';
import { User } from './user.entity';


export type FriendRequestStatus = "pending" | "accepted" | "refused";

@Entity()
export class FriendRequest {
	@PrimaryGeneratedColumn()
	id: number;

	@ManyToOne(() => User, (user) => user.sentRequests)
	sender: User;

	@ManyToOne(() => User, (user) => user.receivedRequests)
	receiver: User;

	@Column({default : "pending"})
	status: FriendRequestStatus;

	@DeleteDateColumn()
	deletedAt: Date;
}

