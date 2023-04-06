import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { AuthService } from './auth/auth.service';
import { User } from 'src/model/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import passport, { Passport } from 'passport';
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from './strategy/local.strategy';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './strategy/jwt.strategy';
import { RefreshToken } from 'src/model/refresh-token';
import { RefreshTokenStrategy } from './strategy/refreshToken.strategy';
import { AccessTokenStrategy } from './strategy/accessToken.strategy';

@Module({
	imports: [
		TypeOrmModule.forFeature([User, RefreshToken]),
		PassportModule,
		JwtModule.register({
			secret: 'secret', // not secure at all need to be changed in production  put in a .env file
			signOptions: { expiresIn: '600s' },
		})
	],
	controllers: [UsersController],
	providers: [AuthService, UsersService, LocalStrategy, JwtStrategy, RefreshTokenStrategy, AccessTokenStrategy],
	exports: [AuthService, UsersService],
})
export class UsersModule { }
