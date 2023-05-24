import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule} from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { RefreshToken } from '../../model/refresh-token.entity';
import { UsersModule } from '../users.module';

@Module({
	imports: [
		TypeOrmModule.forFeature([RefreshToken]),
		JwtModule.register({
			secret: process.env.SECRET_ACCESS, // not secure at all need to be changed in production  put in a .env file
			signOptions: { expiresIn: '60s' },
		}),
		UsersModule
	],
	controllers: [AuthController],
	providers: [AuthService, UsersModule],
	exports: [AuthService],
})
export class AuthModule { }
