import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Notification, NotificationContent, NotificationType } from '../model/notification.entity';
import { User } from '../model/user.entity';
import { Repository } from 'typeorm';
import { Server } from 'socket.io';

@Injectable()
export class NotificationService {

    private wsServer: Server;
    constructor(@InjectRepository(Notification)
    private repo: Repository<Notification>,
    ) {

    }

    setWsServer(server: Server) {
		this.wsServer = server;
	}

    async create(data: Partial<Notification>) {
        const notification = this.repo.create(data);
        return await this.repo.save(notification);
    }

    async generateNotification(receiver: User, type: NotificationType, data: NotificationContent) : Promise<Notification> {
        const notification = this.repo.create({
           user : receiver,
           type : type,
           content : data
        });
        this.wsServer.to(`notification/${receiver.id}`).emit('notification.new', notification);
        return await this.repo.save(notification);
    }
    
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
