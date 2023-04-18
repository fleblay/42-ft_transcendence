import { Module } from '@nestjs/common';
import { EventsGateway } from './events.gateway';
import {UsersModule } from '../users/users.module'
import { GameModule } from '../game/game.module';

@Module({
	providers: [EventsGateway],
	imports: [UsersModule, GameModule]
})
export class EventsModule {}
