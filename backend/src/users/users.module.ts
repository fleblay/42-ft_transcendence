import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { AuthService } from './auth.service';
import { User } from 'src/model/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import passport, { Passport } from 'passport';
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from './local.strategy';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './jwt.strategy';

@Module({
	imports: [
		TypeOrmModule.forFeature([User]),
		PassportModule,
		JwtModule.register({
			secret: 'secret', // not secure at all need to be changed in production  put in a .env file
			signOptions: { expiresIn: '60s' },
		})
	],
	controllers: [UsersController],
	providers: [AuthService, UsersService, LocalStrategy, JwtStrategy],
	exports: [AuthService, UsersService],
})
export class UsersModule { }
