import React from 'react';
import { SocketContext } from '../App';
import { Update } from 'vite/types/hmrPayload';
import { IgameInfo, GameStatus } from '../types';
import { GameScreen } from './GameScreen';
import { getMenuItemUtilityClass } from '@mui/material';
import axios from 'axios';

interface Iprops {
	startGameInfo: IgameInfo,
	gameId: string
}

interface JoinGamesProps {
	setGameId: React.Dispatch<React.SetStateAction<string>>;
	setGameInfo: React.Dispatch<React.SetStateAction<IgameInfo | undefined>>;
}

const JoinGames: React.FunctionComponent<JoinGamesProps> = ({ setGameId, setGameInfo }) => {
	const [listGames, setListGames] = React.useState<string[]>([]);
	const { socket } = React.useContext(SocketContext);

	return (
		<>
			<button onClick={() => { axios.get("/api/game/current").then((response) => {
				console.log(response.data);
				setListGames(response.data.map((gameId: string) => gameId.replace(/"/g, '')))
			}) }}>Refresh list</button>
			<div>
				{listGames.map((gameId) => {
					return <div key={gameId}>
						<button onClick={() => {
							socket.emit('game.join', { gameId: gameId }, (response: any) => {
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
							})
						}}>Join game {gameId}
						</button>
					</div>
				})
				}
			</div>
		</>
	);
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
			<JoinGames setGameId={setGameId} setGameInfo={setGameInfo} />
			<div>{gameId}
			</div>
			{
				gameInfo && <GameScreen startGameInfo={gameInfo} gameId={gameId} ></GameScreen>
			}

		</>

	);
}