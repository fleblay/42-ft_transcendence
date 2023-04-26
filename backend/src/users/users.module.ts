import { Module, forwardRef } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { AuthService } from './auth/auth.service';
import { User } from '../model/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { RefreshToken } from '../model/refresh-token.entity';
import {GameModule} from '../game/game.module'
import { FriendRequest } from 'src/model/friend-request.entity';
import { FriendsService } from './friends.service';

@Module({
	imports: [
		TypeOrmModule.forFeature([User, RefreshToken, FriendRequest]),
		JwtModule.register({
			secret: 'secret', // not secure at all need to be changed in production  put in a .env file
			signOptions: { expiresIn: '600s' },
		}),
		forwardRef(() => GameModule)
	],
	controllers: [UsersController],
	providers: [AuthService, UsersService, FriendsService,],
	exports: [AuthService, FriendsService, UsersService],
})
export class UsersModule { }
//
