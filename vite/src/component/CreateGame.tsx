import React, { useState } from 'react';
import { SocketContext } from '../socket/SocketProvider';
import { Update } from 'vite/types/hmrPayload';
import { IgameInfo, GameStatus, GameOptions } from '../types';
import { GameScreen } from './GameScreen';
import { Box, Button, Checkbox, Container,  Step, StepLabel, Stepper } from '@mui/material';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import apiClient from '../auth/interceptor.axios';
import { useAuthService } from '../auth/AuthService';
import { FinishGames } from './FinishGames';

interface Iprops {
	startGameInfo: IgameInfo,
	gameId: string
}

interface JoinGamesProps {
	joinGames: (options: GameOptions, game?: string) => void;
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
							joinGames({}, gameId);
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
	const [obstacles, setObsctacles] = useState<boolean>(false);
	const [shoot, setShoot] = useState<boolean>(false);

	function joinGames(options : GameOptions, game ?: string) {
		if (game) {
			navigate(`/game/${game}`);
		}
		else {
			customEmit(privateGame ? 'game.create' : 'game.findOrCreate', {options}, (gameId : string ) => {
				console.log("game created", gameId);
				navigate(`/game/${gameId}`);
				console.log("nav ok", gameId);
			});
		}
	}
	const steps = [{ label: 'Select game map' }, { label: 'Matchmaking' }, { label: 'Join game' }];
	const [activeStep, setActiveStep] = React.useState(0);
	return (
		<>
			<Container maxWidth="md">
				<Box sx={{
					width: '100%',
					border: '1px solid #D3C6C6',
					boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)',
					borderRadius: '16px',
					p: '2rem',
					bgcolor: 'background.paper',
				}}>
					<Stepper activeStep={activeStep} alternativeLabel>
						{steps.map((step) => (
							<Step key={step.label}>
								<StepLabel>{step.label}</StepLabel>
							</Step>
						))}
					</Stepper>

					<span>Private</span>
					<Checkbox onChange={(e) => { setPrivateGame(e.target.checked) }} />
					<span>Obstacles</span>
					<Checkbox onChange={(e) => { setObsctacles(e.target.checked) }} />
					<span>Shoot</span>
					<Checkbox onChange={(e) => { setShoot(e.target.checked) }} />

					<Button variant='contained' onClick={() => {
						setActiveStep(1);
						joinGames({obstacles, shoot})
					}}>
						{privateGame ? "Create a private game" : "Join a game"}
					</Button>
				</Box>
				<JoinGames joinGames={joinGames} />
				<FinishGames />
			</Container>
		</>
	);
}
