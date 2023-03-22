import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { configService } from './config/config.service';

@Module({
  imports: [
	TypeOrmModule.forRootAsync({
		inject: [ConfigService],
		useFactory : (config: ConfigService) =>{
			return {
				type: 'postgres',
				database: config.get<string>("POSTGRES_DATABASE"),
				user: config.get<string>("POSTGRES_USER"),
				host: config.get<string>("POSTGRES_HOST"),
				port: config.get<string>("POSTGRES_PORT"),
			}
		}
	})],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
