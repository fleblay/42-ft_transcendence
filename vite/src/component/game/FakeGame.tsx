import { useState } from "react";
import apiClient from '../../auth/interceptor.axios'
import { Button, Typography } from '@mui/material';

export function FakeGames() {
	const [info, setInfo] = useState<string>("No info yet")

	async function handleClick(): Promise<void> {
		setInfo("Waiting for backend to generate fake games...")
		for (let i = 0; i < 10; i++) {
			try {
				await apiClient.get("/api/game/fake")
				setInfo("Successfully added 10 fake games to history !")
			} catch (e) {
				console.log(e)
				setInfo("Error. More info in console")
			}
		}
	}

	return (
		<div>
			<Typography textAlign="center">
				<Button variant='contained' onClick={handleClick}>
					Generate 10 fake games
				</Button>
				<label>{info}</label>
			</Typography>
		</div>
	)
}


