import React, { useEffect, useState } from "react";
import axios from "axios";
import { getAccessToken } from "../token/token";
import apiClient from "../auth/interceptor.axios";
import { Paper, Table, TableCell, TableContainer, TableHead, TableRow, TableBody, Button, Grid, Link } from "@mui/material";
import { Link as LinkRouter } from "react-router-dom";

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

			<TableContainer component={Paper}>
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
						{listGames.map((game: any) => (
							<TableRow
								key={game.id}
								sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
							>
								<TableCell component="th" scope="row">
									{game.id}
								</TableCell>
								<TableCell align="right">
									<Link component={LinkRouter} to={`/profile/${game.players[0].id}`}>{game.players[0].username}</Link>
									{' | '}
									<Link component={LinkRouter} to={`/profile/${game.players[1].id}`}>{game.players[1].username}</Link>
								</TableCell>
								<TableCell align="right">{game.score.join(' ')}</TableCell>
								<TableCell align="right">{game.date}</TableCell>
								<TableCell align="right">{game.winner.username}</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</TableContainer>

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
