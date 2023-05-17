import { useState, useEffect, useContext, useRef, MutableRefObject } from "react";
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
import { AppBar, Avatar, Box, Button, Container, Divider, Link, Typography } from '@mui/material';
import { UserInfo } from "../types";
import { FinishGames } from "./game/FinishGames";
import { SocketContext } from "../socket/SocketProvider";

export function Leaderboard() {

	const [muiTable, setMuiTable] = useState<JSX.Element>(<div>Loading...</div>)
	const { customOn, customOff, addSubscription } = useContext(SocketContext);
	const userListFetched: MutableRefObject<boolean> = useRef(false)
	const userList: MutableRefObject<UserInfo[] | null> = useRef(null)
	const unSubscribeFxArray: MutableRefObject<((() => void) | void)[]> = useRef([])

	function handleNewPlayer({userId} : {userId: number}){
			unSubscribeFxArray.current.push(addSubscription(`/player/${userId}`))
			handleClick()
		}

	useEffect(() => {
		handleClick()
	}, [])

	useEffect(() => {
		return addSubscription('/user')
	}, [])

	useEffect(() => {
		return addSubscription('/leaderboard')
	}, [])

	useEffect(() => {
		if (!userList.current || !userListFetched.current)
			return
		customOn('leaderboard', handleClick)
		customOn('page.player', handleClick)
		customOn('user.new', handleNewPlayer)
		customOn('user.modify', handleClick)
		userList.current.forEach((user) => {
			unSubscribeFxArray.current.push(addSubscription(`/player/${user.id}`))
		})
		return (
			() => {
				customOff('leaderboard', handleClick)
				customOff('page.player', handleClick)
				customOff('user.new', handleNewPlayer)
				customOff('user.modify', handleClick)
				unSubscribeFxArray.current.forEach(fx => {
					if (typeof fx === "function")
						fx()
				})
			}
		)
	}, [userListFetched.current])

	function handleClick(): void {
		apiClient
			.get("/api/users/all")
			.then(({ data }) => {
				userList.current = data
				userListFetched.current = true
				//Mui elements
				setMuiTable(
					<Container maxWidth="lg" >
						<AppBar position="static" sx={{ borderTopLeftRadius: theme => theme.shape.borderRadius, borderTopRightRadius: theme => theme.shape.borderRadius, height: '80px' }}>
							<Typography textAlign="center" variant="h6" sx={{ flexGrow: 1, paddingTop: '25px' }}>
								Leaderboard
							</Typography>
						</AppBar>
						<TableContainer component={Paper} sx={{ borderTopLeftRadius: 0, borderTopRightRadius: 0 }}>
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
									{userList.current && userList.current.map((elem: UserInfo) => (
										<TableRow
											key={elem.username}
											sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
										>
											<TableCell component="th" scope="row">#{(elem.rank != -1 )? elem.rank : ""}</TableCell>
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
						</TableContainer>
						<Paper>
							<FinishGames />
						</Paper>
					</Container>
				)
			})
			.catch((error) => {
				console.log(error)
			})
	}

	return (
		<div>
			{muiTable}
		</div>
	);
}
