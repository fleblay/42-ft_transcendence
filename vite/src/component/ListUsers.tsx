import { useState, useEffect } from "react";
import apiClient from '../auth/interceptor.axios'
import { Link as LinkRouter } from "react-router-dom";

//Mui
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { AppBar, Avatar, Box, Button, Container, Link, Typography } from '@mui/material';
import { UserInfo } from "../types";

export function ListUsers() {

	const [info, setInfo] = useState<string>("")
	const [muiTable, setMuiTable] = useState<JSX.Element>(<div>Loading...</div>)

	useEffect(() => {
		setTimeout(handleClick, 50)
		const refreshTimer = setInterval(handleClick, 1000)
		return (
			() => clearInterval(refreshTimer)
		)
	}, [])

	function handleClick(verbose: boolean = false): void {
		verbose && setInfo("Waiting for backend to send User Database...")
		apiClient
			.get("/api/users/all")
			.then(({ data }) => {
				let rank = 1
				console.log("response from all: ", data)
				verbose && setInfo("Successfully retrieved infos !")
				//Mui elements
				setMuiTable(
					<Container maxWidth="lg" >
							<AppBar position="static" sx={{ borderTopLeftRadius: '16px', borderTopRightRadius: '16px', height: '80px' }}>
								<Typography textAlign="center" variant="h6" sx={{ flexGrow: 1, paddingTop: '25px' }}>
									Leaderboard
								</Typography>
							</AppBar>
							<TableContainer component={Paper}>
								<Table sx={{ minWidth: 650 }} aria-label="simple table">
									<TableHead>
										<TableRow>
											<TableCell>Rank</TableCell>
											<TableCell align="right">Username</TableCell>
											<TableCell align="right">Points</TableCell>
											<TableCell align="right">Win/Lose Ratio</TableCell>
											<TableCell align="right">Won Games</TableCell>
											<TableCell align="right">Played Games</TableCell>
											<TableCell align="right">UserId</TableCell>
											<TableCell align="right">Student?</TableCell>
											<TableCell align="right">Online?</TableCell>
											<TableCell align="right">Game Status</TableCell>
											<TableCell align="right">GameId</TableCell>
										</TableRow>
									</TableHead>
									<TableBody>
										{data.map((elem: UserInfo) => (
											<TableRow
												key={elem.username}
												sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
											>
												<TableCell component="th" scope="row">#{rank++}</TableCell>
												<TableCell align="right">
													<Link key={elem.id} component={LinkRouter} to={`/player/${elem.id}`}>{elem.username}</Link>
												</TableCell>
												<TableCell align="right">{elem.points}</TableCell>
												<TableCell align="right">{elem.totalplayedGames ? (elem.totalwonGames / elem.totalplayedGames).toPrecision(2) : 0}</TableCell>
												<TableCell align="right">{elem.totalwonGames}</TableCell>
												<TableCell align="right">{elem.totalplayedGames}</TableCell>
												<TableCell align="right">{elem.id}</TableCell>
												<TableCell align="right">{elem.stud ? "Yes" : "No"}</TableCell>
												<TableCell align="right">
													<Avatar sx={{ bgcolor: elem.userConnected ? 'green' : 'red' }} style={{ width: '15px', height: '15px' }}> </Avatar>
												</TableCell>
												<TableCell align="right">{(elem.states.join('-') == "") ? "none" : elem.states.join('-')}</TableCell>
												<TableCell align="right">{(elem.gameIds.join('-') == "") ? "---" : elem.gameIds.join('-')}</TableCell>
											</TableRow>
										))}
									</TableBody>
								</Table>
								<Typography textAlign="center">
									<Button sx = {{ margin: '10px' }}variant='contained' onClick={() => handleClick(true)}>
										Manually Update Users list
									</Button>
								</Typography>
							</TableContainer>
					</Container>
				)
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
			{muiTable}
			<Typography textAlign="center">
			<p>{info}</p>
			</Typography>
		</div>
	);
}
