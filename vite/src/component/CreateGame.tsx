import React, { useState } from 'react';
import { SocketContext } from '../socket/SocketProvider';
import { Update } from 'vite/types/hmrPayload';
import { IgameInfo, GameStatus } from '../types';
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
	const steps = [{ label: 'Select game map' }, { label: 'Matchmaking' }, { label: 'Join game' }];
	const [activeStep, setActiveStep] = React.useState(0);
	return (
		<>
			<div>
				<input type="checkbox" id="scales" name="scales" />
				<label>Privee</label>
			</div>
			<Container maxWidth="md">
				<Box sx={{
					width: '100%',
					border: '1px solid #D3C6C6',
					boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)',
					borderRadius: '16px',
				}}>
					<Stepper activeStep={activeStep} alternativeLabel>
						{steps.map((step) => (
							<Step key={step.label}>
								<StepLabel>{step.label}</StepLabel>
							</Step>
						))}
					</Stepper>

					<span>Privee</span>
					<Checkbox onChange={(e) => { setPrivateGame(e.target.checked) }} />

					<Button variant='contained' onClick={() => {
						setActiveStep(1);
						joinGames()
					}}>
						{privateGame ? "Creer une game privee" : "Trouver une game public"}
					</Button>
				</Box>
			</Container>
			<JoinGames joinGames={joinGames} />
			<Container maxWidth="md">
				<FinishGames />
			</Container>
		</>
	);
}
