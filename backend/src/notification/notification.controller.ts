import { Controller, Get, UseGuards } from '@nestjs/common';
import { ATGuard } from '../users/guard/access-token.guard';
import { CurrentUser } from '../users/decorators/current-user.decorator';
import { User } from '../model/user.entity';
@Controller('notification')
@UseGuards(ATGuard)
export class NotificationController {

    @Get('/myNotifications')
    getMyNotifications(@CurrentUser() user: User) {
        return "my notifications";
    }
}
