import { UUID, SocketId, CurrentGame } from '../type';
import { User } from '../model/user.entity'
import { NotFoundException } from '@nestjs/common'
import { Server, Socket } from 'socket.io'
import { SavedGame } from '../model/saved-game.entity';

const paddleWidth = 10
const canvasHeight = 480
const canvasWidth = 848
const BounceAngleLimiter = Math.PI / 12 //No more than Pi/2

export type Pos2D = {

	x: number,
	y: number
}

export type projectile = {
	pos: Pos2D,
	velocity: Pos2D,
	active: boolean,
	maxBounce: number,
	size: number,
	speed: number
}

//Todo : objet d'init
export type GameOptions = {
	ballSpeed?: number,
	shoot?: boolean,
	obstacles?: boolean,
	paddleLength?: number,
	paddleLengthMin?: number,
	paddleReduce?: number,
	victoryRounds?: number,
	maxBounce?: number,
	startAmo?: number,
	ballSize?: number
	playerSpeed?: number,
	shootSize?: number
	shootSpeed?: number,
	liftEffect?: number
}

interface gameAsset {
	x: number,
	y: number,
	width: number,
	height: number,
}

export type Player = {
	pos: number,
	momentum: number,
	timeLastMove: number,
	paddleLength: number,
	paddleWidth: number,
	shoot: projectile,
	ammo: number,
	score: number,
	user: User,
	leaving: boolean,
	clientId: SocketId,
}

export type Viewer = {
	user: User,
	clientId: SocketId
}

export enum GameStatus { "waiting" = 1, "start", "playing", "end", "error" }


export interface IgameInfo {

	players: Partial<Player>[], // requiered partial to strip client for Players
	assets: gameAsset[],
	ball: projectile,
	status: GameStatus,
	date: Date,
	viewers: number,
	private: boolean,
}

interface PlayerInput {
	move: string
	powerUp?: string
}

enum Collide { "none" = 0, "left", "right", "down", "up" }


export class Game {
	private ball: projectile
	private intervalId: NodeJS.Timer
	private reduceInterval: NodeJS.Timer
	private infoInterval: NodeJS.Timer
	public players: Player[] = []
	public assets: gameAsset[] = []
	public viewers: Viewer[] = []
	public status: GameStatus = GameStatus.waiting
	public readonly playerRoom: string
	public readonly viewerRoom: string
	public victoryRounds: number
	public paddleLength: number
	public paddleLengthMin: number
	public paddleReduce: number
	public maxBounce: number
	public startAmmo: number
	public ballSpeed: number
	public ballSize: number
	public playerSpeed: number
	public shootSize: number
	public shootSpeed: number
	public liftEffect: number

	constructor(
		public gameId: UUID,
		private server: Server,
		public privateGame: boolean,
		public options: GameOptions) {

		this.playerRoom = gameId + ":player"
		this.viewerRoom = gameId + ":viewer"
		options?.obstacles && (this.assets =
			[
				{ x: 100, y: 70, width: 70, height: 70 },
				{ x: canvasWidth - 70 - 70, y: canvasHeight - 100 - 70, width: 70, height: 70 },
				{ x: 250, y: 200, width: 70, height: 70 },
				{ x: canvasWidth - 250 - 70, y: canvasHeight - 200 - 80, width: 70, height: 70 },
			])

		this.ballSpeed = options?.ballSpeed || 1.25
		this.victoryRounds = options?.victoryRounds || 5
		this.paddleLength = options?.paddleLength || 200
		this.paddleLengthMin = options?.paddleLengthMin || 100
		this.paddleReduce = (options?.paddleReduce !== undefined) ? options.paddleReduce : 0
		this.maxBounce = (options?.maxBounce !== undefined) ? options.maxBounce : 5
		this.startAmmo = (options?.startAmo !== undefined) ? options.startAmo : 0
		this.liftEffect = (options?.liftEffect !== undefined) ? options.liftEffect : 1
		this.ballSize = options?.ballSize || 5
		this.playerSpeed = options?.playerSpeed || 3
		this.shootSize = options?.shootSize || 2
		this.shootSpeed = options?.shootSpeed || 1.5

		this.initBall()
	}


