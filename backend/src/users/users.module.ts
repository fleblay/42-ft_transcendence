import { Module, forwardRef } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { AuthService } from './auth/auth.service';
import { User } from '../model/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { RefreshToken } from '../model/refresh-token.entity';
import {GameModule} from '../game/game.module'

@Module({
	imports: [
		TypeOrmModule.forFeature([User, RefreshToken]),
		JwtModule.register({
			secret: 'secret', // not secure at all need to be changed in production  put in a .env file
			signOptions: { expiresIn: '600s' },
		}),
		forwardRef(() => GameModule)
	],
	controllers: [UsersController],
	providers: [AuthService, UsersService],
	exports: [AuthService, UsersService],
})
export class UsersModule { }
//
