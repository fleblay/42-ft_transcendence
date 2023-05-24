import React, { useEffect, useState } from 'react'
import { Socket, io } from 'socket.io-client'
import { getAccessToken } from '../token/token'
import { useAuthService } from '../auth/AuthService'
import { RouterContext } from '../main'
import apiClient from '../auth/interceptor.axios'

export interface SocketContextType {
	socket: Socket | null
	customEmit: (eventname: string, data: any, callback?: (response: any) => void) => Socket | null
	customOn: (eventName: string, callback: (data: any) => void) => Socket | null
	customOff: (eventName: string, callback: (data: any) => void) => Socket | null
	addSubscription: (sub: string) => (() => void) | void
}
export let SocketContext = React.createContext<SocketContextType>(null!)

// Appeler par AuthService quand auth.user change de valeur.
// Creer le socket quand auth.user est defini (On est connecter)
export function SocketProvider({ children }: { children: React.ReactNode }) {
	const auth = useAuthService()
	const [socket, setSocket] = React.useState<Socket | null>(null);
	const nav = React.useContext(RouterContext)
	const [subscription, setSubscription] = useState<string[]>([]);

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

/*
	useEffect(() => {
		function displayListEvent() {
			console.log('List of events on', listOn.current)
			console.log('List of subscriptions', subscription)
		}
		const intervalId = setInterval(displayListEvent, 5000)
		return () => clearInterval(intervalId)
	}, [listOn.current, subscription])
*/

	function customOn(eventName: string, callback: (data: any) => void) {
		if (!socket) return null;

		listOn.current.push(eventName)
		return socket.on(eventName, callback)
	}

	function customOff(eventName: string, listener: (data: any) => void) {
		if (!socket) return null;

		listOn.current = listOn.current.filter((event) => event !== eventName)
		return socket.off(eventName, listener)
	}

	React.useEffect(() => {
		if (!auth.user) return;
		if (socket === null) {
			const temporarySocket = io({
				auth: {
					token: getAccessToken(),
				}
			})
			function onConnect() {
				setSocket(temporarySocket)
			}

			temporarySocket.on('connect', onConnect);
			return () => {
				temporarySocket.off('connect', onConnect);
			}
		}

		function onMessage(data: any) {
			//console.log('Receiving a message')
			//console.log(data)
		}
		function onDisconnect() {
			//console.log('Disconnected from socket')
		}
		socket.on('disconnect', onDisconnect);
		socket.on('message', onMessage)
		return () => {
			if (!socket) return;
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
			const gameId = nav.from.split('/')[2]
			if (gameId) {
				apiClient.get(`/api/game/quit/${gameId}`).catch(() => {})
			}
		}
	}, [nav])


	function addSubscription(sub: string) {
		if (!socket?.connected) return;

		if (sub === "") return;
		customEmit('client.component.join', { subscription: sub })
		setSubscription(newSubscription => {
			if (newSubscription.includes(sub)) return newSubscription;
			return [...newSubscription, sub]
		})
		return () => {
			customEmit('client.component.leave', { unsubscription: sub })
			setSubscription((newSubscription) => newSubscription.filter((sub) => sub !== sub))
		}
	}

	const value = { customEmit, socket: socket, customOn, customOff, addSubscription}
	return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
}
