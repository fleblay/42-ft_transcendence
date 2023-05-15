import { Module } from '@nestjs/common';
import { EventsGateway } from './events.gateway';
import {UsersModule } from '../users/users.module'
import { GameModule } from '../game/game.module';
import { FriendsModule } from '../friends/friends.module';
import { ChatModule } from '../chat/chat.module';
import { NotificationModule } from '../notification/notification.module';

@Module({
	providers: [EventsGateway],
	imports: [
		UsersModule,
		GameModule,
		FriendsModule,
		ChatModule,
		NotificationModule
	]
})
export class EventsModule {}
