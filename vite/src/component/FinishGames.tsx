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
	const [gamePage, setGamePage] = useState(1);

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
							<tr>
								<td>{game.id}</td>
								<td>{game.players}</td>
								<td>{game.score}</td>
								<td>{game.date}</td>
								<td>{game.winner}</td>
							</tr>
						)
					})}
				</tbody>
			</table>
			<button onClick={() => setGamePage(gamePage - 1)}>Previous</button>
			<label>{gamePage}</label>
			<button onClick={() => setGamePage(gamePage + 1)}>Next</button>
		</div>
	);
}