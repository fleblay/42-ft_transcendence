import React, { useContext, useEffect, useRef, useState } from "react";
import { SocketContext } from "../App";
import { IgameInfo, GameStatus } from "../types";
import { useAuthService } from "../auth/AuthService";
import { useParams } from "react-router-dom";

interface Iprops {
	startGameInfo: IgameInfo,
	gameId: string
}

const canvasHeight = 600
const canvasWidth = 800
const ballSize = 5

enum LoadingStatus {
	Loading,
	Loaded,
	Failed
}

export function GamePage() {
	const [loading, setLoading] = useState<LoadingStatus>(LoadingStatus.Loading);
	const [gameInfo, setGameInfo] = useState<IgameInfo>({} as IgameInfo);
	const [joined, setJoined] = useState<boolean>(false);
	const { socket } = useContext(SocketContext);

	let auth = useAuthService();

	const { idGame } = useParams();

	useEffect(() => {
		if (!joined) {
			setJoined(true)
			return
		}
		socket.emit('game.join', { gameId: idGame }, (response: any) => {
			if (response.error) {
				console.log(response.error);
				setLoading(LoadingStatus.Failed);
			}
			else {
				setGameInfo(response.gameInfo);
				setLoading(LoadingStatus.Loaded);
			}
		});
	}, [joined]);

	if (loading === LoadingStatus.Loading) {
		return (
			<div>
				Loading...
			</div>
		);
	}

	if (loading === LoadingStatus.Loaded && idGame) {
		if (gameInfo.status === GameStatus.playing) {
			return <GameScreen startGameInfo={gameInfo} gameId={idGame} />
		}
		if (gameInfo.status === GameStatus.end) {
			return <GameFinishedScreen gameInfo={gameInfo} />
		}
	}

	return (
		<div>
			Failed to load game (game not found)
		</div>
	);
};

function GameFinishedScreen({ gameInfo }: { gameInfo: IgameInfo }) {
	return (
		<div>
			<div>Game finished</div>
			<div>Winner: {gameInfo.players.map((player, index) => <div key={index}> {player.score}</div>)}</div>
		</div>
	)
}

export function GameScreen({ startGameInfo, gameId }: Iprops): JSX.Element {
	const canvasRef = useRef<HTMLCanvasElement | null>(null);
	const context = useRef<CanvasRenderingContext2D | null>(null);
	const [gameInfo, setGameInfo] = useState<IgameInfo>(startGameInfo);
	const { socket } = useContext(SocketContext);

	const [keyDown, setKeyDown] = useState({ up: false, down: false });

	useEffect(() => {
		const interval = setInterval(() => {
			if (keyDown.up) {
				socket.emit('game.play.move', { gameId: gameId, move: 'Up' })
			}
			if (keyDown.down) {
				socket.emit('game.play.move', { gameId: gameId, move: 'Down' })
			}
		}, 10);
		return () => clearInterval(interval);
	}, [keyDown])

	useEffect(() => {
		function handleKeyDown(e: KeyboardEvent) {
			if (e.key === 'ArrowUp' && keyDown.up === false) {
				setKeyDown({ up: true, down: false })
			}
			if (e.key === 'ArrowDown' && keyDown.down === false) {
				setKeyDown({ up: false, down: true })
			}
		}
		function handleKeyUp(e: KeyboardEvent) {
			if (e.key === 'ArrowUp') {
				setKeyDown({ up: false, down: false })
			}
			if (e.key === 'ArrowDown') {
				setKeyDown({ up: false, down: false })
			}
		}
		window.addEventListener('keydown', handleKeyDown)
		window.addEventListener('keyup', handleKeyUp)
		return () => {
			window.removeEventListener('keydown', handleKeyDown)
			window.removeEventListener('keyup', handleKeyUp)
		}
	}, [])

	useEffect(() => {
		const context2d = canvasRef.current?.getContext('2d');
		if (!context2d) return;

		context.current = context2d;
		if (canvasRef.current)
			canvasRef.current.style.border = '1px solid black'
	}, []); // 1 seul call quand le return est fait

	useEffect(() => {
		if (!context.current) return;

		// Clear canvas
		context.current.clearRect(0, 0, canvasWidth, canvasHeight);
		context.current.fillStyle = "black";
		context.current.fillRect(0, 0, canvasWidth, canvasHeight);

		// Set color of players
		context.current.fillStyle = "white";

		// Player One
		if (gameInfo.players[0])
			context.current.fillRect(0, gameInfo.players[0].pos, gameInfo.players[0].paddleWidth, gameInfo.players[0].paddleLength);
		// Player Two
		if (gameInfo.players[1])
			context.current.fillRect(canvasWidth - gameInfo.players[1].paddleWidth, gameInfo.players[1].pos, gameInfo.players[1].paddleWidth, gameInfo.players[1].paddleLength);

		// Ball
		context.current.fillStyle = "white";
		// context.current.fillRect(posBall.x, posBall.y, ballSize, ballSize);

		context.current.beginPath();
		context.current.arc(gameInfo.posBall.x, gameInfo.posBall.y, ballSize, 0, 2 * Math.PI)
		context.current.fill();

		// center line
		context.current.beginPath();
		context.current.strokeStyle = "white";
		context.current.moveTo(canvasWidth / 2, 0);
		context.current.lineTo(canvasWidth / 2, canvasHeight);
		context.current.stroke();

	}, [gameInfo.players[0].pos, gameInfo.players[1]?.pos, gameInfo.posBall]);

	React.useEffect(() => {
		function onGameUpdate(data: IgameInfo) {
			//console.log('game.update', data);
			setGameInfo(data);
		}
		socket.on('game.update', onGameUpdate)
		return () => {
			socket.off('game.update', onGameUpdate)
		}
	}, [])

	// useEffect(() => {
	// 	function handleKeyDown(e: KeyboardEvent) {
	// 		if (e.key === 'ArrowUp') {
	// 			console.log('game.play.move', {input :{move : 'Up'}});
	// 			socket.emit('game.play.move', {gameId : gameId, move : 'Up'})
	// 		}
	// 		if (e.key === 'ArrowDown') {
	// 			console.log('game.play.move', {input :{move : 'Up'}});
	// 			socket.emit('game.play.move', {gameId: gameId , move : 'Down'})
	// 		}
	// 	}
	// 	window.addEventListener('keydown', handleKeyDown)
	// 	return () => {
	// 		window.removeEventListener('keydown', handleKeyDown)
	// 	}
	// }, [])

	return <div>
		<div> <h1>Game Info :</h1></div>
		<div> posBall x :{gameInfo?.posBall.x} </div>
		<div> posBall y: {gameInfo?.posBall.y} </div>
		<div> posP1: {gameInfo?.players[0].pos} </div>
		<div> momentumP1: {gameInfo?.players[0].momentum} </div>
		<div> paddleLengthP1: {gameInfo?.players[0].paddleLength} </div>
		<div> posP2: {gameInfo?.players[1]?.pos} </div>
		<div> momentumP2: {gameInfo?.players[1]?.momentum} </div>
		<div> paddleLengthP2: {gameInfo?.players[1]?.paddleLength} </div>
		<div> score: {`${gameInfo?.players[0].score}:${gameInfo?.players[1]?.score}`} </div>
		<div> status: {gameInfo?.status} </div>
		<div> date: {gameInfo?.date.toString()} </div>
		<div>
			<canvas width={canvasWidth} height={canvasHeight} ref={canvasRef} />
		</div>
	</div>
}
