
import React, { useState, useContext } from 'react';
import { AppBar, Avatar, Button, Container, Switch, TextField, Typography } from '@mui/material';
import apiClient from '../auth/interceptor.axios';
import { Box } from '@mui/system';
import { Divider } from '@mui/material';
import { Friend } from '../types';
import { useAuthService } from '../auth/AuthService';
import { useNavigate } from 'react-router-dom';
import { SocketContext } from '../socket/SocketProvider';


export function FriendList() {
	//send a post with image
	const [friendList, setFriendList] = useState<Friend[]| null>(null);
	const auth = useAuthService();
    const navigate = useNavigate();
	const {customEmit, socket, customOn, customOff} = useContext(SocketContext);


	React.useEffect(() => {
		console.log('useEffect');
		console.log(auth.user);
		if (!auth.user) return;
		apiClient.get(`/api/users/friends/${auth.user.id}`).then((response) => {
			setFriendList(response.data);
		console.log('friendlist');
		console.log(response.data);
		});

	}, [auth.user]);
	
/* 
	React.useEffect(() => {
		console.log('yo je pas listen')
		if (!socket) return;
		console.log('yo je listen')
		customOn('page.player' , (data: any) => {
			console.log("data", data);
			if (userData)
				setUserData({ ...friendList, userConnected: data.connected });
		})
		return (() => {
			customOff('page.player');
		})
	}, [socket, friendList]); */

	const handleViewProfil = (id : number) => {
		console.log('view profil');
		navigate(`/player/${id}`);
	}

	const handleRemoveFriend = (idPlayer : number) => {
		apiClient.post(`/api/users/removeFriend/${idPlayer}`).then((response) => {
			if (!auth.user) return;
			apiClient.get(`/api/users/friends/${auth.user.id}`).then((response) => {
				setFriendList(response.data);
			console.log('friendlist');
			console.log(response.data);
			});
			console.log(response);
		}).catch((error) => {
			console.log(error);
		});
	}

	return (
		<React.Fragment>

			<Container maxWidth="md">
				<Box sx={{
					width: '100%',
					border: '1px solid #D3C6C6',
					boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)',
					borderRadius: '16px',
					bgcolor: 'background.paper',
				}}>
					<AppBar position="static" sx={{ borderTopLeftRadius: '16px', borderTopRightRadius: '16px', height: '80px' }}>
						<Typography textAlign="center" variant="h6" sx={{ flexGrow: 1, paddingTop: '25px' }}>
							Friends
						</Typography>
					</AppBar>
					<Box position="static" sx={{ height: 'auto' }}>
						{friendList?.length === 0 ? <Typography textAlign="center" variant="h6" sx={{ flexGrow: 1, p: '25px' }}> You don't have any friends yet </Typography> : null}
						{friendList?.map((friend: Friend) => {
							const imgPath = `/avatars/${friend.id}.png`

							return (
								<React.Fragment>

								<div style={{ display: 'flex', alignItems: 'center', paddingTop: '2rem', paddingBottom: '2rem', justifyContent: 'flex-start' }}>

								<Box sx={{ mr: '20px', ml: '20px' }}>
									<Avatar src={imgPath} style={{ width: '80px', height: '80px' }} />
								</Box>
								<Box sx={{
									display: 'flex',
									flexDirection: 'column',
									alignItems: 'flex-start',
								}}
								>
									<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start' }}>
	
										<Typography variant="h5" noWrap style={{ textOverflow: 'ellipsis', maxWidth: '200px'}} sx={{ flexGrow: 1, mr: '10px' }}>
											{friend?.username}
										</Typography>
										{<Avatar sx={{ bgcolor: friend.online ? 'green' : 'red' }} style={{ width: '15px', height: '15px' }}> </Avatar> }
									</div>
									{ friend && friend.status ? <Typography sx={{ flexGrow: 1, marginTop: '5px' }}>{ friend.status}</Typography> : <Typography sx={{ flexGrow: 1, marginTop: '5px' }}>{friend?.online ? "online" : "offline" }</Typography> }
								</Box>
								<Button variant="outlined" sx={{ ml: 'auto', mr: 1, mt: 2, mb: 2 }} onClick={()=>handleRemoveFriend(friend.id)} >remove friend </Button> 
								<Button variant="contained" sx={{ ml: '2', mr: 3, mt: 2, mb: 2 }} onClick={()=>handleViewProfil(friend.id)} >view profil </Button>
							</div>
							<Divider />
							</React.Fragment>
							)})}
					</Box>

				</Box>
		</Container>
		</React.Fragment>
	)
}