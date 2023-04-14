import React, { useEffect, useState } from "react";
import axios from "axios";
import { getAccessToken } from "../token/token";
import apiClient from "../auth/interceptor.axios";

interface FormData {
	username: string;
	email: string;
	password: string;
}

export function FinishGames() {

	const [listGames, setListGames] = useState<any>(null);
	const [gamePage, setGamePage] = useState(0);

	useEffect(() => {
		apiClient.get(`/api/game/list/${gamePage}`).then((response) => {
			console.log(response.data);
			setListGames(response.data)
		})
	}, [gamePage])

	if (listGames === null) return <div>Loading...</div>

	return (
		<div>
			<table>
				<thead>
					<tr>
						<th>id</th>
						<th>players</th>
						<th>score</th>
						<th>date</th>
						<th>winner</th>
					</tr>
				</thead>
				<tbody>
					{listGames?.map((game: any) => {
						return (
							<tr key={game.id}>
								<td>{game.id}</td>
								<td>{game.players[0].username} {game.players[1].username}</td>
								<td>{game.score}</td>
								<td>{game.date}</td>
								<td>{game.winner.username}</td>
							</tr>
						)
					})}
				</tbody>
			</table>
			<button onClick={() => {
				if (gamePage > 0) {
					setGamePage(gamePage - 1)
				}
			}}>Previous</button>
			<label>{gamePage}</label>
			<button onClick={() => {
				if (listGames.length === 10) {
					setGamePage(gamePage + 1)
				}
			}}>Next</button>
		</div>
	);
}
