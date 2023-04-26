import { UUID, SocketId } from '../type';
import { User } from '../model/user.entity'
import { NotFoundException } from '@nestjs/common'
import { Server, Socket } from 'socket.io'
import { GameCluster } from './game-cluster';
import { SavedGame } from '../model/saved-game.entity';

const victoryRounds = 5
const paddleLength = 300 // 550 for debug and remove reduce, 300 otherwise
const paddleWidth = 5
const ballSize = 5
const ballSpeed = 2
const playerSpeed = 3
const canvasHeight = 600
const canvasWidth = 800
const MaxBounceAngle = Math.PI / 12;

export type Pos2D = {

	x: number,
	y: number
}

export type projectile = {
	pos: Pos2D,
	velocity: Pos2D,
	active: boolean
}

export type GameSetting = {
	paddleLength: number,
	paddleWidth: number,
	ballSize: number,
	ballSpeed: number,
	playerSpeed: number,
	canvasHeight: number,
	canvasWidth: number,
}

interface gameAsset {
	x: number,
	y: number,
	width: number,
	height: number
}

export type Player = {
	pos: number,
	momentum: number,
	timeLastMove: number,
	paddleLength: number,
	paddleWidth: number,
	score: number,
	user: User,
	leaving: boolean,
	clientId: SocketId
}

export type Viewer = {
	user: User,
	clientId: SocketId
}

export enum GameStatus { "waiting" = 1, "start", "playing", "end", "error" }

export interface IgameInfo {

	players: Partial<Player>[], // requiered partial to strip client for Players
	assets: gameAsset[],
	posBall: Pos2D,
	shootP1: projectile,
	velocityBall: number,
	status: GameStatus,
	date: Date
}

interface PlayerInput {
	move: string
	powerUp?: string
}

enum Collide { "none" = 0, "left", "right", "down", "up" }

export class Game {
	private posBall: Pos2D = { x: canvasWidth / 2, y: canvasHeight / 2 }
	private velocityBall: { x: number, y: number } = { x: (Math.random() > 0.5 ? 1 : -1), y: (Math.random() > 0.5 ? 1 : -1) }
	private shootP1: projectile = { pos: { x: 0, y: canvasHeight / 2 }, velocity: { x: 1, y: 0 }, active: false }
	private intervalId: NodeJS.Timer
	private reduceInterval: NodeJS.Timer
	public players: Player[] = []
	public assets: gameAsset[] = [
		{ x: 100, y: 70, width: 70, height: 70 },
		{ x: canvasWidth - 70 - 70, y: canvasHeight - 100 - 70, width: 70, height: 70 },
		{ x: 250, y: 200, width: 70, height: 70 },
		{ x: canvasWidth - 250 - 70, y: canvasHeight - 200 - 80, width: 70, height: 70 },
	]
	public viewers: Viewer[] = []
	public status: GameStatus = GameStatus.waiting
	public readonly playerRoom: string
	public readonly viewerRoom: string

	constructor(public gameId: UUID, private server: Server, public privateGame: boolean = false, private gameCluster: GameCluster) {
		this.playerRoom = gameId + ":player"
		this.viewerRoom = gameId + ":viewer"
	}

