import React, { useEffect, useRef, useState } from "react";


export function GameCanvas() {
	const canvasRef = useRef<HTMLCanvasElement | null>(null);
	const context = useRef<CanvasRenderingContext2D | null>(null);

	const [pos, setPos] = useState<number>(0);

	useEffect(() => {
		const context2d = canvasRef.current?.getContext('2d');
		if (!context2d) return;

		context.current = context2d;
	}, []);

	useEffect(() => {
		if (!context.current) return;
		
		context.current.clearRect(0, 0, 1000, 1000);
		context.current.fillStyle = 'red';
		context.current.fillRect(pos, pos, 10, 10);
	}, [pos]);

	return (
		<div>
			<input type='range' value={pos} onChange={e => setPos(parseInt(e.target.value))} />
			<canvas ref={canvasRef} />
		</div>
	)
}