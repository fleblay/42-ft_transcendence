export type userToken = {
	  access_token: string;
	  refresh_token?: string;
	};

export type Pos2D = {
		x: number,
		y: number
	}

export enum GameStatus { "waiting", "start", "playing", "end", "error" }

export interface IPlayers {
	pos: number,
	momentum: number,
	timeLastMove: number,
	paddleLength: number,
	paddleWidth: number,
	score: number,
}

export interface IgameInfo {
	//posP1: number
	//posP2: number
	players: IPlayers[],
	posBall: Pos2D
	//score: number[]
	status: GameStatus
	date: Date
}

export enum Move { "Up" = 1, "Down" }

export interface PlayerInput {
		move: Move
		powerUp?: string
	}
