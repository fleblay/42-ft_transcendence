import React, { useState } from 'react';
import { SocketContext } from '../socket/SocketProvider';
import { Update } from 'vite/types/hmrPayload';
import { IgameInfo, GameStatus, GameOptions } from '../types';
import { GamePage, GameScreen } from './GameScreen';
import { Box, Button, Checkbox, Container, Slider, Step, StepLabel, Stepper } from '@mui/material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import apiClient from '../auth/interceptor.axios';


interface ICreateGameProps {
	setActiveStep: (step: number) => void;
}

interface ListCurrentGamesProps {
	joinGame: (options: GameOptions, game?: string) => void;
}

const ListCurrentGames: React.FC<ListCurrentGamesProps> = ({ joinGame }) => {
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
					return (
						<div key={gameId}>
							<button onClick={() => {
								joinGame({}, gameId);
							}}>Join game {gameId}
							</button>{gameId}
						</div>
					)
				})}
			</div>
		</>
	);
}


export function NewCreateGame({ setActiveStep }: ICreateGameProps) {
	const navigate = useNavigate();
	const { customEmit } = React.useContext(SocketContext);

	const [privateGame, setPrivateGame] = useState<boolean>(false);
	const [obstacles, setObsctacles] = useState<boolean>(false);
	const [shoot, setShoot] = useState<boolean>(false);
	const [ballSpeed, setballSpeed] = useState<number>(1);

	function joinGame(options: GameOptions, gameId?: string) {
		if (gameId) {
			navigate(`/newgame/${gameId}`);
		}
		else {
			customEmit(privateGame ? 'game.create' : 'game.findOrCreate', { options }, (gameId: string) => {
				console.log("game created", gameId);
				navigate(`/newgame/${gameId}`);
				console.log("nav ok", gameId);
			});
		}
	}

	return (

		<>
			< span > Private</span>
			<Checkbox onChange={(e) => { setPrivateGame(e.target.checked) }} />
			<span>Obstacles</span>
			<Checkbox onChange={(e) => { setObsctacles(e.target.checked) }} />
			<span>Shoot</span>
			<Checkbox onChange={(e) => { setShoot(e.target.checked) }} />
			<div>BallSpeed
				<Slider
					aria-label="Game Speed"
					defaultValue={1}
					valueLabelDisplay="on"
					step={0.1}
					min={0.1}
					max={2}
					marks={[
						{ value: 0.1, label: "slow" },
						{ value: 1, label: "normal" },
						{ value: 2, label: "fast" }
					]}
					onChange={(_, val) => setballSpeed(Array.isArray(val) ? val[0] : val)}
				/>
			</div>

			<Button variant='contained' onClick={() => {
				joinGame({ obstacles, shoot, ballSpeed })
			}}>
				{privateGame ? "Create a private game" : "Join a game"}
			</Button>
			<ListCurrentGames joinGame={joinGame} />
		</>
	);
}
