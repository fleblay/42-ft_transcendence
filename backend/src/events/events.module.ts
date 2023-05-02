import { Module } from '@nestjs/common';
import { EventsGateway } from './events.gateway';
import {UsersModule } from '../users/users.module'
import { GameModule } from '../game/game.module';
import { FriendsModule } from '../friends/friends.module';
import { ChatModule } from '../chat/chat.module';

@Module({
	providers: [EventsGateway],
	imports: [
		UsersModule,
		GameModule,
		FriendsModule,
		ChatModule
	]
})
export class EventsModule {}
