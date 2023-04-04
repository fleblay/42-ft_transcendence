import { Module } from '@nestjs/common';
import { GameService } from './game.service';
import { GameController } from './game.controller';
import { UsersModule } from 'src/users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SavedGame } from 'src/model/saved-game.entity';
import { GameCluster } from './game-cluster';
@Module({
	exports: [GameService],
	providers: [GameService, GameCluster],
	controllers: [GameController],
	imports: [
		UsersModule,
		TypeOrmModule.forFeature([SavedGame]),
	]
})
export class GameModule {}
