import { Module, forwardRef } from '@nestjs/common';
import { FriendsController } from './friends.controller';
import { FriendsService } from './friends.service';
import { UsersModule } from 'src/users/users.module';
import { GameModule } from 'src/game/game.module';
import { FriendRequest } from 'src/model/friend-request.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
	controllers: [FriendsController],
	providers: [FriendsService],
	imports: [
		forwardRef(() => UsersModule),
		GameModule,
		TypeOrmModule.forFeature([FriendRequest]),
	],
	exports: [FriendsService]
})
export class FriendsModule {}
