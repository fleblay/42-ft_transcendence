import { forwardRef, Inject, Injectable } from "@nestjs/common";
import { UsersService } from "src/users/users.service";
import { Connection, EntitySubscriberInterface, EventSubscriber, InsertEvent } from "typeorm";
import { SavedGame } from "./saved-game.entity";
import { User } from "./user.entity";

@Injectable()
@EventSubscriber()
export class SavedGameSubscriber implements EntitySubscriberInterface<SavedGame> {


	constructor(
		private readonly connection: Connection,
		private usersService: UsersService) {
		connection.subscribers.push(this)
	}

	listenTo() {
		return SavedGame
	}

	updateUserInfo(user: User, game: SavedGame) {
		//Points
		user.totalWonGames += (game.winner.id == user.id) ? 1 : 0
		if (game.players[0].id == user.id) {
			user.points += game.score[0]
			user.totalPlayedGames++
		}
		else if (game.players[1].id == user.id) {
			user.points += game.score[1]
			user.totalPlayedGames++
		}

		//Achievements
		if (user.points > 100 && !user.achievements.includes("boss"))
			user.achievements.push("boss")
		if (user.points < 0 && !user.achievements.includes("sub-zero"))
			user.achievements.push("sub-zero")
		if (game.winner.id != user.id && game.score.includes(-42) && !user.achievements.includes("quitter"))
			user.achievements.push("quitter")
		if (game.winner.id == user.id && game.score.includes(0) && !user.achievements.includes("perfect"))
			user.achievements.push("perfect")
		if (game.players[0].friendId.includes(game.players[1].id)
			|| game.players[1].friendId.includes(game.players[0].id)
			&& !user.achievements.includes("friend"))
			user.achievements.push("friend")
	}

	async afterInsert(event: InsertEvent<SavedGame>) {
		const game: SavedGame = event.entity
		const allUserDB: User[] = await this.usersService.getAllLight()

		allUserDB.forEach((user) => {
			if (game.players.find((player) => player.id == user.id))
				this.updateUserInfo(user, game)
		})

		allUserDB.sort((a, b) => b.points - a.points)
		await Promise.all(allUserDB.map((user, index) => {
			user.rank = index + 1
			if (user.rank == 1 && !user.achievements.includes("number1"))
				user.achievements.push("number1")
			user.achievements = [...new Set(user.achievements)]
			this.usersService.wsServer.to(`/player/${user.id}`).emit('page.player', { userId: user.id, event: `rank-${user.rank}` })
			return this.usersService.secureUpdate(user.id, user)
		}))

	}
}
