import {User} from './model/user.entity'
export type SocketId = string;
export type UUID = string;

export type UserStatus = 'online' | 'ingame' | 'watching'

export type UserState = {
	states : UserStatus[],
	gameIds : string[],
}

export type UserScore = {
	points: number,
	totalplayedGames: number,
	totalwonGames: number,
}

export type UserInfo = User & UserState & UserScore & {userConnected: boolean}
