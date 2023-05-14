import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Notification, NotificationContent, NotificationType } from '../model/notification.entity';
import { User } from '../model/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class NotificationService {

    constructor(@InjectRepository(Notification) private repo: Repository<Notification>) {

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

    

}
