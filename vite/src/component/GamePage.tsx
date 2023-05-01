import React, { useRef, useState, useEffect } from 'react';

import { IgameInfo } from '../types';
import { Box, Container, Step, StepLabel, Stepper } from '@mui/material';
import { useLocation, useParams } from 'react-router-dom';

import { FinishGames } from './FinishGames';
import { CreateGame } from './CreateGame';
import { GameModule } from './GameScreen';
import { GameFinishedScreen } from './ResultGame';

interface Iprops {
	startGameInfo: IgameInfo,
	gameId: string
}

export function GamePage() {

	const steps = [{ label: 'Select game map' }, { label: 'Matchmaking' }, { label: 'Play game' }, { label: 'Result' }];
	const [activeStep, setActiveStep] = React.useState(0);
	const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
	const containerRef = useRef<HTMLDivElement>(null);
	const bottomRef = useRef<HTMLInputElement>(null);
	const [result, setResult] = useState<IgameInfo | null>(null);

	const { idGame } = useParams();

	useEffect(() => {
		console.log("id", idGame);
		if (idGame && activeStep === 0) {
			setActiveStep(1);
		}
		else if (!idGame) {
			setActiveStep(0);
		}
		else if (activeStep === 3) {
			//setResult(gameInfo);
			//setGameInfo(null);
		}
	}, [activeStep, window.location.pathname]);

	const handleResize = () => {
		if (containerRef.current) {
			const containerWidth = containerRef.current.offsetWidth;
			const containerHeight = containerRef.current.offsetHeight;
			setContainerSize({ width: containerWidth, height: containerHeight });
		}
	}

	useEffect(() => {
		window.addEventListener("resize", handleResize)
		if (bottomRef.current) {
			bottomRef.current.scrollIntoView({ behavior: "smooth" })
			console.log("Going down")
		}
		return (() => {
			window.removeEventListener("resize", handleResize)
		})
	}, [])

	useEffect(() => {
		console.log("id", idGame);
		console.log("window.location.pathname", window.location.pathname);

		if (idGame) {
			setActiveStep(1);
		}
		if (containerRef.current) {
			const containerWidth = containerRef.current.offsetWidth;
			const containerHeight = containerRef.current.offsetHeight;
			setContainerSize({ width: containerWidth, height: containerHeight });
		}
	}, []);

	return (
		<>
			<Container maxWidth="lg" ref={containerRef}>
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

					{activeStep === 0 &&
						<CreateGame />
					}
					{(activeStep === 1 || activeStep === 2) &&
						<GameModule setActiveStep={setActiveStep} width={containerSize.width} setResult={setResult} bottomRef={bottomRef} />
					}
					{activeStep === 3 &&
						<GameFinishedScreen gameInfo={result} />
					}
				</Box>
				<FinishGames />
			</Container >
		</>
	);
}
