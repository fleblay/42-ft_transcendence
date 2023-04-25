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
	user: plainUser,
	leaving: boolean,
}

export interface IgameAsset {
	x: number,
	y: number,
	width : number,
	height : number
}

export interface IgameInfo {
	players: IPlayers[],
	assets: IgameAsset[],
	posBall: Pos2D
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

export type plainUser = {
	id: number,
	username: string,
	email: string,
	password?: string, // To be removed in DTO in back
	stud: boolean,
	dfa: boolean
}

export type UserInfo = plainUser & {
	savedGames: Games[],
	wonGames: Games[],

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


export type Blocked= {
	id: number,
	username: string
}


