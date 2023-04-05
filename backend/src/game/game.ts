import { UUID } from '../type';
import { User } from '../model/user.entity'
import {NotFoundException} from '@nestjs/common'
import { Server, Socket } from 'socket.io'

const paddleLength = 40
const paddleWidth = 5
const ballSize = 5
const ballSpeed = 5
const playerSpeed = 5
const canvasHeight = 250
const canvasWidth = 500

export type Pos2D = {
	x: number,
	y: number
}

enum GameStatus { "waiting", "start", "playing", "end", "error" }

interface IgameInfo {

	posP1: number
	posP2: number
	posBall: Pos2D
	score: number[]
	status: GameStatus
	updateReason: string
}

enum Move { "Up" = 1, "Down" }

interface PlayerInput {
	move: Move
	powerUp?: string
}

export class Game {
	private posBall: Pos2D = { x: canvasHeight / 2, y: canvasWidth / 2 }
	private velocityBall: { x: number, y: number } = { x: (Math.random() > 0, 5 ? 1 : -1), y: (Math.random() > 0, 5 ? 1 : -1) }
	private startTime: number
	private intervalId: NodeJS.Timer
	private players: { pos: number, user: User }[] = []
	private viewers: User[] = []
	private score: number[]
	private status: GameStatus = GameStatus.waiting
	private readonly playerRoom: string
	private readonly viewerRoom: string

	constructor(private gameId: UUID, private server: Server, private privateGame: boolean = false) {
		this.playerRoom = gameId + ":player"
		this.viewerRoom = gameId + ":viewer"
	}

	applyPlayerInput(user: User, input: Partial<PlayerInput>) {
		const foundPlayer = this.players.find(player => user.id === player.user.id)
		if (foundPlayer === null)
			return
		if (input.move !== undefined) {
			switch(input.move) {
				case (Move.Up) :
					foundPlayer.pos -= playerSpeed
					break
				case (Move.Down) :
					foundPlayer.pos += playerSpeed
					break
			}
		}
	}

	get freeSlot(){
		return this.players.length < 2
	}

	updateInfo(payload: IgameInfo) {
		this.server.to(this.playerRoom).to(this.playerRoom).emit('game.update', payload)
	}

	addUser(user: User, client: Socket) {
		if (this.players.find((player) => player.user.id === user.id))
			throw new NotFoundException('Already in game')
		if (this.players.length < 2) {
			this.players.push({pos: canvasHeight / 2 - paddleLength / 2, user})
			client.join(this.playerRoom)
			if (this.players.length === 2) {
				this.status = GameStatus.start
				//setTimeout(this.play, 3000)
			}
		}
		else {
			this.viewers.push(user)
			client.join(this.viewerRoom)
		}
	}

	gameLoop() {
		console.log('Hi');
	}

	play() {
		this.intervalId = setInterval(()=> console.log("coucou"), 42)
		this.status = GameStatus.playing
	}

	get GameId(): UUID {
		return this.gameId;
	}
}
