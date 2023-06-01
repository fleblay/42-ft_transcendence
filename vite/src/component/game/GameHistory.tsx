import React, { useEffect, useState } from "react";
import apiClient from "../../auth/interceptor.axios";
import { Paper, Table, TableCell, TableContainer, TableHead, TableRow, TableBody, Button, Grid, Link } from "@mui/material";
import { Link as LinkRouter } from "react-router-dom";
import { TablePagination } from "@mui/material";

import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import { UserInfo } from "../../types";

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


function formattedDate(date: string) {
    const d = new Date(date);
    return d.toLocaleDateString() + " " + d.toLocaleTimeString();
}

export function GameHistory( { idPlayer }: { idPlayer: string | undefined }) {

	const [listGames, setListGames] = useState<SaveGame[] | null>(null);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const rows = listGames?.map((game) => {
        return {
			id: game.id,
            players: game.players,
            score: game.score.sort((a: number, b: number) => b - a).join(' : '),
            date: formattedDate(game.date),
            winner: game.winner,
        }
    });



    const handleChangePage = (event : any , newPage : number) => {
        setPage(newPage);
      };

    const handleChangeRowsPerPage = (event: any) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
      };



	useEffect(() => {
        if (idPlayer === undefined) return;
        let id = parseInt(idPlayer) as number;
		apiClient.get(`/api/game/history/${id}`).then((response) => {
			setListGames(response.data)
		}).catch(() => {})
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
                    {rows?.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => (
							<TableRow
								key={row.id}
								sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
							>
								<TableCell component="th" scope="row">
									{
										row.players.map((player: Partial<UserInfo>, index) => {
											return <React.Fragment key={player.id} >
											<Link component={LinkRouter} to={`/player/${player.id}`}>{player.username}</Link>
											{index != row.players.length - 1 ? " - " : ""}
											</React.Fragment>
										})
									}
								</TableCell>
								<TableCell align="right">{row.score}</TableCell>
								<TableCell align="right">{dayjs(row.date).fromNow()}</TableCell>
								<TableCell align="right">{row.winner.username}</TableCell>
							</TableRow>
                        )
                        )}
					</TableBody>
				</Table>
                <TablePagination
        rowsPerPageOptions={[10, 25, 50]}
        component="div"
        count={rows?.length || 0}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </TableContainer>
		</div>
	);
}
