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

export type GameOptions = {
	ballSpeed?: number,
	shoot?: boolean,
	obstacles?: boolean
	paddleLength?: number,
	paddleLengthMin?: number,
	paddleReduce?: number,
	victoryRounds?: number,

	maxBounce?: number,
	startAmo?: number,
	ballSize?: number
	playerSpeed?: number,
	shootSize?: number,
	shootSpeed?: number,
	liftEffect?: number
}

export enum GameStatus { "waiting" = 1, "start", "playing", "end", "error" }

export interface IPlayers {
	pos: number,
	momentum: number,
	timeLastMove: number,
	paddleLength: number,
	paddleWidth: number,
	shoot: projectile,
	amo: number
	score: number,
	user: plainUser,
	leaving: boolean,
	color: string
}

export interface IgameAsset {
	x: number,
	y: number,
	width: number,
	height: number,
	color: string
}

export type projectile = {
	pos: Pos2D,
	velocity: Pos2D,
	active: boolean,
	color: string,
	maxBounce: number,
	speed: number,
	size: number
}

export interface IgameInfo {
	players: IPlayers[],
	assets: IgameAsset[],
	ball: projectile,
	status: GameStatus,
	date: Date,
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
	stud: boolean,
	dfa: boolean,
	blockedId: number[],
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
	twoFactorEnable: boolean,
}
export type UserStatus = 'online' | 'ingame' | 'watching' | 'offline';

export type RelationType = 'sent' | 'received';

export type Friend = {
	id: number,
	username: string,
	online: boolean,
	status: UserStatus,
	type: RelationType,
	requestStatus: 'accepted' | 'pending',
}

export type Blocked = {
	id: number,
	username: string
}

export type Channel = {
	id: number,
	name: string,
	private: boolean,
	hasPassword: boolean,
	members: Member[],
	unreadMessages: number,
}

export type PlainMember = {
	id: number;
	role: string;
	user: { id: number, username: string; };
	muteTime: string,
	banned: boolean,
	left: boolean
};

export type Message = {
	id: number,
	owner: PlainMember,
	content: string,
	date: string,
	gameId: string,
}

export type Member = PlainMember & {
	isConnected: boolean;
	states: string[],
	gameIds: string[],
};


