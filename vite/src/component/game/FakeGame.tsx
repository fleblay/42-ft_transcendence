import { useState } from "react";
import apiClient from '../../auth/interceptor.axios'
import { Button, Typography } from '@mui/material';

export function FakeGames() {
	const [info, setInfo] = useState<string>("No info yet")

	async function handleClick(number: number): Promise<void> {
		setInfo("Waiting for backend to generate fake games...")
		for (let i = 0; i < number; i++) {
			try {
				await apiClient.get("/api/game/fake")
				setInfo(`Successfully added ${number} fake games to history !`)
			} catch (e) {
				console.log(e)
				setInfo("Error. More info in console")
			}
		}
	}

	return (
		<div>
			<Typography textAlign="center">
				<Button variant='contained' onClick={()=>handleClick(1)}>
					Generate 1 fake game
				</Button>
				<Button variant='contained' onClick={()=>handleClick(10)}>
					Generate 10 fake games
				</Button>
				<Button variant='contained' onClick={()=>handleClick(100)}>
					Generate 100 fake games
				</Button>
				<Button variant='contained' onClick={()=>handleClick(1000)}>
					Generate 1000 fake games
				</Button>
				<label>{info}</label>
			</Typography>
		</div>
	)
}


