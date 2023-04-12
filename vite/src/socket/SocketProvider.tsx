import React, { createContext, useState } from 'react'
import { Socket, io } from 'socket.io-client'
import { delAccessToken, getAccessToken, saveToken } from '../token/token'
import {useAuthService} from '../auth/AuthService'

export interface SocketContextType {
	socket: Socket
	customEmit: (eventname: string, data: any, callback?: (response: any) => void) => Socket
}
export let SocketContext = React.createContext<SocketContextType>(null!)

// Appeler par AuthService quand auth.user change de valeur.
// Creer le socket quand auth.user est defini (On est connecter)
export function SocketProvider({ children }: { children: React.ReactNode }) {
	const auth = useAuthService()
	
	const value = {  }
	return <SocketContext.Provider value={value as any}>{children}</SocketContext.Provider>
}