	initBall() {
		this.ball = {
			pos: { x: canvasWidth / 2, y: canvasHeight / 2 },
			velocity: { x: (Math.random() > 0.5 ? 1 : -1) * this.ballSpeed, y: (Math.random() > 0.5 ? 1 : -1) * this.ballSpeed },
			maxBounce: Infinity,
			size: this.ballSize,
			speed: this.ballSpeed,
			active: true,
		}
	}

	initShoot(playerIndex: number): projectile {
		return ({
			pos: { x: (playerIndex == 0) ? paddleWidth + 1 : canvasWidth - (paddleWidth + 1), y: canvasHeight / 2 },
			velocity: { x: (playerIndex == 0) ? 1 : -1, y: 0 },
			maxBounce: this.maxBounce,
			size: this.shootSize,
			speed: this.shootSpeed,
			active: false,
		})
	}

	applyPlayerInput(userId: User["id"], input: Partial<PlayerInput>) {
		const foundPlayer = this.players.find(player => userId === player.user.id)
		if (!foundPlayer)
			return
		if (input.move !== undefined) {
			//console.log(`Input is ${input.move}`)
			if (foundPlayer.shoot.active == false)
				foundPlayer.shoot.pos.y = foundPlayer.pos + foundPlayer.paddleLength / 2
			switch (input.move) {
				case ("Up"):
					foundPlayer.momentum = (foundPlayer.momentum <= 0) ? foundPlayer.momentum - 1 : 0
					if (foundPlayer.momentum <= -60)
						foundPlayer.momentum = -60
					foundPlayer.pos -= this.playerSpeed - (foundPlayer.momentum / 10)
					foundPlayer.pos = Math.floor(foundPlayer.pos)
					//Check collision mur
					foundPlayer.pos = (foundPlayer.pos <= 0) ? 0 : foundPlayer.pos
					foundPlayer.momentum = (foundPlayer.pos <= 0) ? 0 : foundPlayer.momentum
					foundPlayer.timeLastMove = Date.now()
					break
				case ("Down"):
					foundPlayer.momentum = (foundPlayer.momentum >= 0) ? foundPlayer.momentum + 1 : 0
					if (foundPlayer.momentum >= 60)
						foundPlayer.momentum = 60
					foundPlayer.pos += this.playerSpeed + (foundPlayer.momentum / 10)
					foundPlayer.pos = Math.floor(foundPlayer.pos)
					//Check collision mur
					foundPlayer.pos = (foundPlayer.pos >= canvasHeight - foundPlayer.paddleLength) ? canvasHeight - foundPlayer.paddleLength : foundPlayer.pos
					foundPlayer.momentum = (foundPlayer.pos >= canvasHeight - foundPlayer.paddleLength) ? 0 : foundPlayer.momentum
					foundPlayer.timeLastMove = Date.now()
					break
				case ("Shoot"):
					if (this.options?.shoot && foundPlayer.ammo > 0 && !foundPlayer.shoot.active) {
						foundPlayer.shoot.active = true
						foundPlayer.ammo--
					}
					break
				default:
			}
		}
	}

	get freeSlot() {
		return this.players.length < 2
	}

	updateInfo(payload: IgameInfo, volatile = true) {
		if (volatile)
			this.server.to(this.playerRoom).to(this.viewerRoom).volatile.emit('game.update', payload)
		else
			this.server.to(this.playerRoom).to(this.viewerRoom).emit('game.update', payload)
	}

	generateGameInfo(): IgameInfo {
		const partialPlayers = this.players.map((player) => {
			let { clientId: client, ...rest } = player
			return rest
		})
		return {
			players: partialPlayers, // instead of Player
			assets: this.assets,
			ball: this.ball,
			status: this.status,
			date: new Date(),
			viewers: this.viewers.length,
			private: this.privateGame,
		}
	}

