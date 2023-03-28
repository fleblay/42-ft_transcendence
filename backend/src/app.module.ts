import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UsersModule } from './users/users.module';
import { User } from './model/user.entity'
import { EventsModule } from './events/events.module';

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
				entities:[User]
			})
		}),
		UsersModule,
		EventsModule,
	],
	controllers: [AppController],
	providers: [AppService],
})
export class AppModule { }
