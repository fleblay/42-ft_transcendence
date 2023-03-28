import { MyForm } from './screen/NameSelector'
import { GetAll } from './screen/getall'
import { GameCanvas } from './game/game'
import React from 'react'

const apiCall = {
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

function App() {

	return (
		<div className="App">
			<MyForm />
			<GetAll></GetAll>
			{/*<GameCanvas/>*/}
			<button onClick={() => { socket.send(JSON.stringify(apiCall)) }}>Say hello to everyone</button>
		</div>
	)
}

export default App