	generateSavedGameInfo(): SavedGame {

		const savedGame = new SavedGame();
		savedGame.id = this.gameId;
		savedGame.players = this.players.map((player) => player.user);
		savedGame.score = this.players.map((player) => player.score);
		savedGame.winner = (this.players[0].score > this.players[1].score) ? this.players[0].user : this.players[1].user;
		console.log("generateSavedGamedInfo : ", savedGame)
		return savedGame;
	}


	addUser(user: User, client: Socket): string {
		// TODO: If player reconnect, check if he is in the game and change his socket
		// Disconnect old socket
		let joinType = ""
		if (this.players.find((player) => player.user.id === user.id))
			throw new NotFoundException('Already in game')

		if (this.players.length < 2) {
			this.players.push({
				pos: canvasHeight / 2 - this.paddleLength / 2,
				momentum: 0,
				timeLastMove: Date.now(),
				paddleLength: this.paddleLength,
				paddleWidth: paddleWidth,
				score: 0,
				user,
				leaving: false,
				clientId: client.id,
				shoot: this.initShoot(this.players.length),
				ammo: this.options?.shoot ? this.startAmmo : 0
			})
			client.join(this.playerRoom)
			joinType = "ingame"
			if (this.players.length === 1) {
				this.status = GameStatus.waiting
				this.play()
			}
			if (this.players.length === 2) {
				this.status = GameStatus.start
				this.countdown(5)
				this.reduceInterval = setInterval(() => {
					this.players.forEach((player) => {
						if (player.paddleLength > this.paddleLengthMin)
							player.paddleLength -= this.paddleReduce
					})
				}, 500)
			}
		}
		else {
			this.viewers.push({ user, clientId: client.id })
			client.join(this.viewerRoom)
			joinType = "watching"
		}
		if (this.players.length === 2) {
			this.emitToCurrentList()
		}
		setTimeout(() => this.updateInfo(this.generateGameInfo()), 100)
		return joinType
	}

	private emitToCurrentList() {
		this.server.to('game.current').emit('game.current.update', {
			id: this.gameId,
			players: this.players.map((player) => ({
				id: player.user.id,
				username: player.user.username,
				score: player.score,
			})),
			viewers: this.viewers.length,
		} as CurrentGame)
	}

