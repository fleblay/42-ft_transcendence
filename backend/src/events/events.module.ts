import { Module } from '@nestjs/common';
import { EventsGateway } from './events.gateway';
import {UsersModule } from '../users/users.module'

@Module({
  providers: [EventsGateway],
  imports: [UsersModule]
})
export class EventsModule {}
