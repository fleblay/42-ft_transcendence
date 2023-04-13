import React, { createContext, useState } from 'react'
import { Socket, io } from 'socket.io-client'
import { delAccessToken, getAccessToken, saveToken } from '../token/token'
import { useAuthService } from '../auth/AuthService'
import { RouterContext } from '../main'

export interface SocketContextType {
	socket: Socket | null
	customEmit: (eventname: string, data: any, callback?: (response: any) => void) => Socket | null
}
export let SocketContext = React.createContext<SocketContextType>(null!)

// Appeler par AuthService quand auth.user change de valeur.
// Creer le socket quand auth.user est defini (On est connecter)
export function SocketProvider({ children }: { children: React.ReactNode }) {
	const auth = useAuthService()
	const socket = React.useRef<Socket | null>(null);
	const nav = React.useContext(RouterContext)

	function customEmit(eventname: string, data: any, callback?: (res: any) => void): Socket | null {
		if (!socket.current) return null;
		return socket.current.emit(eventname, { ...data, _access_token: getAccessToken() }, callback)
	}

	const onConnect = React.useCallback(() => {
		console.log('Connected to socket')
		customEmit('ping', { message: "This is my first ping" }, (response: any) => {
			console.log(response)
		})
	}, [socket.current])

	React.useEffect(() => {
		if (!auth.user) return;
		if (socket.current === null) {
			socket.current = io({
				auth: {
					token: getAccessToken()
				}
			})
			console.log("Socket Creation")
		}

		function onMessage(data: any) {
			console.log('Receiving a message')
			console.log(data)
		}

		socket.current.on('connect', onConnect);
		socket.current.on('message', onMessage)
		return () => {
			if (!socket.current) return;
			socket.current.off('connect', onConnect);
			socket.current.off('message', onMessage);
			if (socket.current.connected) {
				socket.current.disconnect();
				socket.current = null;
			}
		}
	}, [auth.user])

	React.useEffect(() => {
		if (socket.current && !nav.to.startsWith('/game') && nav.from == '/game') {
			console.log("Leaving game page")
			customEmit('leave', {})
		}
	}, [nav])

	const value = { customEmit, socket: socket.current }
	return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
}
