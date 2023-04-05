import React, { useContext, useEffect, useRef, useState } from "react";
import { SocketContext } from "../App";
import { IgameInfo, GameStatus } from "../types";


interface Iprops {
	startGameInfo: IgameInfo
}

const canvasHeight = 250
const canvasWidth = 500
const paddleLength = 40
const paddleWidth = 5
const ballSize = 5


export function GameScreen({ startGameInfo }: Iprops): JSX.Element {

	const canvasRef = useRef<HTMLCanvasElement | null>(null);
	const context = useRef<CanvasRenderingContext2D | null>(null);
	const [gameInfo, setGameInfo] = useState<IgameInfo>(startGameInfo);
	const { socket } = useContext(SocketContext);


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

		// Set color of players
		context.current.fillStyle = "rgb(200, 0, 0, 1)";

		// Player One
		context.current.fillRect(0, gameInfo.posP1, paddleWidth, paddleLength);
		// Player Two
		context.current.fillRect(canvasWidth - paddleWidth, gameInfo.posP2, paddleWidth, paddleLength);

		// Ball
		context.current.fillStyle = "rgb(0, 200, 0, 1)";
		// context.current.fillRect(posBall.x, posBall.y, ballSize, ballSize);

		context.current.beginPath();
		context.current.arc(gameInfo.posBall.x, gameInfo.posBall.y, ballSize, 0, 2 * Math.PI)
		context.current.fill();
	}, [gameInfo.posP1, gameInfo.posP2, gameInfo.posBall]);

	useEffect(() => {
		

	return <div>
			<div> <h1>Game Info :</h1></div>
			<div> posBall x :{gameInfo?.posBall.x} </div>
			<div> posBall y: {gameInfo?.posBall.y} </div>
			<div> posP1: {gameInfo?.posP1} </div>
			<div> posP2: {gameInfo?.posP2} </div>
			<div> score: {gameInfo?.score} </div>
			<div> status: {gameInfo?.status} </div>
			<div> date: {gameInfo?.date.toString()} </div>
			<div>
			<canvas width={canvasWidth} height={canvasHeight} ref={canvasRef} />
		</div>
	</div>
}