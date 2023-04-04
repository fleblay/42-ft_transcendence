import React from 'react';
import { SocketContext } from '../App';



export function CreateGame(): JSX.Element {
	const { socket } = React.useContext(SocketContext);
	const [gameId, setGameId] = React.useState<string>("")

/* 	React.useEffect(() => {
		function onNewLobby(data: any) {
			console.log('new lobby', data)
		}
		socket.on('newLobby', onNewLobby)
		return () => {
			socket.off('newLobby', onNewLobby)
		}
	}, []) */
	return (
		<>
			<button onClick={() => socket.emit('game.join', {} , (response:  any) => {console.log(response.user); setGameId(response.gameId)})}>
				createGame
			</button>
			<div>{gameId}
			</div>
		</>

	);
}