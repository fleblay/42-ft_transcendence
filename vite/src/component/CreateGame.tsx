import React from 'react';
import { SocketContext } from '../App';
import { Update } from 'vite/types/hmrPayload';
import { IgameInfo, GameStatus } from '../types';
import { GameScreen } from './GameScreen';

interface Iprops {
	startGameInfo: IgameInfo
}

export function CreateGame(): JSX.Element {
	const { socket } = React.useContext(SocketContext);
	const [gameId, setGameId] = React.useState<string>("")
	const [gameInfo, setGameInfo] = React.useState<IgameInfo>();

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
			<button onClick={() => socket.emit('game.join', {}, (response: any) => {

				if (response.error) {
					console.log(response.error);
					setGameId(response.error);
				}
				else {
					console.log(response.user);
					setGameId(response.gameId);
					socket.on('game.update', (data: IgameInfo) => {
						console.log('game.update', data);
						setGameInfo(data);
					});
				}
			}
			)}>
				createGame
			</button>
			<div>{gameId}
			</div>
			{
				gameInfo && <GameScreen startGameInfo={gameInfo} ></GameScreen>
			}

		</>

	);
}