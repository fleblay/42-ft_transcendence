import React, { useEffect, useState } from "react";
import apiClient from "../auth/interceptor.axios";
import { Paper, Table, TableCell, TableContainer, TableHead, TableRow, TableBody, Button, Grid, Link } from "@mui/material";
import { Link as LinkRouter } from "react-router-dom";

type User = {
	id: number;
	username: string;
}
interface SaveGame {
	date: string;
	id: string;
	players: User[];
	score: number[];
	winner: User;
}

import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';

function formattedDate(date: string) {
    const d = new Date(date);
    return d.toLocaleDateString() + " " + d.toLocaleTimeString();
}

export function GameHistory( { idPlayer }: { idPlayer: string | undefined }) {

	const [listGames, setListGames] = useState<SaveGame[] | null>(null);

	useEffect(() => {
        if (idPlayer === undefined) return;
        let id = parseInt(idPlayer) as number;
		apiClient.get(`/api/game/history/${id}`).then((response) => {
			console.log(response.data);
			setListGames(response.data)
		})
	}, [])

	if (listGames === null) return (
        <div style={{ display: 'flex', alignItems: 'center', paddingTop: '2rem', paddingBottom: '2rem', justifyContent: 'flex-start' }}>

        <Box sx={{ display: 'flex' }}>
          <CircularProgress />
        </Box>
        </div>
      );

	return (
		<div>

			<TableContainer component={Paper}>
				<Table sx={{ minWidth: 650 }} size="small" aria-label="a dense table">
					<TableHead>
						<TableRow>
							<TableCell align="left">Players</TableCell>
							<TableCell align="right">Score</TableCell>
							<TableCell align="right">Date</TableCell>
							<TableCell align="right">Winner</TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{listGames.map((game) => (
							<TableRow
								key={game.id}
								sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
							>
								<TableCell component="th" scope="row">
									{
										game.players.map((player: User) => {
											return <Link key={player.id} component={LinkRouter} to={`/player/${player.id}`}>{player.username} </Link>
										})
									}
								</TableCell>
								<TableCell align="right">{game.score.sort((a: number, b: number) => b - a).map((score: number) => score.toString()).join(' ')}</TableCell>
								<TableCell align="right">{formattedDate(game.date)}</TableCell>
								<TableCell align="right"> 
                                <Link key={game.players[0].id} component={LinkRouter} to={`/player/${game.players[0].id}`}>{game.players[0].username} </Link>
                                </TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</TableContainer>
		</div>
	);
}
