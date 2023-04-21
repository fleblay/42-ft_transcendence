
import React, { useState } from 'react';
import { AppBar, Avatar, Button, Container, Switch, TextField, Typography } from '@mui/material';
import apiClient from '../auth/interceptor.axios';
import { FormEvent } from 'react';

import { Box } from '@mui/system';
import { Divider } from '@mui/material';
import { Friend } from '../types';
import { useEffect } from 'react';
import { useAuthService } from '../auth/AuthService';
import { useNavigate } from 'react-router-dom';






export function FriendList() {
	//send a post with image
	const [friendList, setFriendList] = useState<Friend[]| null>(null);
	const auth = useAuthService();
    const navigate = useNavigate();



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

	const handleViewProfil = (id : number) => {
		console.log('view profil');
		navigate(`/profil/${id}`);
	}

	return (
		<React.Fragment>

			<Container maxWidth="md">
				<Box sx={{
					width: '100%',
					border: '1px solid #D3C6C6',
					boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)',
					borderRadius: '16px'
				}}>
					<AppBar position="static" sx={{ backgroundColor: '#1776D1', borderTopLeftRadius: '16px', borderTopRightRadius: '16px', height: '80px' }}>
						<Typography textAlign="center" variant="h6" sx={{ flexGrow: 1, paddingTop: '25px' }}>
							Friends
						</Typography>
					</AppBar>
					<Box position="static" sx={{ height: 'auto' }}>
						{friendList?.map((friend: Friend) => {
							const imgPath = `/avatars/${friend.id}.png`

							return (

						<div style={{ display: 'flex', alignItems: 'center', paddingTop: '2rem', paddingBottom: '2rem', justifyContent: 'flex-start' }}>

							<Box sx={{ mr: '20px', ml: '20px' }}>
								<Avatar src={imgPath} style={{ width: '50px', height: '50px' }} />
							</Box>
							<Box sx={{
								display: 'flex',
								flexDirection: 'column',
								alignItems: 'center',
							}}
							>
								<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start' }}>

									<Typography variant="h5" noWrap style={{ textOverflow: 'ellipsis', maxWidth: '200px', marginLeft: '10px' }} sx={{ flexGrow: 1, ml: '20px', mr: '20px' }}>
										{friend.username}
									</Typography>
									{<Avatar sx={{ bgcolor: friend && friend.online ? 'green' : 'red' }} style={{ width: '15px', height: '15px' }}> </Avatar> }
								</div>
								<Typography variant="h6" noWrap style={{ textOverflow: 'ellipsis', maxWidth: '200px' }} sx={{ flexGrow: 1, p: '2rem' }}>{friend.status} </Typography>
							</Box>

							<Button variant="outlined" sx={{ ml: '1', mr: 3, mt: 2, mb: 2 }}>view profil</Button>

						</div>)})}
					</Box>

				</Box>
		</Container>
		</React.Fragment>
	)
}