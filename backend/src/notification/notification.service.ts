import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Notification, NotificationContent, NotificationType } from '../model/notification.entity';
import { User } from '../model/user.entity';
import { Repository } from 'typeorm';
import { Server } from 'socket.io';
import { UsersService } from '../users/users.service';

@Injectable()
export class NotificationService {

    private wsServer: Server;
    constructor(@InjectRepository(Notification)
    private repo: Repository<Notification>,
    private usersService: UsersService,
    ) {

    }

    setWsServer(server: Server) {
		this.wsServer = server;
	}

    async create(data: Partial<Notification>) {
        const notification = this.repo.create(data);
        return await this.repo.save(notification);
    }        

    async generateNotification(receiverId : number, type: NotificationType, data: NotificationContent) : Promise<Notification | null> {
        console.log("generate notification");
        const receiver = await this.usersService.findOne(receiverId);
        if (!receiver) {
            console.log("receiver not found");
            return null;
        }
        const notification = this.repo.create({
           user : receiver,
           type : type,
           content : data
        });
        console.log("notification created");
        this.wsServer.to(`/notification/${receiver.id}`).emit('notification.new', notification);
        console.log("notification sent");
        return notification;
    }
    //
    async getNotifications(user: User) {
        return await this.repo.find({
            where : {
                user : { id : user.id}
            },
            relations : ['user']
        });
    }

    async getNoReadNotifications(user: User) : Promise<Number>{
        return await this.repo.count({
            where : {
                user : { id : user.id},
                read : false
            },
            relations : ['user']
        });
    }


    

}
