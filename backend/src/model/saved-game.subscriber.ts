import { forwardRef, Inject, Injectable } from "@nestjs/common";
import { UsersService } from "src/users/users.service";
import { Connection, EntitySubscriberInterface, EventSubscriber, InsertEvent } from "typeorm";
import { SavedGame } from "./saved-game.entity";
import { User } from "./user.entity";

@Injectable()
@EventSubscriber()
export class SavedGameSubscriber implements EntitySubscriberInterface<SavedGame> {


	constructor(
		private readonly connection : Connection,
		private usersService: UsersService) {
			connection.subscribers.push(this)
	}

	listenTo() {
		return SavedGame
	}

	async afterInsert(event: InsertEvent<SavedGame>) {
		console.log("ZZZ-Before saved Game insert", event.entity)
		const game: SavedGame = event.entity
		const allUserDB: User[] = await this.usersService.getAll()
		const rankArray: { userId: number, points: number }[] = allUserDB.map((user) => {
			return {
				userId: user.id,
				points: user.wonGames.reduce((acc, curr) => acc + Math.max(...curr.score), 0)
			}
		})
		rankArray.sort((a, b) => b.points - a.points)
		await Promise.all(allUserDB.map((user) => {
			user.rank = rankArray.findIndex((rank) => rank.userId == user.id) + 1
			this.usersService.wsServer.to(`/player/${user.id}`).emit('page.player', { userId: user.id, event: `rank-${user.rank}` })
			return this.usersService.secureUpdate(user.id, user)
		}))
	}
}
