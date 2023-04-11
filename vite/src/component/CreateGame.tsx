import React, { useState } from 'react';
import { SocketContext } from '../App';
import { Update } from 'vite/types/hmrPayload';
import { IgameInfo, GameStatus } from '../types';
import { GameScreen } from './GameScreen';
import { getMenuItemUtilityClass } from '@mui/material';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import apiClient from '../auth/interceptor.axios';

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
			<button onClick={() => {
				apiClient.get("/api/game/current").then((response) => {
					console.log(response.data);
					setListGames(response.data.map((gameId: string) => gameId.replace(/"/g, '')))
				})
			}}>Refresh list</button>
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
	const { customEmit } = React.useContext(SocketContext);

	const [privateGame, setPrivateGame] = useState<boolean>(false);

	function joinGames(game?: string) {
		if (game) {
			navigate(`/game/${game}`);
		}
		else {
			customEmit(privateGame ? 'game.create' : 'game.findOrCreate', {}, ({ gameId }: { gameId: number }) => {
				console.log("game created", gameId);
				navigate(`/game/${gameId}`);
			});
		}
	}
	return (
		<>
			<div>
				<input type="checkbox" id="scales" name="scales" onChange={(e) => { setPrivateGame(e.target.checked) }} />
				<label>Privee</label>
			</div>

			<button onClick={() => joinGames()}>
				{privateGame ? "Creer une game privee" : "Trouver une game public"}
			</button>
			<JoinGames joinGames={joinGames} />
		</>
	);
}
