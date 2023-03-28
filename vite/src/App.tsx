import { MyForm } from './screen/NameSelector'
import { GetAll } from './screen/getall'
import { GameCanvas } from './game/game'
import React, { createContext } from 'react'

interface IWSData {
	event: string;
	data: any;
}

const apiCall: IWSData = {
	event: 'gameinfo',
	data: 'coucou'
}

const socket = new WebSocket(`ws://${window.location.host}/ws/`)
socket.onopen = function () {

	// Send an initial message
	socket.send(JSON.stringify(apiCall));

	// Listen for messages
	socket.onmessage = function (event) {
		console.log('Client received a message', event);
	};

	// Listen for socket closes
	socket.onclose = function (event) {
		console.log('Client notified socket has closed', event);
	};

	// To close the socket....
	//socket.close()
};

export const appContext = createContext<{socket: WebSocket}>({ socket });

function App() {

	return (
		<div className="App">
			<appContext.Provider value={{ socket }}>
				<MyForm />
				<GetAll />
				<GameCanvas />
				<button onClick={() => { socket.send(JSON.stringify(apiCall)) }}>Say hello to everyone</button>
			</appContext.Provider>
		</div>
	)
}

export default App
