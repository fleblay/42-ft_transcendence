import { Module } from '@nestjs/common';
import { ChannelSubscriber } from './event-subsriber.listener';
import { UsersModule } from 'src/users/users.module';
import { GameModule } from 'src/game/game.module';
import { FriendsModule } from 'src/friends/friends.module';
import { ChatModule } from 'src/chat/chat.module';

@Module({
	providers: [ChannelSubscriber],
	imports: [
		UsersModule,
		GameModule,
		FriendsModule,
		ChatModule
	]
})

export class EventsSubscriberModule {}
