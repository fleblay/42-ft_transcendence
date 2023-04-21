export type userToken = {
	access_token: string;
	refresh_token?: string;
};
export type DecodedToken = {
	sub: number;
	email: string;
	exp: number;
	iat: number;
};

export type Pos2D = {
	x: number,
	y: number
}

export enum GameStatus { "waiting" = 1, "start", "playing", "end", "error" }

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

export type Games = {
	date: string,
	id: string,
	score: number[]
}

export type UserInfo = {
	id: number,
	username: string,
	email: string,
	password?: string, // To be removed in DTO in back
	avatar: string,
	savedGames: Games[],
	wonGames: Games[],
	stud: boolean

	states: string[],
	gameIds: string[],

	points: number,
	totalwonGames: number,
	totalplayedGames: number,

	userConnected: boolean,
}
export type UserStatus = 'online' | 'ingame' | 'watching' | 'offline';


export type Friend = {
	id: number,
	username: string,
	online: boolean,
	status: UserStatus,
}

