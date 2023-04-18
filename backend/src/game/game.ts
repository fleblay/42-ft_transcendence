import { UUID } from '../type';
import { User } from '../model/user.entity'
import { NotFoundException } from '@nestjs/common'
import { Server, Socket } from 'socket.io'
import { GameCluster } from './game-cluster';
import { SavedGame } from 'src/model/saved-game.entity';

const paddleLength = 100
const paddleWidth = 5
const ballSize = 5
const ballSpeed = 2
const playerSpeed = 3
const canvasHeight = 600
const canvasWidth = 800
const gameRounds = 5
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

export type Players = {
	pos: number,
	momentum: number,
	timeLastMove: number,
	paddleLength: number,
	paddleWidth: number,
	score: number,
	user: User,
	leaving: boolean,
	client: Socket
}

export enum GameStatus { "waiting" = 1, "start", "playing", "end", "error" }

export interface IgameInfo {

	players: Partial<Players>[], // requiered partial to strip client for Players
	posBall: Pos2D
	status: GameStatus
	date: Date
}
interface PlayerInput {
	move: string
	powerUp?: string
}

export class Game {
	private posBall: Pos2D = { x: canvasWidth / 2, y: canvasHeight / 2 }
	private velocityBall: { x: number, y: number } = { x: (Math.random() > 0.5 ? 1 : -1), y: (Math.random() > 0.5 ? 1 : -1) }
	//private startTime: number = Date.now()
	private intervalId: NodeJS.Timer
	public players: Players[] = []
	public viewers: User[] = []
	public status: GameStatus = GameStatus.waiting
	private readonly playerRoom: string
	private readonly viewerRoom: string

