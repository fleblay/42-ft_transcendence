import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Notification, NotificationContent, NotificationType } from '../model/notification.entity';
import { User } from '../model/user.entity';
import { Repository } from 'typeorm';
import { Server } from 'socket.io';
import { UsersService } from '../users/users.service';
import { FriendRequest } from 'src/model/friend-request.entity';

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

    async generateNotification(receiverId : number, type: NotificationType, data : any) : Promise<Notification | null> {
        console.log("generate notification");
        const receiver : User | null= await this.usersService.findOne(receiverId);
        if (!receiver) {
            console.log("receiver not found");
            return null;
        }
        console.log("receiver found", receiver);
        const name = (type === "friendRequest") ? data.sender.username : data.channel.name;
        const id = (type === "friendRequest") ? data.sender.id : data.channel.id;
        const notification : Notification = await this.repo.save({
           user : receiver,
           type : type,
           contentId : id,
           name : name,
        });
       
        this.wsServer.to(`/notification/${receiver.id}`).emit('notification.new', notification);
        return notification;

    }

    async deleteNotification(data : any, type : NotificationType) {

        if (type === "friendRequest") {
             const notification = await this.repo.findOne({
                where : {
                type : "friendRequest",
                contentId : data.sender.id,
                user : { id : data.receiver.id}
            }
        });
        if (!notification) {
            return;
        }
        const notificationId = notification.id;
        await this.repo.remove(notification);
        console.log("notification deleted", notificationId);
        this.wsServer.to(`/notification/${data.receiver.id}`).emit('notification.delete', notificationId);
    }
}

    //
    async getNotifications(user: User) : Promise<Notification[]> {
        const notifications = await this.repo.find({
            where : {
                user : { id : user.id}
            },
            relations : ['user']
        });
        
        notifications.forEach(notification => {
            notification.read = true;
            this.repo.save(notification);
        });
        console.log("notifications", notifications);
        return notifications;
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