	//Todo : gere la taille de la balle !!!!
	private handleCollision(elem: gameAsset, ball: { pos: Pos2D, velocity: Pos2D, size: number }, newBall: Pos2D, bouncing: boolean = true, momentum: number = 0): boolean {
		let intersect: Pos2D = { x: 0, y: 0 }
		let relativeIntersectY: number = 0
		let relativeIntersectX: number = 0
		let bounceAngle: number = 0
		let newballSpeed: number = 0
		let ballTravelAfterBounce: number = 0

		let collide: Collide = Collide.none

		//Collision droite
		//if (!collide && newBall.x <= elem.x + elem.width && ball.pos.x >= elem.x + elem.width) {
		if (!collide && newBall.x <= elem.x + elem.width + ball.size && ball.pos.x >= elem.x + elem.width + ball.size) {
			//intersect.x = elem.x + elem.width
			intersect.x = elem.x + elem.width + ball.size;
			intersect.y = ball.pos.y + ((intersect.x - ball.pos.x) * (ball.pos.y - newBall.y) / (ball.pos.x - newBall.x));
			//if (intersect.y >= elem.y && intersect.y <= elem.y + elem.height)
			if (intersect.y + ball.size >= elem.y && intersect.y - ball.size <= elem.y + elem.height)
				collide = Collide.right
		}
		//Collision gauche
		//else if (!collide && newBall.x >= elem.x && ball.pos.x <= elem.x) {
		else if (!collide && newBall.x + ball.size >= elem.x && ball.pos.x + ball.size <= elem.x) {
			//intersect.x = elem.x
			intersect.x = elem.x - ball.size
			intersect.y = ball.pos.y + ((intersect.x - ball.pos.x) * (ball.pos.y - newBall.y) / (ball.pos.x - newBall.x));
			//if (intersect.y >= elem.y && intersect.y <= elem.y + elem.height)
			if (intersect.y + ball.size >= elem.y && intersect.y - ball.size <= elem.y + elem.height)
				collide = Collide.left
		}

		//Collision bas
		//else if (!collide && newBall.y <= elem.y + elem.height && ball.pos.y >= elem.y + elem.height) {
		else if (!collide && newBall.y <= elem.y + elem.height + ball.size && ball.pos.y >= elem.y + elem.height + ball.size) {
			//intersect.y = elem.y + elem.height;
			intersect.y = elem.y + elem.height + ball.size;
			intersect.x = ball.pos.x + ((intersect.y - ball.pos.y) * (ball.pos.x - newBall.x) / (ball.pos.y - newBall.y));
			//if (intersect.x >= elem.x && intersect.x <= elem.x + elem.width)
			if (intersect.x + ball.size >= elem.x && intersect.x - ball.size <= elem.x + elem.width)
				collide = Collide.down
		}

		//Collision up
		//else if (!collide && newBall.y >= elem.y && ball.pos.y <= elem.y) {
		else if (!collide && newBall.y + ball.size >= elem.y && ball.pos.y + ball.size <= elem.y) {
			//intersect.y = elem.y;
			intersect.y = elem.y - ball.size;
			intersect.x = ball.pos.x + ((intersect.y - ball.pos.y) * (ball.pos.x - newBall.x) / (ball.pos.y - newBall.y));
			//if (intersect.x >= elem.x && intersect.x <= elem.x + elem.width)
			if (intersect.x + ball.size >= elem.x && intersect.x - ball.size <= elem.x + elem.width)
				collide = Collide.up
		}

		newballSpeed = Math.sqrt(ball.velocity.x * ball.velocity.x + ball.velocity.y * ball.velocity.y); // A Ajuster avec momentum
		if ((collide == Collide.left || collide == Collide.right) && momentum != 0) {
			newballSpeed *= (1 + (momentum * this.liftEffect / 120) * ball.velocity.y)
		}

		//Calcul du changement de trajectoire de la balle, et update de sa nouvelle position
		if (collide) {
			if (bouncing) {
				if (collide == Collide.left || collide == Collide.right) {
					relativeIntersectY = (elem.y + (elem.height / 2)) - intersect.y;
					bounceAngle = (relativeIntersectY / (elem.height / 2)) * (Math.PI / 2 - BounceAngleLimiter);
					ball.velocity.x = newballSpeed * ((collide == Collide.right) ? 1 : -1) * Math.cos(bounceAngle); // seul changement
					ball.velocity.y = newballSpeed * -Math.sin(bounceAngle);
					ballTravelAfterBounce = (newBall.y != ball.pos.y) ? (newBall.y - intersect.y) / (newBall.y - ball.pos.y) : 0
				}

				else if (collide == Collide.up || collide == Collide.down) {
					relativeIntersectX = (elem.x + (elem.width / 2)) - intersect.x;
					bounceAngle = (relativeIntersectX / (elem.width / 2)) * (Math.PI / 2 - BounceAngleLimiter);
					ball.velocity.x = newballSpeed * -Math.sin(bounceAngle); // seul changement
					ball.velocity.y = newballSpeed * ((collide == Collide.down) ? 1 : -1) * Math.cos(bounceAngle);
					ballTravelAfterBounce = (newBall.x != ball.pos.x) ? (newBall.x - intersect.x) / (newBall.x - ball.pos.x) : 0
				}
				newBall.x = intersect.x + (ballTravelAfterBounce * newballSpeed * Math.cos(bounceAngle));
				newBall.y = intersect.y + (ballTravelAfterBounce * newballSpeed * Math.sin(bounceAngle));
			}
			else {
				//mettre la pos de la balle a zero et set sa speed a 0
			}
			return true
		}
		else
			return false
	}

