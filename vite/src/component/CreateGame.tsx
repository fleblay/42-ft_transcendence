import React from 'react';
import { SocketContext } from '../App';
import { Update } from 'vite/types/hmrPayload';
import { IgameInfo, GameStatus } from '../types';
import { GameScreen } from './GameScreen';
import { getMenuItemUtilityClass } from '@mui/material';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';

interface Iprops {
	startGameInfo: IgameInfo,
	gameId: string
}

interface JoinGamesProps {
	joinGames: (game?: string) => void;
}

const JoinGames: React.FunctionComponent<JoinGamesProps> = ({ joinGames }) => {
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
							joinGames(gameId);
						}}>Join game {gameId}
						</button>{gameId}
					</div>
				})
				}
			</div>
		</>
	);
}

export function CreateGame() {
	const navigate = useNavigate();

	function joinGames(game?: string) {
		if (game) {
			navigate(`/game/${game}`);
		}
		else {

		}
	}
	return (
		<>
			<button onClick={() => joinGames() }>
				createGame
			</button>
			<JoinGames joinGames={joinGames} />
		</>

	);
}
