import { Module } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { NotificationController } from './notification.controller';
import { UsersModule } from 'src/users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Notification } from '../model/notification.entity';

@Module({
  providers: [NotificationService],
  controllers: [NotificationController],
  exports: [NotificationService],
  imports: [UsersModule,
  TypeOrmModule.forFeature([Notification])],

  
})
export class NotificationModule {
}
