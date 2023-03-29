import { MyForm } from './pages/NameSelector'
import { GetAll } from './pages/getall'
import { GameCanvas } from './game/game'
import React, { createContext } from 'react'
import {io} from 'socket.io-client'
import {getToken } from './token/token'
import { Link, redirect } from 'react-router-dom'

interface IWSData {
	event: string;
	data: any;
}

const apiCall: IWSData = {
	event: 'ping',
	data: 'coucou'
}

const socket = io({
	auth: {
		token: getToken()
	}
})

socket.on('connect', () => {
	console.log('Emiting a ping beging')
	// socket.emit('ping', 'This is my first ping')e
	console.log('Emiting a ping end')
})

socket.on('message', (data) => {
	console.log('Receiving a message')
	console.log(data)
})

socket.on("error", (error) => {
	console.log('Error', error);
});

socket.on('exception', (data) => {
	if (data.status === "error"){
		console.log('Redirecting to login')
		//window.location.href = "/login";
		redirect("/login");
	}
	console.log('Receiving an exception')
	console.log(data)
})

/*
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
*/

export const AppContext = createContext<any>({ socket });

function App() {
	return (
		<div className="App">
			<AppContext.Provider value={{ socket }}>
				<MyForm />
				<GetAll />
				<GameCanvas />
				<button onClick={() => { socket.emit('ping', 'Coucou') }}>Say hello to everyone</button>
			<Link to="/login"> go login</Link>
			</AppContext.Provider>
		</div>
	)
}

export default App
