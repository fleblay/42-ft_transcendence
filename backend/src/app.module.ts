import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
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
import { RefreshToken } from './model/refresh-token';
import { AuthModule } from './users/auth/auth.module';

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
				entities:[User, SavedGame, RefreshToken]
			})
		}),
		UsersModule,
		EventsModule,
		GameModule,
		AuthModule
	],
	controllers: [AppController],
	providers: [AppService],
})
export class AppModule implements NestModule {
	configure(consumer: MiddlewareConsumer) {
	  consumer.apply(LogMiddleware).forRoutes('*');
	}
}
