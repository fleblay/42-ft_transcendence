import { useState} from "react";
import apiClient from '../auth/interceptor.axios'

export function FakeGames() {
	const [info, setInfo] = useState<string>("No info yet")

	async function handleClick2() : Promise<void> {
		setInfo("Waiting for backend to generate fake games...")
		let fakeArray = []
		for(let i = 0; i < 10; i++) {
			fakeArray.push(
			apiClient.get("/api/game/fake")
			)
		}
		try {
		await Promise.all(fakeArray)
		setInfo("Successfully added 10 fake games to history !")
		} catch (e) {
			console.log(e)
			setInfo("Error. More info in console")
		}
	}
	return (
	<div>
		<button onClick={handleClick2}>Generate Fake Game Info * 10</button>
		<p>{info}</p>
	</div>
	)
}