	constructor(public gameId: UUID, private server: Server, private privateGame: boolean = false, private gameCluster: GameCluster) {
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
					//console.log(`Input is ${input.move}`)
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
		const partialPlayers = this.players.map((player)=> {
			let {client, ...rest} = player
			return rest
		})
		return {
			players: partialPlayers, // instead of Player
			posBall: this.posBall,
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
		if (this.players.find((player) => player.user.id === user.id))
			throw new NotFoundException('Already in game')

		if (this.players.length < 2) {
			this.players.push({
				pos: canvasHeight / 2 - paddleLength / 2,
				momentum: 0,
				timeLastMove: Date.now(),
				paddleLength: Math.floor(paddleLength + ((Math.random() > 0.5) ? -1 : 1) * (Math.random() * paddleLength / 2)),
				paddleWidth: paddleWidth,
				score: 0,
				user,
				leaving: false,
				client
			})
			client.join(this.playerRoom)
			if (this.players.length === 1) {
				this.status = GameStatus.waiting
				this.play()
			}
			if (this.players.length === 2) {
				setTimeout(() => this.status = GameStatus.playing, 3000)
			}
		}
		else {
			this.viewers.push(user)
			client.join(this.viewerRoom)
		}
		setTimeout(() => this.updateInfo(this.generateGameInfo()), 100)
	}

	private updateBall() {
		let newBall: Pos2D = { ...this.posBall };

		newBall.x += this.velocityBall.x * ballSpeed
		newBall.y += this.velocityBall.y * ballSpeed
		// Colision mur
		if (newBall.y > canvasHeight - ballSize && this.velocityBall.y > 0) {
			this.velocityBall.y *= -1
		}
		else if (newBall.y < ballSize && this.velocityBall.y < 0) {
			this.velocityBall.y *= -1
		}


		let intersect: Pos2D = {x: 0, y: 0}
		let relativeIntersectY: number = 0
		let bounceAngle: number = 0
		let newballSpeed: number = 0
		let ballTravelLeft: number = 0

		const leftPlayer = this.players[0]
		// Colision paddle gauche
		if (newBall.x <= leftPlayer.paddleWidth && this.posBall.x >= leftPlayer.paddleWidth) {
			intersect.x = leftPlayer.paddleWidth;
			intersect.y = this.posBall.y - ((this.posBall.x - leftPlayer.paddleWidth) * (this.posBall.y - newBall.y) / (this.posBall.x - newBall.x));
			if (intersect.y >= leftPlayer.pos && intersect.y <= leftPlayer.pos + leftPlayer.paddleLength) {
				relativeIntersectY = (leftPlayer.pos + (leftPlayer.paddleLength / 2)) - intersect.y;
				bounceAngle = (relativeIntersectY / (leftPlayer.paddleLength / 2)) * (Math.PI / 2 - MaxBounceAngle);
				newballSpeed = Math.sqrt(this.velocityBall.x * this.velocityBall.x + this.velocityBall.y * this.velocityBall.y);
				ballTravelLeft = (newBall.y - intersect.y) / (newBall.y - this.posBall.y);
				this.velocityBall.x = newballSpeed * Math.cos(bounceAngle);
				this.velocityBall.y = newballSpeed * -Math.sin(bounceAngle);
				newBall.x = intersect.x + (ballTravelLeft * newballSpeed * Math.cos(bounceAngle));
				newBall.y = intersect.y + (ballTravelLeft * newballSpeed * Math.sin(bounceAngle));
			}
		}

		const rightPlayer = this.players[1];
		if (newBall.x > canvasWidth - rightPlayer.paddleWidth && this.posBall.x <= canvasWidth - rightPlayer.paddleWidth) {
			intersect.x = canvasWidth - rightPlayer.paddleWidth;
			intersect.y = this.posBall.y - ((this.posBall.x - (canvasWidth - rightPlayer.paddleWidth)) * (this.posBall.y - newBall.y) / (this.posBall.x - newBall.x));
			if (intersect.y >= rightPlayer.pos && intersect.y <= rightPlayer.pos + rightPlayer.paddleLength) {
				relativeIntersectY = (rightPlayer.pos + (rightPlayer.paddleLength / 2)) - intersect.y;
				bounceAngle = (relativeIntersectY / (rightPlayer.paddleLength / 2)) * (Math.PI / 2 - MaxBounceAngle);
				newballSpeed = Math.sqrt(this.velocityBall.x * this.velocityBall.x + this.velocityBall.y * this.velocityBall.y);
				ballTravelLeft = (newBall.y - intersect.y) / (newBall.y - this.posBall.y);
				this.velocityBall.x = newballSpeed * -Math.cos(bounceAngle);
				this.velocityBall.y = newballSpeed * -Math.sin(bounceAngle);
				newBall.x = intersect.x + (ballTravelLeft * newballSpeed * Math.cos(bounceAngle));
				newBall.y = intersect.y + (ballTravelLeft * newballSpeed * Math.sin(bounceAngle));
			}
		}

		this.posBall = newBall;
	}

	gameLoop() {
		//Move de la balle
		if (this.status === GameStatus.playing) {
			this.updateBall()

			//Condition de marquage de point
			if (this.posBall.x <= 0) {
				this.status = GameStatus.start
				setTimeout(() => this.status = GameStatus.playing, 3000)
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
				setTimeout(() => this.status = GameStatus.playing, 3000)
				this.players[0].score += 1
				this.posBall = { x: canvasWidth / 2, y: canvasHeight / 2 }
				this.velocityBall = { x: (Math.random() > 0.5) ? 1 : -1, y: (Math.random() > 0.5) ? 1 : -1 }
				this.players.forEach((player) => {
					player.pos = canvasHeight / 2 - player.paddleLength / 2
					player.momentum = 0
				})
			}

			//Condition fin de jeu
			if (this.players[0].score + this.players[1]?.score === gameRounds) {
				this.status = GameStatus.end
			}
			//Reset des momentum
			this.players.forEach((player) => {
				if (Date.now() - player.timeLastMove > 100)
					player.momentum = 0
			})
		}
		if (this.status == GameStatus.end)
			clearInterval(this.intervalId)
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
