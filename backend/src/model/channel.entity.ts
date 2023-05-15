import { AfterInsert, Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Member } from "./member.entity";
import { Message } from "./message.entity";
import { WebSocketServer } from "@nestjs/websockets";
import { Server} from 'socket.io'

@Entity()
export class Channel {

	private server : Server;
	
	setServer(server : Server) {
		this.server = server;
	}

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

	@Column({ default: false })
	directMessage: boolean;


	@AfterInsert()
	afterInsert() {
		console.log('Inserted Channel');
		this.server.emit('chat.message.new', {content: this.name, id: this.id});
	}

}
//