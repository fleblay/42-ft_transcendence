import { Controller, Get, UseGuards } from '@nestjs/common';
import { ATGuard } from '../users/guard/access-token.guard';
import { CurrentUser } from '../users/decorators/current-user.decorator';
import { User } from '../model/user.entity';
import { NotificationService } from './notification.service';
@Controller('notification')
@UseGuards(ATGuard)
export class NotificationController {

    constructor(private notificationService: NotificationService) {
    }

    @Get('/myNotifications')
    getMyNotifications(@CurrentUser() user: User) {
        return this.notificationService.getNotifications(user);
    }

    @Get('/noRead')
    getNoReadNotifications(@CurrentUser() user: User) {
        return this.notificationService.getNoReadNotifications(user);
    }
}
