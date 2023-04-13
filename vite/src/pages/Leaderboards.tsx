import { FC, useEffect, useState } from "react";
import apiClient from "../auth/interceptor.axios";


interface LeaderboardProps {

}

interface UserScore {
	username: string;
	score: number;
}


const Leaderboard: FC<LeaderboardProps> = () => {
	const [leaderboard, setLeaderboard] = useState<UserScore[] | null>(null);

	useEffect(() => {
		apiClient.get('/api/game/leaderboard').then((response) => {
			setLeaderboard(response.data);
		})
	}, [])

	if (leaderboard === null) return <div>Loading...</div>

	return (
		<div>
			<h1>Leaderboard</h1>
			<table>
				<thead>
					<tr>
						<th>Username</th>
						<th>Score</th>
					</tr>
				</thead>
				<tbody>
					{leaderboard.map((user) => {
						return (
							<tr>
								<td>{user.username}</td>
								<td>{user.score}</td>
							</tr>
						)
					})}
				</tbody>
			</table>
		</div>
	);
}

export default Leaderboard;