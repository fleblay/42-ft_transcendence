import { Module, forwardRef } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { NotificationController } from './notification.controller';
import { UsersModule } from 'src/users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Notification } from '../model/notification.entity';
import { NotificationSubscriber } from './notification.subscriber';
import { ChatModule } from 'src/chat/chat.module';

@Module({
  providers: [NotificationService, NotificationSubscriber],
  controllers: [NotificationController],
  exports: [NotificationService, NotificationSubscriber],
  imports: [
    forwardRef(()=>UsersModule),
    ChatModule,
  TypeOrmModule.forFeature([Notification])],
})
export class NotificationModule {
}
