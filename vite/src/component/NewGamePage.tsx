import React, { useRef, useState } from 'react';
import { SocketContext } from '../socket/SocketProvider';
import { Update } from 'vite/types/hmrPayload';
import { IgameInfo, GameStatus, GameOptions } from '../types';
import { GamePage, GameScreen } from './GameScreen';
import { Box, Button, Checkbox, Container, Slider, Step, StepLabel, Stepper } from '@mui/material';
import axios from 'axios';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import apiClient from '../auth/interceptor.axios';
import { useAuthService } from '../auth/AuthService';
import { FinishGames } from './FinishGames';
import { CreateGame } from './CreateGame';
import { NewCreateGame } from './NewCreateGame';
import { GameModule } from './NewGameScreen';

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

export function NewGamePage() {

    const steps = [{ label: 'Select game map' }, { label: 'Matchmaking' }, { label: 'Join game' }];
    const [activeStep, setActiveStep] = React.useState(0);
    const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
    const containerRef = useRef<HTMLDivElement>(null);
    const location = useLocation();
	const { idGame } = useParams();

    React.useEffect(() => {
        console.log("id", idGame);
    
        if (idGame) {
            setActiveStep(1);
        }

      }, [activeStep, window.location.pathname]);


    React.useEffect(() => {
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
            <Container maxWidth="md" ref={containerRef}>
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
                    <NewCreateGame setActiveStep={setActiveStep}/>
                }
                {activeStep === 1 &&
                    <GameModule setActiveStep={setActiveStep} width={containerSize.width} />
                }

            </Box>
        </Container >
        </>
    );
}
