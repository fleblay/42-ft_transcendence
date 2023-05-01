import { UUID, SocketId } from '../type';
import { User } from '../model/user.entity'
import { NotFoundException } from '@nestjs/common'
import { Server, Socket } from 'socket.io'
import { SavedGame } from '../model/saved-game.entity';

const paddleWidth = 5
const canvasHeight = 600
const canvasWidth = 800
const MaxBounceAngle = Math.PI / 12 //No more than Pi/2

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

//Todo : speed pour projectiles et ball
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
	shootSpeed?: number
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
	amo: number,
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
	date: Date
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
	public startAmo: number
	public ballSpeed: number
	public ballSize: number
	public playerSpeed: number
	public shootSize: number
	public shootSpeed: number

	constructor(public gameId: UUID,
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

		this.ballSpeed = options?.ballSpeed || 1
		this.victoryRounds = options?.victoryRounds || 5
		this.paddleLength = options?.paddleLength || 300
		this.paddleLengthMin = options?.paddleLengthMin || 100
		//Change because paddleReduce can be set to 0
		this.paddleReduce = (options?.paddleReduce !== undefined) ? options.paddleReduce : 1

		this.maxBounce = (options?.maxBounce !== undefined) ? options.maxBounce : 3
		this.startAmo = (options?.startAmo !== undefined) ? options.startAmo : 3
		this.ballSize = options?.ballSize || 5
		this.playerSpeed = options?.playerSpeed || 3
		this.shootSize = options?.shootSize || 5
		this.shootSpeed = options?.shootSpeed || 1

		this.initBall()
	}


	initBall() {
		this.ball = {
			pos: { x: canvasWidth / 2, y: canvasHeight / 2 },
			velocity: { x: (Math.random() > 0.5 ? 1 : -1) * this.ballSpeed, y: (Math.random() > 0.5 ? 1 : -1) * this.ballSpeed },
			maxBounce: Infinity,
			size : this.ballSize,
			speed : this.ballSpeed,
			active: true,
		}
	}

	initShoot(playerIndex: number): projectile {
		return ({
			pos: { x: (playerIndex == 0) ? paddleWidth + 1 : canvasWidth - (paddleWidth + 1), y: canvasHeight / 2 },
			velocity: { x: (playerIndex == 0) ? 1 : -1, y: 0 },
			maxBounce: this.maxBounce,
			size : this.shootSize,
			speed : this.shootSpeed,
			active: false,
		})
	}

	applyPlayerInput(userId: User["id"], input: Partial<PlayerInput>) {
		const foundPlayer = this.players.find(player => userId === player.user.id)
		if (foundPlayer === null)
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
					if (this.options?.shoot && foundPlayer.amo > 0 && !foundPlayer.shoot.active) {
						foundPlayer.shoot.active = true
						foundPlayer.amo--
					}
					break
				default:
			}
		}
	}

	get freeSlot() {
		return this.players.length < 2
	}

	updateInfo(payload: IgameInfo) {
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
			date: new Date()
		}
	}

	generateSavedGameInfo(): SavedGame {

		const savedGame = new SavedGame();
		savedGame.id = this.gameId;
		savedGame.players = this.players.map((player) => player.user);
		savedGame.score = this.players.map((player) => player.score);
		savedGame.winner = (this.players[0].score > this.players[1].score) ? this.players[0].user : this.players[1].user;
		return savedGame;
	}


	addUser(user: User, client: Socket) {
		// TODO: If player reconnect, check if he is in the game and change his socket
		// Disconnect old socket
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
				amo: this.options?.shoot && this.startAmo
			})
			client.join(this.playerRoom)
			if (this.players.length === 1) {
				this.status = GameStatus.waiting
				this.play()
			}
			if (this.players.length === 2) {
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
		}
		setTimeout(() => this.updateInfo(this.generateGameInfo()), 100)
	}

	private handleCollision(elem: gameAsset, ball: { pos: Pos2D, velocity: Pos2D }, newBall: Pos2D, bouncing: boolean = true, momentum: number = 0): boolean {
		let intersect: Pos2D = { x: 0, y: 0 }
		let relativeIntersectY: number = 0
		let relativeIntersectX: number = 0
		let bounceAngle: number = 0
		let newballSpeed: number = 0
		let ballTravelAfterBounce: number = 0

		let collide: Collide = Collide.none

		//Collision droite
		if (!collide && newBall.x <= elem.x + elem.width && ball.pos.x >= elem.x + elem.width) {
			intersect.x = elem.x + elem.width;
			intersect.y = ball.pos.y + ((intersect.x - ball.pos.x) * (ball.pos.y - newBall.y) / (ball.pos.x - newBall.x));
			if (intersect.y >= elem.y && intersect.y <= elem.y + elem.height)
				collide = Collide.right
		}
		//Collision gauche
		else if (!collide && newBall.x >= elem.x && ball.pos.x <= elem.x) {
			intersect.x = elem.x
			intersect.y = ball.pos.y + ((intersect.x - ball.pos.x) * (ball.pos.y - newBall.y) / (ball.pos.x - newBall.x));
			if (intersect.y >= elem.y && intersect.y <= elem.y + elem.height)
				collide = Collide.left
		}

		//Collision bas
		else if (!collide && newBall.y <= elem.y + elem.height && ball.pos.y >= elem.y + elem.height) {
			intersect.y = elem.y + elem.height;
			intersect.x = ball.pos.x + ((intersect.y - ball.pos.y) * (ball.pos.x - newBall.x) / (ball.pos.y - newBall.y));
			if (intersect.x >= elem.x && intersect.x <= elem.x + elem.width)
				collide = Collide.down
		}

		//Collision up
		else if (!collide && newBall.y >= elem.y && ball.pos.y <= elem.y) {
			intersect.y = elem.y;
			intersect.x = ball.pos.x + ((intersect.y - ball.pos.y) * (ball.pos.x - newBall.x) / (ball.pos.y - newBall.y));
			if (intersect.x >= elem.x && intersect.x <= elem.x + elem.width)
				collide = Collide.up
		}

		newballSpeed = Math.sqrt(ball.velocity.x * ball.velocity.x + ball.velocity.y * ball.velocity.y); // A Ajuster avec momentum
		if ((collide == Collide.left || collide == Collide.right) && momentum != 0) {
			newballSpeed *= (1 + (momentum / 120) * ball.velocity.y)
		}

		//Calcul du changement de trajectoire de la balle, et update de sa nouvelle position
		if (collide) {
			if (bouncing) {
				if (collide == Collide.left || collide == Collide.right) {
					relativeIntersectY = (elem.y + (elem.height / 2)) - intersect.y;
					bounceAngle = (relativeIntersectY / (elem.height / 2)) * (Math.PI / 2 - MaxBounceAngle);
					ball.velocity.x = newballSpeed * ((collide == Collide.right) ? 1 : -1) * Math.cos(bounceAngle); // seul changement
					ball.velocity.y = newballSpeed * -Math.sin(bounceAngle);
					ballTravelAfterBounce = (newBall.y != ball.pos.y) ? (newBall.y - intersect.y) / (newBall.y - ball.pos.y) : 0
				}

				else if (collide == Collide.up || collide == Collide.down) {
					relativeIntersectX = (elem.x + (elem.width / 2)) - intersect.x;
					bounceAngle = (relativeIntersectX / (elem.width / 2)) * (Math.PI / 2 - MaxBounceAngle);
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

	private updateBall(ball: { pos: Pos2D, velocity: Pos2D , speed: number, size: number}): boolean {
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
			//Reset des momentum
			this.players.forEach((player) => {
				if (Date.now() - player.timeLastMove > 150)
					player.momentum = 0
			})
		}
		if (this.status == GameStatus.end) {
			clearInterval(this.intervalId)
			clearInterval(this.reduceInterval)
		}

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
		//Envoi des infos
		this.updateInfo(this.generateGameInfo());
	}

	play() {
		this.intervalId = setInterval(() => { this.gameLoop() }, 5)
	}

	get id(): UUID {
		return this.gameId;
	}
}
