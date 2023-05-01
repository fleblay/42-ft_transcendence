import React, { useState } from 'react';
import { SocketContext } from '../socket/SocketProvider';
import { Update } from 'vite/types/hmrPayload';
import { IgameInfo, GameStatus, GameOptions } from '../types';
import {OldGameScreen } from './OldGameScreen';
import { Box, Button, Checkbox, Container, Slider, Step, StepLabel, Stepper } from '@mui/material';
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
	const [obstacles, setObsctacles] = useState<boolean>(true);
	const [shoot, setShoot] = useState<boolean>(true);
	const [ballSpeed, setballSpeed] = useState<number>(1);
	const [victoryRounds, setVictoryRounds] = useState<number>(5);
	const [paddleReduce, setPaddleReduce] = useState<number>(1);
	const [paddleLen, setPaddleLen] = useState<number[]>([100, 300])

	const [maxBounce, setMaxBounce] = useState<number>(5);
	const [startAmo, setStartAmo] = useState<number>(3);
	const [ballSize, setBallSize] = useState<number>(5);
	const [playerSpeed, setPlayerSpeed] = useState<number>(3);
	const [shootSpeed, setShootSpeed] = useState<number>(1.5);
	const [shootSize, setShootSize] = useState<number>(2);
	const [liftEffect, setLiftEffect] = useState<number>(1);

	function handlePaddleLenChange(event: Event, val: number | number[], thumb: number) {
		const minDist = 50
		if (!Array.isArray(val))
			return
		if (val[1] - val[0] < minDist) {
			if (thumb == 0) {
				if (val[0] + minDist <= 600)
					setPaddleLen([val[0], val[0] + minDist])
				else
					setPaddleLen([600 - minDist, 600])
			}
			else {
				if (val[1] - minDist >= 0)
					setPaddleLen([val[1] - minDist, val[1]])
				else
					setPaddleLen([0, minDist])
			}
		}
		else {
			setPaddleLen(val)
		}
	}

	function joinGames(options: GameOptions, game?: string) {
		if (game) {
			navigate(`/game/${game}`);
		}
		else {
			customEmit(privateGame ? 'game.create' : 'game.findOrCreate', { options }, (gameId: string) => {
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
					<Checkbox defaultChecked onChange={(e) => { setObsctacles(e.target.checked) }} />
					<span>Shoot</span>
					<Checkbox defaultChecked onChange={(e) => { setShoot(e.target.checked) }} />
					<div>BallSpeed
						<Slider
							aria-label="Ball Speed"
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
					<div>ShootSpeed
						<Slider
							aria-label="Shoots Speed"
							defaultValue={1.5}
							valueLabelDisplay="on"
							step={0.1}
							min={0.1}
							max={2}
							marks={[
								{ value: 0.1, label: "slow" },
								{ value: 1.5, label: "normal" },
								{ value: 2, label: "fast" }
							]}
							onChange={(_, val) => setShootSpeed(Array.isArray(val) ? val[0] : val)}
						/>
					</div>
					<div>Victory
						<Slider
							aria-label="Victory Rounds"
							defaultValue={5}
							valueLabelDisplay="on"
							step={1}
							min={1}
							max={10}
							marks={[
								{ value: 1, label: "1" },
								{ value: 5, label: "5" },
								{ value: 10, label: "10" }
							]}
							onChange={(_, val) => setVictoryRounds(Array.isArray(val) ? val[0] : val)}
						/>
					</div>
					<div>Paddle Reduce Speed
						<Slider
							aria-label="Paddle Reduce"
							defaultValue={1}
							valueLabelDisplay="auto"
							step={1}
							min={0}
							max={10}
							marks={[
								{ value: 0, label: "off" },
								{ value: 1, label: "normal" },
								{ value: 10, label: "expert" }
							]}
							onChange={(_, val) => setPaddleReduce(Array.isArray(val) ? val[0] : val)}
						/>
					</div>
					<div>Paddle Length
						<Slider
							aria-label="Paddle Length"
							value={paddleLen}
							valueLabelDisplay="on"
							step={10}
							min={10}
							max={600}
							marks={[
								{ value: 10, label: "10" },
								{ value: 100, label: "default min" },
								{ value: 300, label: "default len" },
								{ value: 600, label: "600" }
							]}
							disableSwap
							onChange={(e, val, thumb) => handlePaddleLenChange(e, val, thumb)}
						/>
					</div>
					<div>Max Bouncing of shoots
						<Slider
							aria-label="MaxBounce Rounds"
							defaultValue={5}
							valueLabelDisplay="on"
							step={1}
							min={0}
							max={10}
							marks={[
								{ value: 0, label: "off" },
								{ value: 3, label: "3" },
								{ value: 10, label: "10" }
							]}
							onChange={(_, val) => setMaxBounce(Array.isArray(val) ? val[0] : val)}
						/>
					</div>
					<div>Starting Amo per player
						<Slider
							aria-label="Start Amo"
							defaultValue={3}
							valueLabelDisplay="on"
							step={1}
							min={1}
							max={10}
							marks={[
								{ value: 1, label: "1" },
								{ value: 3, label: "3" },
								{ value: 10, label: "10" }
							]}
							onChange={(_, val) => setStartAmo(Array.isArray(val) ? val[0] : val)}
						/>
					</div>
					<div>Ball size
						<Slider
							aria-label="ball Size"
							defaultValue={5}
							valueLabelDisplay="on"
							step={1}
							min={1}
							max={10}
							marks={[
								{ value: 1, label: "1" },
								{ value: 5, label: "5" },
								{ value: 10, label: "10" }
							]}
							onChange={(_, val) => setBallSize(Array.isArray(val) ? val[0] : val)}
						/>
					</div>
					<div>Shoot size
						<Slider
							aria-label="shoot Size"
							defaultValue={2}
							valueLabelDisplay="on"
							step={1}
							min={1}
							max={10}
							marks={[
								{ value: 1, label: "1" },
								{ value: 5, label: "5" },
								{ value: 10, label: "10" }
							]}
							onChange={(_, val) => setShootSize(Array.isArray(val) ? val[0] : val)}
						/>
					</div>
					<div>Player Speed
						<Slider
							aria-label="Player speed"
							defaultValue={3}
							valueLabelDisplay="on"
							step={1}
							min={1}
							max={10}
							marks={[
								{ value: 1, label: "1" },
								{ value: 3, label: "3" },
								{ value: 10, label: "10" }
							]}
							onChange={(_, val) => setPlayerSpeed(Array.isArray(val) ? val[0] : val)}
						/>
					</div>
					<div>Lift Effect
						<Slider
							aria-label="Lift effect"
							defaultValue={1}
							valueLabelDisplay="on"
							step={0.1}
							min={0}
							max={5}
							marks={[
								{ value: 0, label: "off" },
								{ value: 1, label: "default" },
								{ value: 5, label: "5" }
							]}
							onChange={(_, val) => setLiftEffect(Array.isArray(val) ? val[0] : val)}
						/>
					</div>

					<Button variant='contained' onClick={() => {
						setActiveStep(1);
						joinGames({ obstacles, shoot, ballSpeed, victoryRounds, paddleReduce, paddleLength: paddleLen[1], paddleLengthMin: paddleLen[0], maxBounce, startAmo, ballSize, playerSpeed, shootSize, shootSpeed, liftEffect})
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
