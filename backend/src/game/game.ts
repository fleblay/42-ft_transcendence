import { UUID, SocketId } from '../type';
import { User } from '../model/user.entity'
import { NotFoundException } from '@nestjs/common'
import { Server, Socket } from 'socket.io'
import { GameCluster } from './game-cluster';
import { SavedGame } from '../model/saved-game.entity';

const victoryRounds = 5
const paddleLength = 550 // 550 for debug and remove reduce, 300 otherwise
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
	velocityBall: number,
	status: GameStatus,
	date: Date
}
interface PlayerInput {
	move: string
	powerUp?: string
}

export class Game {
	private posBall: Pos2D = { x: canvasWidth / 2, y: canvasHeight / 2 }
	private velocityBall: { x: number, y: number } = { x: (Math.random() > 0.5 ? 1 : -1), y: (Math.random() > 0.5 ? 1 : -1) }
	private intervalId: NodeJS.Timer
	private reduceInterval : NodeJS.Timer
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
			//console.log(`Input is ${input.move}`)
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
						this.players[0].paddleLength -= 0 // 2 normal, 0 debug
					if (this.players[1].paddleLength > 70)
						this.players[1].paddleLength -= 0 // 2 normal, 0 debug
				}, 500)
			}
		}
		else {
			this.viewers.push({ user, clientId: client.id })
			client.join(this.viewerRoom)
		}
		setTimeout(() => this.updateInfo(this.generateGameInfo()), 100)
	}

	private handleCollision(elem: gameAsset, newBall: Pos2D, momentum: number = 0) {
		let intersect: Pos2D = { x: 0, y: 0 }
		let relativeIntersectY: number = 0
		let relativeIntersectX: number = 0
		let bounceAngle: number = 0
		let newballSpeed: number = 0
		let ballTravelLeft: number = 0
		let ballTravelUp: number = 0

		let collide = false
		let leftCollide: boolean = false
		let rightCollide: boolean = false
		let upCollide: boolean = false
		let downCollide: boolean = false

		//Collision droite
		if (!collide && newBall.x <= elem.x + elem.width && this.posBall.x >= elem.x + elem.width) {
			intersect.x = elem.x + elem.width;
			intersect.y = this.posBall.y + ((intersect.x - this.posBall.x) * (this.posBall.y - newBall.y) / (this.posBall.x - newBall.x));
			if (intersect.y >= elem.y && intersect.y <= elem.y + elem.height) {
				collide = true
				rightCollide = true
			}
		}
		//Collision gauche
		if (!collide && newBall.x >= elem.x && this.posBall.x <= elem.x) {
			intersect.x = elem.x
			intersect.y = this.posBall.y + ((intersect.x - this.posBall.x) * (this.posBall.y - newBall.y) / (this.posBall.x - newBall.x));
			if (intersect.y >= elem.y && intersect.y <= elem.y + elem.height) {
				collide = true
				leftCollide = true
			}
		}

		//Collision bas
		if (!collide && newBall.y <= elem.y + elem.height && this.posBall.y >= elem.y + elem.height) {
			intersect.y = elem.y + elem.height;
			intersect.x = this.posBall.x + ((intersect.y - this.posBall.y) * (this.posBall.x - newBall.x) / (this.posBall.y - newBall.y));
			if (intersect.x >= elem.x && intersect.x <= elem.x + elem.width) {
				collide = true
				downCollide = true
			}
		}

		//Collision up
		if (!collide && newBall.y >= elem.y && this.posBall.y <= elem.y) {
			intersect.y = elem.y;
			intersect.x = this.posBall.x + ((intersect.y - this.posBall.y) * (this.posBall.x - newBall.x) / (this.posBall.y - newBall.y));
			if (intersect.x >= elem.x && intersect.x <= elem.x + elem.width) {
				collide = true
				upCollide = true
			}
		}

		newballSpeed = Math.sqrt(this.velocityBall.x * this.velocityBall.x + this.velocityBall.y * this.velocityBall.y); // A Ajuster avec momentum
		if ((leftCollide || rightCollide) && momentum != 0) {
			newballSpeed *= (1 + (momentum / 120) * this.velocityBall.y)
		}

		if (collide && (leftCollide || rightCollide)) {
			relativeIntersectY = (elem.y + (elem.height / 2)) - intersect.y;
			bounceAngle = (relativeIntersectY / (elem.height / 2)) * (Math.PI / 2 - MaxBounceAngle);
			ballTravelLeft = (newBall.y - intersect.y) / (newBall.y - this.posBall.y);
			this.velocityBall.x = newballSpeed * (rightCollide ? 1 : -1) * Math.cos(bounceAngle); // seul changement
			this.velocityBall.y = newballSpeed * -Math.sin(bounceAngle);

			newBall.x = intersect.x + (ballTravelLeft * newballSpeed * Math.cos(bounceAngle));
			newBall.y = intersect.y + (ballTravelLeft * newballSpeed * Math.sin(bounceAngle));
		}

		else if (collide && (upCollide || downCollide)) {
			relativeIntersectX = (elem.x + (elem.width / 2)) - intersect.x;
			bounceAngle = (relativeIntersectX / (elem.width / 2)) * (Math.PI / 2 - MaxBounceAngle);
			ballTravelUp = (newBall.x - intersect.x) / (newBall.x - this.posBall.x);
			this.velocityBall.x = newballSpeed * -Math.sin(bounceAngle); // seul changement
			this.velocityBall.y = newballSpeed * (downCollide ? 1 : -1) * Math.cos(bounceAngle);
			newBall.x = intersect.x + (ballTravelUp * newballSpeed * Math.cos(bounceAngle));
			newBall.y = intersect.y + (ballTravelUp * newballSpeed * Math.sin(bounceAngle));
		}
	}

	private updateBall() {
		let newBall: Pos2D = { ...this.posBall };

		newBall.x += this.velocityBall.x * ballSpeed
		newBall.y += this.velocityBall.y * ballSpeed
		// Collision mur
		if (newBall.y > canvasHeight - ballSize && this.velocityBall.y > 0) {
			this.velocityBall.y *= -1
		}
		else if (newBall.y < ballSize && this.velocityBall.y < 0) {
			this.velocityBall.y *= -1
		}

		//player 0
		this.handleCollision({
			x: 0,
			y: this.players[0].pos,
			width: this.players[0].paddleWidth,
			height: this.players[0].paddleLength
		}, newBall, this.players[0].momentum)

		//player 1
		this.handleCollision({
			x: canvasWidth - this.players[1].paddleWidth,
			y: this.players[1].pos,
			width: this.players[1].paddleWidth,
			height: this.players[1].paddleLength
		}, newBall, this.players[1].momentum)

		//assets
		this.assets.forEach((asset) => this.handleCollision(asset, newBall))

		this.posBall = newBall;
	}

	private countdown(timeSecond: number) {
		let countdown = timeSecond
		this.server.to(this.playerRoom).to(this.viewerRoom).emit('game.countdown', countdown)
		let intervalId = setInterval(() => {
			countdown -= 1
			this.server.to(this.playerRoom).to(this.viewerRoom).emit('game.countdown', countdown)
			if (countdown <= 0) {
				clearInterval(intervalId)
				if (this.status !== GameStatus.end) {
					this.status = GameStatus.playing
					this.players.forEach((player)=> {
						player.paddleLength = paddleLength
					})
				}
			}
		}, 700)
	}

	gameLoop() {
		//Move de la balle
		if (this.status === GameStatus.playing) {
			this.updateBall()

			//Condition de marquage de point
			if (this.posBall.x <= 0) {
				this.status = GameStatus.start
				this.countdown(3)
				this.players[1].score += 1
				this.posBall = { x: canvasWidth / 2, y: canvasHeight / 2 }
				this.velocityBall = { x: (Math.random() > 0.5) ? 1 : -1, y: (Math.random() > 0.5) ? 1 : -1 }
				this.players.forEach((player) => {
					player.pos = canvasHeight / 2 - player.paddleLength / 2
					player.momentum = 0
				})
			}
			else if (this.posBall.x >= canvasWidth) {
				this.status = GameStatus.start
				this.countdown(3)
				this.players[0].score += 1
				this.posBall = { x: canvasWidth / 2, y: canvasHeight / 2 }
				this.velocityBall = { x: (Math.random() > 0.5) ? 1 : -1, y: (Math.random() > 0.5) ? 1 : -1 }
				this.players.forEach((player) => {
					player.pos = canvasHeight / 2 - player.paddleLength / 2
					player.momentum = 0
				})
			}

			//Condition fin de jeu
			if (this.players[0].score == victoryRounds || this.players[1]?.score == victoryRounds) {
				console.log(`Game ended with ${victoryRounds} round`)
				this.status = GameStatus.end
			}
			//Reset des momentum
			this.players.forEach((player) => {
				if (Date.now() - player.timeLastMove > 100)
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
