import React, { createContext, useEffect, useState } from 'react'
import { Socket, io } from 'socket.io-client'
import { delAccessToken, getAccessToken, saveToken } from '../token/token'
import { useAuthService } from '../auth/AuthService'
import { RouterContext } from '../main'
import apiClient from '../auth/interceptor.axios'

export interface SocketContextType {
	socket: Socket | null
	customEmit: (eventname: string, data: any, callback?: (response: any) => void) => Socket | null
	customOn: (eventName: string, callback: (data: any) => void) => Socket | null
	customOff: (eventName: string, callback?: (data: any) => void) => Socket | null
	setSubscription: (sub: string) => void
	setUnsubscribe: (unsub: string) => void
}
export let SocketContext = React.createContext<SocketContextType>(null!)

// Appeler par AuthService quand auth.user change de valeur.
// Creer le socket quand auth.user est defini (On est connecter)
export function SocketProvider({ children }: { children: React.ReactNode }) {
	const auth = useAuthService()
	const [socket, setSocket] = React.useState<Socket | null>(null);
	const nav = React.useContext(RouterContext)
	const [subscription, setSubscription] = useState<string>("");
	const [unsubscribe, setUnsubscribe] = useState<string>("");

	const listOn = React.useRef<string[]>([])

	function customEmit(eventname: string, data: any, callback?: (res: any) => void): Socket | null {
		const access_token = getAccessToken()
		if (!socket)
			return null
		if (!access_token) {
			window.location.replace(`/login`)
			}
		const usedCallback = callback ? callback : () => { }
		return socket.emit(eventname, { ...data, _access_token: access_token }, usedCallback)
	}

	useEffect(() => {
		function displayListEvent() {
			console.log('List of events on', listOn.current)
		}
		const intervalId = setInterval(displayListEvent, 5000)
		return () => clearInterval(intervalId)
	}, [listOn.current])

	function customOn(eventName: string, callback: (data: any) => void) {
		if (!socket) return null;

		listOn.current.push(eventName)
		return socket.on(eventName, callback)
	}

	function customOff(eventName: string, listener?: (data: any) => void) {
		if (!socket) return null;

		listOn.current = listOn.current.filter((event) => event !== eventName)
		return socket.off(eventName, listener)
	}

	const onConnect = React.useCallback(() => {
		console.log('Connected to socket')
		customEmit('ping', { message: "This is my first ping" }, (response: any) => {
			console.log(response)
		})
	}, [socket])

	React.useEffect(() => {
		if (!auth.user) return;
		if (socket === null) {
			setSocket(io({
				auth: {
					token: getAccessToken()
				}
			}))
			console.log("Socket Creation")
			return;
		}

		function onMessage(data: any) {
			console.log('Receiving a message')
			console.log(data)
		}
		function onDisconnect() {
			console.log('Disconnected from socket')
		}
		socket.on('connect', onConnect);
		socket.on('disconnect', onDisconnect);
		socket.on('message', onMessage)
		return () => {
			if (!socket) return;
			socket.off('connect', onConnect);
			socket.off('message', onMessage);
			socket.off('disconnect', onDisconnect);
			if (socket.connected) {
				socket.disconnect();
				setSocket(null)
			}
		}
	}, [auth.user, socket])

	React.useEffect(() => {
		if (socket && nav.to != nav.from && nav.from.startsWith('/game/')) {
			console.log("Leaving game page")
			const gameId = nav.from.split('/')[2]
			if (gameId) {
				console.log(`quit Game : ${gameId}`)
				apiClient.get(`/api/game/quit/${gameId}`)
			}
		}
	}, [nav])

/* 	React.useEffect(() => {
		if (socket && auth.user) {
			console.log("Emitting client.nav", nav)
			customEmit('client.nav', { to: nav.to, from: nav.from })
		}
	}, [nav, auth.user, socket]) */

	React.useEffect(() => {
		if (socket && auth.user) {
			console.log('client component join', {subscription})
			customEmit('client.component.join', { subscription})
		}
	}, [auth.user, socket, subscription])

	React.useEffect(() => {
		if (socket && auth.user) {
			console.log('client component leave', {unsubscribe})
			customEmit('client.component.leave', { unsubscribe})
		}
	}, [auth.user, socket, unsubscribe])


	const value = { customEmit, socket: socket, customOn, customOff, setSubscription, setUnsubscribe }
	return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
}
