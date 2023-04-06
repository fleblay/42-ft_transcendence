import { UUID } from '../type';
import { User } from '../model/user.entity'
import { NotFoundException } from '@nestjs/common'
import { Server, Socket } from 'socket.io'

const paddleLength = 60
const paddleWidth = 5
const ballSize = 5
const ballSpeed = 5
const playerSpeed = 3
const canvasHeight = 600
const canvasWidth = 800
const gameRounds = 50


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
	score: number,
	user: User,
}

enum GameStatus { "waiting" = 1, "start", "playing", "end", "error" }

interface IgameInfo {

	//posP1: number
	//posP2: number
	players: Players[],
	posBall: Pos2D
	//score: number[]
	status: GameStatus
	date: Date
}

interface PlayerInput {
	move: string
	powerUp?: string
}

export class Game {
	private posBall: Pos2D = { x: canvasWidth / 2, y: canvasHeight / 2 }
	private velocityBall: { x: number, y: number } = { x: (Math.random() > 0, 5 ? 1 : -1), y: (Math.random() > 0, 5 ? 1 : -1) }
	//private startTime: number = Date.now()
	private intervalId: NodeJS.Timer
	private players: Players[] = []
	private viewers: User[] = []
	//private score: number[] = [0, 0]
	private status: GameStatus = GameStatus.waiting
	private readonly playerRoom: string
	private readonly viewerRoom: string

	constructor(private gameId: UUID, private server: Server, private privateGame: boolean = false) {
		this.playerRoom = gameId + ":player"
		this.viewerRoom = gameId + ":viewer"
	}

	applyPlayerInput(userId: User["id"], input: Partial<PlayerInput>) {
		const foundPlayer = this.players.find(player => userId === player.user.id)
		if (foundPlayer === null)
			return
		if (input.move !== undefined) {
			console.log(`Input is ${input.move}`)
			switch (input.move) {
				case ("Up"):
					foundPlayer.momentum = (foundPlayer.momentum <= 0) ? foundPlayer.momentum - 1 : 0
					if (foundPlayer.momentum <= -40)
						foundPlayer.momentum = -40
					foundPlayer.pos -= playerSpeed - (foundPlayer.momentum / 10)
					foundPlayer.pos = Math.floor(foundPlayer.pos)
					foundPlayer.pos = (foundPlayer.pos <= 0) ? 0 : foundPlayer.pos
					foundPlayer.timeLastMove = Date.now()
					break
				case ("Down"):
					foundPlayer.momentum = (foundPlayer.momentum >= 0) ? foundPlayer.momentum + 1 : 0
					if (foundPlayer.momentum >= 40)
						foundPlayer.momentum = 40
					foundPlayer.pos += playerSpeed + (foundPlayer.momentum / 10)
					foundPlayer.pos = Math.floor(foundPlayer.pos)
					foundPlayer.pos = (foundPlayer.pos >= canvasHeight - foundPlayer.paddleLength) ? canvasHeight - foundPlayer.paddleLength : foundPlayer.pos
					foundPlayer.timeLastMove = Date.now()
					break
				default:
					console.log(`Input is ${input.move}`)
			}
		}
	}

	get freeSlot() {
		return this.players.length < 2
	}

	updateInfo(payload: IgameInfo) {
		//console.log(this.playerRoom);
		//console.log(this.viewerRoom);
		this.server.to(this.playerRoom).to(this.viewerRoom).emit('game.update', payload)
	}

	generateGameInfo(): IgameInfo {
		return {
			//posP1: this.players[0]?.pos,
			//posP2: this.players[1]?.pos,
			players: this.players,

			posBall: this.posBall,
			//score: [this.players[0].score, this.players[1].score],
			//score: [0,0],
			status: this.status,
			date: new Date()
		}
	}

	addUser(user: User, client: Socket) {
		if (this.players.find((player) => player.user.id === user.id))
			throw new NotFoundException('Already in game')
		if (this.players.length < 2) {
			this.players.push({
				pos: canvasHeight / 2 - paddleLength / 2,
				momentum: 0,
				timeLastMove: Date.now(),
				paddleLength: paddleLength + ((Math.random() > 0.5) ? -1 : 1) * (Math.random() * paddleLength),
				score: 0,
				user
			})
			client.join(this.playerRoom)
			if (this.players.length === 1)
				this.play()
			if (this.players.length === 2) {
				this.status = GameStatus.playing;
				//console.log(`listening event : game.play.move.${this.gameId}`)
				/*
				this.server.on(`game.play.move.${this.gameId}`, ({ userId, input }: { userId: User["id"], input: Partial<PlayerInput> }) => {
					console.log('Inside game.play.move', userId, input)
					this.applyPlayerInput(userId, input)
				})
				*/
			}
			else if (this.players.length === 1) {
				this.status = GameStatus.waiting
			}
		}
		else {
			this.viewers.push(user)
			client.join(this.viewerRoom)
		}
		setTimeout(() => this.updateInfo(this.generateGameInfo()), 100)
	}

	gameLoop() {
		//Colision mur
		if (this.posBall.y > canvasHeight - ballSize && this.velocityBall.y > 0)
			this.velocityBall.y *= -1
		if (this.posBall.y < ballSize && this.velocityBall.y < 0)
			this.velocityBall.y *= -1
		//Colision paddle droite
		if (this.posBall.x + this.velocityBall.x >= canvasWidth - ballSize - paddleWidth && (this.posBall.y > this.players[1].pos && this.posBall.y < this.players[1].pos + this.players[1].paddleLength)) {
			this.velocityBall.x = -1
			if (this.players[1].momentum !== 0) {
				this.velocityBall.y += this.players[1].momentum / 40
				//this.players[1].momentum = 0
			}
		}
		//Colision paddle gauche
		if (this.posBall.x <= ballSize + paddleWidth && (this.posBall.y > this.players[0].pos && this.posBall.y < this.players[0].pos + this.players[0].paddleLength)) {
			this.velocityBall.x = 1
			if (this.players[0].momentum !== 0) {
				this.velocityBall.y += this.players[0].momentum / 40
				//this.players[0].momentum = 0
			}
		}

		//Move de la balle
		if (this.status === GameStatus.playing) {
			this.posBall.x += this.velocityBall.x * ballSpeed
			this.posBall.y += this.velocityBall.y * ballSpeed
		}

		//Condition de marquage de point
		if (this.posBall.x <= 0) {
			this.players[1].score += 1
			this.posBall = { x: canvasWidth / 2, y: canvasHeight / 2 }
			this.velocityBall = { x: (Math.random() > 0, 5) ? 1 : -1, y: (Math.random() > 0, 5) ? 1 : -1 }
		}
		else if (this.posBall.x >= canvasWidth) {
			this.players[0].score += 1
			this.posBall = { x: canvasWidth / 2, y: canvasHeight / 2 }
			this.velocityBall = { x: (Math.random() > 0, 5 ? 1 : -1), y: (Math.random() > 0, 5 ? 1 : -1) }
		}

		//Condition fin de jeu
		if (this.players[0].score + this.players[1]?.score === gameRounds) {
			this.status = GameStatus.end
			clearInterval(this.intervalId)
		}
		//Reset des momentum
		this.players.forEach((player) => {
			if (Date.now() - player.timeLastMove > 300)
				player.momentum = 0
		})
		//Envoi des infos
		this.updateInfo(this.generateGameInfo());
	}

	play() {
		this.intervalId = setInterval(() => { this.gameLoop() }, 40)
		this.status = GameStatus.playing
	}

	get GameId(): UUID {
		return this.gameId;
	}
}
