import { useState } from "react";
import apiClient from '../auth/interceptor.axios'

type Games = {
	date: string,
	id: string,
	score: number[]
}

type User = {
	id: number,
	username: string,
	email: string,
	password?: string, // To be removed in DTO in back
	avatar: string,
	savedGames: Games[],
	wonGames: Games[],

	states: string[],
	gameIds: string[],

	points: number,
	totalwonGames: number,
	totalplayedGames: number,

	userConnected: boolean,
}

export function ListUsers() {

	const [info, setInfo] = useState<string>("No info yet...")
	const [userList, setUserList] = useState<JSX.Element[]>([])

	function handleClick(): void {
		apiClient
			.get("/api/users/all")
			.then(({ data }) => {
				console.log("response from all: ", data)
				setInfo("Successfully retrieved infos :")
				setUserList(data.map((elem: User) => {
					return (
						<li>{elem.id}
							<ul style={{ listStyleType: "none" }}>
								<li>{elem.username}</li>
								<li>{elem.email}</li>
								<li>Total score : {elem.points}</li>
								<li>{(elem.states.join('-') == "" ? "No status" : elem.states.join('-'))}</li>
								<li>{(elem.gameIds.join('-') == "" ? "No game" : elem.gameIds.join('-'))}</li>
								<li>{(elem.userConnected) ? "En ligne" : "Offline"}</li>
							</ul>
						</li>
					)
				}))
			})
			.catch((error) => {
				console.log(error)
				if (error?.response?.status === 502)
					setInfo("Backend not ready yet. Try again in a few seconds")
				else
					setInfo("Error")
			})
	}

	return (
		<div>
			<button onClick={handleClick}>Update Users list</button>
			<p>{info}</p>
			<ul style={{ listStyleType: "none" }}>
				{...userList}
			</ul>
		</div>
	);
}
