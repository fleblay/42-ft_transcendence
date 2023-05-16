
import React, { useContext, useState } from 'react';
import { AppBar, Container, Typography } from '@mui/material';
import apiClient from '../auth/interceptor.axios';
import { Box } from '@mui/system';
import { useParams } from 'react-router-dom';
import { GameHistory } from './game/GameHistory';
import { UserDataContext } from '../userDataProvider/userDataProvider';
import { UserInfoDisplay } from './UserInfoDisplay';
import { UserAchivement } from './UserAchievment';
import { useAuthService } from '../auth/AuthService';
import { FriendList } from './FriendList';


export function ProfilPlayer() {
	//send a post with image
	const { idPlayer } = useParams<{ idPlayer: string }>();
	const { userData, setUserData } = useContext(UserDataContext);
	const auth = useAuthService();
	const [itsMe, setItsMe] = useState<boolean>(false);

	React.useEffect(() => {
		console.log("idPlayer", idPlayer);
		if (!auth.user) return;
		if (idPlayer !== undefined && parseInt(idPlayer) === auth.user.id)
			setItsMe(true);

	}, [auth.user, idPlayer])


	React.useEffect(() => {
		apiClient.get(`/api/users/${idPlayer}`).then((response) => {
			console.log("response", response);
			setUserData(response.data);
			console.log("userData", userData);
		}).catch((error) => {
			console.log(error);
		});
	}, [idPlayer])


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
					<AppBar position="static"
					sx={({ shape }) => ({
						borderRadius: `${shape.borderRadius}px ${shape.borderRadius}px 0 0`,
						height: '80px'
					})}>
						<Typography textAlign="center" variant="h6" sx={{ flexGrow: 1, paddingTop: '25px' }}>
							{userData?.username}
						</Typography>
					</AppBar>
					<UserInfoDisplay idPlayer={idPlayer} displayBlocked={true}/>
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
			</Container>
		</React.Fragment>
	)
}
