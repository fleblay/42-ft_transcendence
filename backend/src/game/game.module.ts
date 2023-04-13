import { Module } from '@nestjs/common';
import { GameService } from './game.service';
import { GameController } from './game.controller';
import { UsersModule } from 'src/users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SavedGame } from 'src/model/saved-game.entity';
import { GameCluster } from './game-cluster';
import { ATGuard } from 'src/users/guard/access-token.guard';
import { JwtModule, JwtService } from '@nestjs/jwt';
@Module({
	exports: [GameService],
	providers: [GameService, GameCluster],
	controllers: [GameController],
	imports: [
		UsersModule,
		TypeOrmModule.forFeature([SavedGame]),
		JwtModule.register({
			secret: 'secret', // not secure at all need to be changed in production  put in a .env file
			signOptions: { expiresIn: '600s' },
		})	
	]
})
export class GameModule {}
