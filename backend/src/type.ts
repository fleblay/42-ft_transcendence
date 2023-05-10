import { FriendRequestStatus } from './model/friend-request.entity';
import { User } from './model/user.entity'
export type SocketId = string;
export type UUID = string;

export type UserStatus = 'online' | 'ingame' | 'watching' | 'offline';

export type UserState = {
	states: UserStatus[],
	gameIds: string[],
}

export type UserScore = {
	points: number,
	totalplayedGames: number,
	totalwonGames: number,
}

export type UserInfo = User & UserState & UserScore & { userConnected: boolean }

export type Friend = {
	id: number,
	username: string,
	online: boolean,
	status: UserStatus,
	type: 'sent' | 'received'
	requestStatus: FriendRequestStatus
}


export type Blocked = {
	id: number,
	username: string
}

export type Tokens = {
	accessToken: string,
	refreshToken: string,
	dfaToken?: string
}

export interface Login42User {
	email: string;
	username?: string;
	password: string
	stud: boolean;
}

export interface ChannelInfo {
	id: number;
	name: string;
	directMessage: boolean;
}