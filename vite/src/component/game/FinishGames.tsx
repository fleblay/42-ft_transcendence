import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { getAccessToken } from "../../token/token";
import apiClient from "../../auth/interceptor.axios";
import { Paper, Table, TableCell, TableContainer, TableHead, TableRow, TableBody, Button, Grid, Link, Divider } from "@mui/material";
import { Link as LinkRouter } from "react-router-dom";
import { UserInfo } from "../../types";
import { SocketContext } from "../../socket/SocketProvider";

import dayjs, { Dayjs } from "dayjs";
import relativeTime from 'dayjs/plugin/relativeTime'
dayjs.extend(relativeTime)

interface SaveGame {
	date: string;
	id: string;
	players: Partial<UserInfo>[];
	score: number[];
	winner: Partial<UserInfo>;
}

export function FinishGames() {

	const [listGames, setListGames] = useState<SaveGame[] | null>(null);
	const [gamePage, setGamePage] = useState(0);
	const { customOn, customOff, addSubscription } = useContext(SocketContext);

	function getData() {
		apiClient.get(`/api/game/list/${gamePage}`).then((response) => {
			setListGames(response.data)
		}).catch(() => {})
	}

	useEffect(() => {
		getData()
	}, [gamePage])

	useEffect(() => {
		return addSubscription('/leaderboard')
	}, [])

	useEffect(() => {
		function resetGamePage() {
			setGamePage(0)
			getData()
		}

		customOn('leaderboard', resetGamePage)
		return (
			() => { customOff('leaderboard', resetGamePage) }
		)
	}, [gamePage])

	if (listGames === null) return <div>Loading...</div>

	return (
		<div>
			<TableContainer>
				<Table sx={{ minWidth: 650 }} size="small" aria-label="a dense table">
					<TableHead>
						<TableRow>
							<TableCell>Game id</TableCell>
							<TableCell align="right">Players</TableCell>
							<TableCell align="right">Score</TableCell>
							<TableCell align="right">Date</TableCell>
							<TableCell align="right">Winner</TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{listGames.map((game, index) => (
							<TableRow
								key={game.id+'-'+index}
								sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
							>
								<TableCell component="th" scope="row">
									{game.id}
								</TableCell>
								<TableCell align="right">
									{
										game.players.sort((a, b) => {
											if (a.id === game.winner.id) return -1;
											if (b.id === game.winner.id) return 1;
											return 1;
										}).map((player: Partial<UserInfo>, index, players) => {
											return <React.Fragment key={player.id}>
											<Link component={LinkRouter} to={`/player/${player.id}`}>{player.username}</Link>
											{index != players.length - 1 ? " - " : ""}
											</React.Fragment>
										})
									}
								</TableCell>
								<TableCell align="right">{game.score.sort((a: number, b: number) => b - a).map((score: number) => score.toString()).join(' : ')}</TableCell>
								<TableCell align="right">{dayjs(game.date).fromNow()}</TableCell>
								<TableCell align="right">{game.winner?.username}</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</TableContainer>
			<Divider />
			<Grid container justifyContent="flex-end">
				<Button variant="outlined" onClick={() => {
					if (gamePage > 0) {
						setGamePage(gamePage - 1)
					}
				}}>Previous</Button>
				<label style={{ padding: '5px 15px' }}>{gamePage}</label>
				<Button variant="outlined" onClick={() => {
					if (listGames.length === 10) {
						setGamePage(gamePage + 1)
					}
				}}>Next</Button>
			</Grid>
		</div>
	);
}