	applyPlayerInput(userId: User["id"], input: Partial<PlayerInput>) {
		//console.log("game input handle")
		const foundPlayer = this.players.find(player => userId === player.user.id)
		if (foundPlayer === null)
			return
		if (input.move !== undefined) {
			console.log(`Input is ${input.move}`)
			switch (input.move) {
				case ("Up"):
					foundPlayer.momentum = (foundPlayer.momentum <= 0) ? foundPlayer.momentum - 1 : 0
					if (foundPlayer.momentum <= -60)
						foundPlayer.momentum = -60
					foundPlayer.pos -= playerSpeed - (foundPlayer.momentum / 10)
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
					foundPlayer.pos += playerSpeed + (foundPlayer.momentum / 10)
					foundPlayer.pos = Math.floor(foundPlayer.pos)
					//Check collision mur
					foundPlayer.pos = (foundPlayer.pos >= canvasHeight - foundPlayer.paddleLength) ? canvasHeight - foundPlayer.paddleLength : foundPlayer.pos
					foundPlayer.momentum = (foundPlayer.pos >= canvasHeight - foundPlayer.paddleLength) ? 0 : foundPlayer.momentum
					foundPlayer.timeLastMove = Date.now()
					break
				case ("Shoot"):
					console.log("Shoot")
					this.shootP1.active = true
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
			posBall: this.posBall,
			shootP1: this.shootP1,
			status: this.status,
			velocityBall: Math.sqrt(Math.pow(this.velocityBall.x, 2) + Math.pow(this.velocityBall.y, 2)),
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
				pos: canvasHeight / 2 - paddleLength / 2,
				momentum: 0,
				timeLastMove: Date.now(),
				paddleLength: paddleLength, //Math.floor(paddleLength + ((Math.random() > 0.5) ? -1 : 1) * (Math.random() * paddleLength / 3)),
				paddleWidth: paddleWidth,
				score: 0,
				user,
				leaving: false,
				clientId: client.id
			})
			client.join(this.playerRoom)
			if (this.players.length === 1) {
				this.status = GameStatus.waiting
				this.play()
			}
			if (this.players.length === 2) {
				this.countdown(5)
				this.reduceInterval = setInterval(() => {
					if (this.players[0].paddleLength > 70)
						this.players[0].paddleLength -= 2 // 2 normal, 0 debug
					if (this.players[1].paddleLength > 70)
						this.players[1].paddleLength -= 2 // 2 normal, 0 debug
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
					ballTravelAfterBounce = (newBall.y - intersect.y) / (newBall.y - ball.pos.y);
				}

				else if (collide == Collide.up || collide == Collide.down) {
					relativeIntersectX = (elem.x + (elem.width / 2)) - intersect.x;
					bounceAngle = (relativeIntersectX / (elem.width / 2)) * (Math.PI / 2 - MaxBounceAngle);
					ball.velocity.x = newballSpeed * -Math.sin(bounceAngle); // seul changement
					ball.velocity.y = newballSpeed * ((collide == Collide.down) ? 1 : -1) * Math.cos(bounceAngle);
					ballTravelAfterBounce = (newBall.x - intersect.x) / (newBall.x - ball.pos.x);
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

	private updateBall(ball: { pos: Pos2D, velocity: Pos2D }): boolean {
		let collide = false
		//Essai de position pour la nouvelle balle
		let newBall: Pos2D = { ...ball.pos };
		newBall.x += ball.velocity.x * ballSpeed
		newBall.y += ball.velocity.y * ballSpeed

		// Collision mur
		if (newBall.y > canvasHeight - ballSize && ball.velocity.y > 0) {
			ball.velocity.y *= -1
		}
		else if (newBall.y < ballSize && ball.velocity.y < 0) {
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
		this.posBall = { x: canvasWidth / 2, y: canvasHeight / 2 }
		this.velocityBall = { x: (Math.random() > 0.5) ? 1 : -1, y: (Math.random() > 0.5) ? 1 : -1 }
		this.players.forEach((player) => {
			player.pos = canvasHeight / 2 - player.paddleLength / 2
			player.momentum = 0
			player.paddleLength = paddleLength
		})
	}

	gameLoop() {
		//Move de la balle
		if (this.status === GameStatus.playing) {

			//Gestion de la collision des assets avec mouvement
			this.updateBall({ pos: this.posBall, velocity: this.velocityBall })
			if (this.shootP1.active)
				this.updateBall(this.shootP1)

			//Condition de marquage de point
			if (this.posBall.x <= 0) {
				this.players[1].score += 1
				this.resetBallAndPlayers()
			}
			else if (this.posBall.x >= canvasWidth) {
				this.players[0].score += 1
				this.resetBallAndPlayers()
			}

			//Condition fin de jeu
			if (this.players[0].score == victoryRounds || this.players[1]?.score == victoryRounds) {
				console.log(`Game ended with ${victoryRounds} round`)
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
