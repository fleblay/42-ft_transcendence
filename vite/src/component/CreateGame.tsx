import React from 'react';
import { SocketContext } from '../App';
import { Update } from 'vite/types/hmrPayload';
import { IgameInfo, GameStatus } from '../types';
import { GameScreen } from './GameScreen';
import { getMenuItemUtilityClass } from '@mui/material';
import axios from 'axios';
import { useParams } from 'react-router-dom';

interface Iprops {
	startGameInfo: IgameInfo,
	gameId: string
}

interface JoinGamesProps {
	setGameId: React.Dispatch<React.SetStateAction<string>>;
	setGameInfo: React.Dispatch<React.SetStateAction<IgameInfo | undefined>>;
	joinGames: (game?: string) => void;
}

const JoinGames: React.FunctionComponent<JoinGamesProps> = ({ joinGames, setGameId, setGameInfo }) => {
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
						<label>{gameId}</label>
						<button onClick={() => {
							joinGames(gameId);
						}}>Join game
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

	function joinGames(game?: string) {
		console.log('game is now:', game)
		socket.emit('game.join', { gameId: game }, (response: any) => {
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
	}

	let { id } = useParams();

	React.useEffect(() => {
		if (id) {
			console.log('joining game: ', id);
			joinGames(id);
		}
	}, [id])

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
			<button onClick={() => joinGames() }>
				createGame
			</button>
			<JoinGames joinGames={joinGames} setGameId={setGameId} setGameInfo={setGameInfo} />
			<div>{gameId}
			</div>
			{
				gameInfo && <GameScreen startGameInfo={gameInfo} gameId={gameId} ></GameScreen>
			}

		</>

	);
}