	private updateBall(ball: { pos: Pos2D, velocity: Pos2D, speed: number, size: number }): boolean {
		let collide = false
		//Essai de position pour la nouvelle balle
		let newBall: Pos2D = { ...ball.pos };
		newBall.x += ball.velocity.x * ball.speed
		newBall.y += ball.velocity.y * ball.speed

		// Collision mur
		if (newBall.y > canvasHeight - ball.size && ball.velocity.y > 0) {
			ball.velocity.y *= -1
		}
		else if (newBall.y < ball.size && ball.velocity.y < 0) {
			ball.velocity.y *= -1
		}

		//Collision players
		this.players.forEach((player, index) => {
			collide = collide || this.handleCollision({
				x: (index == 0) ? 0 : canvasWidth - player.paddleWidth,
				y: player.pos,
				width: player.paddleWidth,
				height: player.paddleLength
			}, ball, newBall, true, player.momentum)
		})

		//Collision assets
		this.assets.forEach((asset) => {
			collide = collide || this.handleCollision(asset, ball, newBall)
		})

		//Pointer Magic => cannot use ball.pos = newBall
		ball.pos.x = newBall.x;
		ball.pos.y = newBall.y;
		return collide
	}

	private countdown(timeSecond: number) {
		let countdown = timeSecond
		this.server.to(this.playerRoom).to(this.viewerRoom).emit('game.countdown', countdown)
		let intervalId = setInterval(() => {
			countdown -= 1
			this.server.to(this.playerRoom).to(this.viewerRoom).emit('game.countdown', countdown)
			if (countdown <= 0) {
				clearInterval(intervalId)
				if (this.status !== GameStatus.end)
					this.status = GameStatus.playing
			}
		}, 700)
	}

	resetBallAndPlayers() {
		this.emitToCurrentList()
		this.status = GameStatus.start
		this.countdown(3)
		this.initBall()
		this.players.forEach((player) => {
			player.pos = canvasHeight / 2 - player.paddleLength / 2
			player.paddleLength = this.paddleLength
		})
	}

	gameLoop() {
		//Move de la balle
		if (this.status === GameStatus.playing) {

			//Gestion de la collision des assets avec mouvement
			this.updateBall(this.ball)

			//Condition de marquage de point
			if (this.ball.pos.x <= 0) {
				this.players[1].score += 1
				this.resetBallAndPlayers()
			}
			else if (this.ball.pos.x >= canvasWidth) {
				this.players[0].score += 1
				this.resetBallAndPlayers()
			}

			//Condition fin de jeu
			if (!this.players.every((player) => player.score < this.victoryRounds)) {
				console.log(`Game ended with ${this.victoryRounds} round`)
				this.status = GameStatus.end
			}
		}
		if (this.status == GameStatus.end) {
			clearInterval(this.intervalId)
			clearInterval(this.reduceInterval)
			this.updateInfo(this.generateGameInfo(), false)
			clearInterval(this.infoInterval)
			this.server.to('game.current').emit('game.current.delete', this.gameId)
		}

		//Reset des momentum
		this.players.forEach((player) => {
			if (Date.now() - player.timeLastMove > 150)
				player.momentum = 0
		})

		//Projectiles
		this.players.forEach((player, index) => {
			if (player.shoot.active)
				if (this.updateBall(player.shoot)) {
					player.shoot.maxBounce--
				}
			if (index == 1 && player.shoot.pos.x <= 0) {
				this.players[0].paddleLength *= (2 / 3)
			}
			else if (index == 0 && this.players.length > 1 && player.shoot.pos.x >= canvasWidth) {
				this.players[1].paddleLength *= (2 / 3)
			}
			//Reset du shoot
			if (player.shoot.pos.x <= 0 || player.shoot.pos.x >= canvasWidth || player.shoot.maxBounce == 0)
				player.shoot = this.initShoot(index)
		})
	}

	play() {
		this.intervalId = setInterval(() => { this.gameLoop() }, 5)
		//Envoi des infosk
		this.infoInterval = setInterval(() => { this.updateInfo(this.generateGameInfo()) }, 1000 / 60)
	}

	get id(): UUID {
		return this.gameId;
	}
}
