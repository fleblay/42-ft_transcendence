import { MyForm } from './pages/NameSelector'
import { GetAll } from './pages/getall'
import { GameCanvas } from './game/game'
import React, { createContext, useState } from 'react'
import { Socket, io } from 'socket.io-client'
import { getToken } from './token/token'
import * as Router from 'react-router-dom'

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

export const AppContext = createContext<any>({});

function App() {
	function newSocket() {
		return io({
			auth: {
				token: getToken()
			}
		})
	}

	function reconnect() {
		socket.close()
		setSocket(newSocket());
	}

	const [socket, setSocket] = useState<Socket>(newSocket());
	const navigate = Router.useNavigate()
	React.useEffect(() => {
		console.log('Creating event listener');
		function onConnect() {
			console.log('Emiting a ping beging')
			// socket.emit('ping', 'This is my first ping')e
			console.log('Emiting a ping end')

		}
		function onMessage(data: any) {
			console.log('Receiving a message')
			console.log(data)
		}

		function onException(data: any) {
			if (data.status === "error") {
				console.log('Redirecting to login')
				navigate('/login')
			}
			console.log('Receiving an exception')
			console.log(data)
			socket.disconnect()
		}

		socket.on('connect', onConnect);
		socket.on('message', onMessage)
		socket.on('exception', onException)
		return () => {
			socket.off('connect', onConnect);
			socket.off('message', onMessage)
			socket.off('exception', onException)
		}
	}, [socket])

	return (
		<div className="App">
			<AppContext.Provider value={{ socket, reconnect, navigate }}>
				<MyForm />
				<GetAll />
				<GameCanvas />
				<button onClick={() => { socket.emit('ping', 'Coucou') }}>Say hello to everyone</button>
				<Router.Link to="/login"> go login</Router.Link>
			</AppContext.Provider>
		</div>
	)
}

export default App
