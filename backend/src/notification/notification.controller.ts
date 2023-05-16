import { Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ATGuard } from '../users/guard/access-token.guard';
import { CurrentUser } from '../users/decorators/current-user.decorator';
import { User } from '../model/user.entity';
import { NotificationService } from './notification.service';
import { ValideIdPipe } from 'src/pipe/validateID.pipe';
@Controller('notification')
@UseGuards(ATGuard)
export class NotificationController {

    constructor(private notificationService: NotificationService) {
    }

    @Get('/myNotifications')
    async getMyNotifications(@CurrentUser() user: User) {
        return await this.notificationService.getNotifications(user);
    }

    @Get('/noRead')
    async getNoReadNotifications(@CurrentUser() user: User) {
        //console.log("get no read notifications");
        return await this.notificationService.getNoReadNotifications(user);
    }

    @Post('/ack/:id')
    async ackNotification(@CurrentUser() user: User, @Param('id', ValideIdPipe) notificationId: number) {
		await this.notificationService.ackNotification(user, notificationId);
	}

}
