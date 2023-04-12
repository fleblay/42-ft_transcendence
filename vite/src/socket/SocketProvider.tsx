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
function SocketProvider({ children }: { children: React.ReactNode }) {
	const auth = useAuthService()

	function customEmit(eventname: string, data: any, callback?: (res: any) => void): Socket {
		return socket.emit(eventname, {...data, _access_token: getAccessToken()}, callback)
	}

	React.useEffect(() => {
		if (!auth.user) return
		function onConnect() {
			console.log('Connected to socket')
			customEmit('ping', { message: "This is my first ping" }, (response: any) => {
				console.log(response)
			})
		}

		function onDisconnect() {
			console.log('Disconnected to socket')
			customEmit('goodbye', { message: "Bye" });
		}

		function onMessage(data: any) {
			console.log('Receiving a message')
			console.log(data)
		}

		socket.on('connect', onConnect);
		socket.on('disconnect', onDisconnect);
		socket.on('message', onMessage)
		return () => {
			socket.off('connect', onConnect);
			socket.off('disconnect', onDisconnect);
			socket.off('message', onMessage);
			socket.disconnect()
		}
	}, [auth.user])
	if (!auth.user) return <>{children}</>;

	const socket = io({
		auth: {
			token: getAccessToken()
		},
	})

	const value = { socket, customEmit }
	console.log("Socket Creation")
	console.log(Date.now()/1000);
	return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
}
