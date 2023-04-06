import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { User } from 'src/model/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { RefreshToken } from 'src/model/refresh-token';
import { UsersModule } from '../users.module';

@Module({
	imports: [
		TypeOrmModule.forFeature([RefreshToken]),
		PassportModule,
		JwtModule.register({
			secret: 'secret', // not secure at all need to be changed in production  put in a .env file
			signOptions: { expiresIn: '60s' },
		}),
		UsersModule
	],
	controllers: [AuthController],
	providers: [AuthService],
	exports: [AuthService],
})
export class AuthModule { }
