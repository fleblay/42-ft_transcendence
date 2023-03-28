import { MyForm } from './screen/NameSelector'
import { GetAll } from './screen/getall'
import { GameCanvas } from './game/game'
import React from 'react'

const apiCall = {
	event : 'gameinfo',
	data: 'coucou'
}

const socket = new WebSocket('ws://localhost:8080/api')
socket.onopen = function(event) {

	// Send an initial message
	socket.send('I am the client and I\'m listening!');

	// Listen for messages
	socket.onmessage = function(event) {
		console.log('Client received a message',event);
	};

	// Listen for socket closes
	socket.onclose = function(event) {
		console.log('Client notified socket has closed',event);
	};

	// To close the socket....
	//socket.close()

};

function App() {

  return (
    <div className="App">
     <MyForm/>
	 <GetAll></GetAll>
	{/*<GameCanvas/>*/}
    </div>
  )
}

export default App
