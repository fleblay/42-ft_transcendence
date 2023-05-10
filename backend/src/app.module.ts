import { Module, NestModule, MiddlewareConsumer, ValidationPipe } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UsersModule } from './users/users.module';
import { User } from './model/user.entity'
import { EventsModule } from './events/events.module';
import { LogMiddleware } from './app.middleware';
import { GameModule } from './game/game.module';
import { SavedGame } from './model/saved-game.entity';
import { RefreshToken } from './model/refresh-token.entity';
import { AuthModule } from './users/auth/auth.module';
import { FriendRequest } from './model/friend-request.entity';
import { FriendsModule } from './friends/friends.module';
import { ChatModule } from './chat/chat.module';
import { APP_PIPE } from '@nestjs/core';
import { Member } from './model/member.entity';
import { Message } from './model/message.entity';
import { Channel } from './model/channel.entity';
import { Subscriber } from 'rxjs';
import { ChannelSubscriber } from './events-subscriber/event-subsriber.listener';
import { EventsSubscriberModule } from './events-subscriber/events-subscriber.module';

@Module({
	imports: [
		ConfigModule.forRoot({
			isGlobal: true,
			envFilePath: '.env',
		}),
		TypeOrmModule.forRootAsync({
			inject: [ConfigService],
			useFactory: async (config: ConfigService) => ({
				type: 'postgres',
				host: config.get<string>("POSTGRES_HOST"),
				database: config.get<string>("POSTGRES_DB"),
				username: config.get<string>("POSTGRES_USER"),
				password: config.get<string>("POSTGRES_PASSWORD"),
				synchronize: true,
				entities: [
					User,
					SavedGame,
					RefreshToken,
					FriendRequest,
					Member,
					Message,
					Channel
				],
				subscribers: [ChannelSubscriber],

			})
		}),
		UsersModule,
		EventsModule,
		GameModule,
		AuthModule,
		FriendsModule,
		ChatModule,
		EventsSubscriberModule
	],
	controllers: [AppController],
	providers: [
		AppService,
		{
			provide: APP_PIPE,
			useValue: new ValidationPipe({
				whitelist: true,
			}),
		},
	],
})
export class AppModule implements NestModule {
	configure(consumer: MiddlewareConsumer) {
		consumer.apply(LogMiddleware).forRoutes('*');
	}
}
