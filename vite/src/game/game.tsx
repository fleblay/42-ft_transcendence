import React, { useContext, useEffect, useRef, useState } from "react";
import { appContext } from "../App";

const paddleLength = 40
const paddleWidth = 5
const ballSize = 5
const ballSpeed = 10
const playerSpeed = 5
const canvasHeight = 250
const canvasWidth = 500

interface IBallPos {
	x: number;
	y: number;
	dirX: number;
	dirY: number;
}

export function GameCanvas() {
	const canvasRef = useRef<HTMLCanvasElement | null>(null);
	const context = useRef<CanvasRenderingContext2D | null>(null);
	const [posBall, setPosBall] = useState<IBallPos>({
		x: canvasWidth / 2,
		y: canvasHeight / 2,
		dirX: (Math.random() > 0.5 ? -1 : 1),
		dirY: (Math.random() > 0.5 ? -1 : 1)
	}); // pour rerender le div au changement slider
	const [posPlayerOne, setPosPlayerOne] = useState<number>(canvasHeight / 2); // pour rerender le div au changement slider
	const [posPlayerTwo, setPosPlayerTwo] = useState<number>(canvasHeight / 2); // pour rerender le div au changement slider
	const [timer, setTimer] = useState<boolean>(false);

	const { socket } = useContext(appContext)

	setTimeout(() => {
		let { x, y, dirX, dirY } = posBall
		//Colision mur
		if (y > canvasHeight - ballSize && dirY == 1)
			dirY = -1
		if (y < ballSize && dirY == -1)
			dirY = 1
		//Colision paddle
		if (x + dirX > canvasWidth - ballSize - paddleWidth && (y > posPlayerTwo - paddleLength / 2 && y < posPlayerTwo + paddleLength / 2))
			dirX = -1
		if (x < ballSize + paddleWidth && (y > posPlayerOne - paddleLength / 2 && y < posPlayerOne + paddleLength / 2))
			dirX = 1
		setPosBall({
			x: x + dirX,
			y: y + dirY,
			dirX,
			dirY
		})
	}, ballSpeed)

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
		context.current.fillRect(0, posPlayerOne, paddleWidth, paddleLength);
		// Player Two
		context.current.fillRect(canvasWidth - paddleWidth, posPlayerTwo, paddleWidth, paddleLength);

		// Ball
		context.current.fillStyle = "rgb(0, 200, 0, 1)";
		// context.current.fillRect(posBall.x, posBall.y, ballSize, ballSize);

		context.current.beginPath();
		context.current.arc(posBall.x, posBall.y, ballSize, 0, 2 * Math.PI)
		context.current.fill();
	}, [posPlayerOne, posPlayerTwo, posBall]); // 1 call initial, puis a chaque maj de pos


	useEffect(() => {
		function handleKeyDown(event: KeyboardEvent) {
			const keyPressed = event.key
			switch (keyPressed) {
				case 'k':
					setPosPlayerOne(posPlayerOne - playerSpeed)
					break
				case 'j':
					setPosPlayerOne(posPlayerOne + playerSpeed)
					break
				case 'ArrowUp':
					setPosPlayerTwo(posPlayerTwo - playerSpeed)
					break
				case 'ArrowDown':
					setPosPlayerTwo(posPlayerTwo + playerSpeed)
					break
				default:
					console.log(keyPressed)
					break
			}
			socket.send(JSON.stringify({ event: 'keyPress', data: keyPressed }))
		}
		document.addEventListener('keydown', handleKeyDown)
		return (() => {
			document.removeEventListener('keydown', handleKeyDown) // cleanup fx
		})
	}, [posPlayerOne, posPlayerTwo])

	return (
		<div>
			<canvas width={canvasWidth} height={canvasHeight} ref={canvasRef} />
		</div>
	)
}
