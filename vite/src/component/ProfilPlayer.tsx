
import React, { useContext, useState } from 'react';
import { AppBar, Container, Typography } from '@mui/material';
import apiClient from '../auth/interceptor.axios';
import { Box } from '@mui/system';
import { useParams } from 'react-router-dom';
import { GameHistory } from './GameHistory';
import { SocketContext } from '../socket/SocketProvider';
import { UserDataContext } from '../userDataProvider/userDataProvider';
import { UserInfoDisplay } from './UserInfoDisplay';
import { UserAchivement } from './UserAchievment';
import { useAuthService } from '../auth/AuthService';
import { Blocked, Friend } from '../types';
import { FriendList } from './FriendList';


export function ProfilPlayer() {
	//send a post with image
	const { idPlayer } = useParams<{ idPlayer: string }>();
	const { customEmit, socket, customOn, customOff } = useContext(SocketContext);
	const { userData, setUserData } = useContext(UserDataContext);
	const auth = useAuthService();
	const [relation, setRelation] = useState<Friend | null>(null);
	const [itsMe, setItsMe] = useState<boolean>(false);
	const [isBlocked, setIsBlocked] = useState<boolean>(false);


	React.useEffect(() => {
		console.log("idPlayer", idPlayer);
		if (!auth.user) return;
		if (idPlayer !== undefined && parseInt(idPlayer) === auth.user.id) {
			setItsMe(true);
		}
		else {
			setItsMe(false);
			if (idPlayer !== undefined) {
				apiClient.get(`/api/users/friends/${idPlayer}`).then((response) => {
					console.log("response friend:", response.data);
					setRelation(response.data);
				}).catch((error) => {
					console.log(error);

				});
				apiClient.get(`/api/users/blocked/${auth.user.id}`).then((response) => {
					const blockList = response.data as Blocked[];
					setIsBlocked(blockList.find((ban) => ban.id === parseInt(idPlayer)) !== undefined);
				}).catch((error) => {
					console.log(error);
				}
				);

			}

		}

	}, [auth.user, idPlayer, userData])



	React.useEffect(() => {
		apiClient.get(`/api/users/${idPlayer}`).then((response) => {
			console.log("response", response);
			setUserData(response.data);
			console.log("userData", userData);
		}).catch((error) => {
			console.log(error);
		});
	}, [idPlayer])

	React.useEffect(() => {
		if (!socket) return;
		customOn('page.player', (data: any) => {
			console.log("data", data);
			if (userData)
				setUserData({ ...userData, ...data });
		})
		return (() => {
			customOff('page.player');
		})
	}, [socket, userData]);


	if (!userData) return (<div>Loading data</div>);

	return (
		<React.Fragment>
			<Container maxWidth="md" >
				<Box sx={{
					width: '100%',
					border: '1px solid #D3C6C6',
					boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)',
					borderRadius: '16px',
					bgcolor: 'background.paper',
				}}>
					<AppBar position="static" sx={{ borderTopLeftRadius: '16px', borderTopRightRadius: '16px', height: '80px' }}>
						<Typography textAlign="center" variant="h6" sx={{ flexGrow: 1, paddingTop: '25px' }}>
							{userData?.username}
						</Typography>
					</AppBar>
					<UserInfoDisplay idPlayer={idPlayer} relation={relation} setRelation={setRelation} itsme={itsMe} />
					<UserAchivement />

					<Box position="static" sx={{
						height: 'auto', display: 'flex',
						flexDirection: 'column',
						alignItems: 'center',
						mb: '30px'
					}}>
						<Typography textAlign="center" variant="h6" sx={{ flexGrow: 1, p: '1rem' }} > Match History</Typography>

						<GameHistory idPlayer={idPlayer} />
					</Box>
				</Box>
				{itsMe && <FriendList />}
			</Container>
		</React.Fragment>
	)
}