import { Module, forwardRef } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { AuthService } from './auth/auth.service';
import { User } from '../model/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { RefreshToken } from '../model/refresh-token.entity';
import {GameModule} from '../game/game.module'
import { FriendsModule } from 'src/friends/friends.module';
import { ChatModule } from '../chat/chat.module';
import { SavedGameSubscriber } from '../model/saved-game.subscriber';
import { NotificationSubscriber } from '../notification/notification.subscriber';
import { NotificationModule } from '../notification/notification.module';

@Module({
	imports: [
		TypeOrmModule.forFeature([User, RefreshToken]),
		JwtModule.register({
			secret: 'secret', // not secure at all need to be changed in production  put in a .env file
			signOptions: { expiresIn: '600s' },
		}),
		forwardRef(() => GameModule),
		forwardRef(() => FriendsModule),
		forwardRef(() => ChatModule),
		forwardRef(() => NotificationModule),
	],
	controllers: [UsersController],
	providers: [AuthService, UsersService, SavedGameSubscriber, NotificationSubscriber ],
	exports: [AuthService, UsersService, SavedGameSubscriber, NotificationSubscriber],
})
export class UsersModule { }
//
