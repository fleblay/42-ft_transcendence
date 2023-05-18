
import React, { useState } from 'react';
import { AppBar, Avatar, Button, Container, Switch, TextField, Typography } from '@mui/material';
import apiClient from '../auth/interceptor.axios';
import { Box } from '@mui/system';
import { Divider } from '@mui/material';
import { ShortUser } from '../types';
import { useAuthService } from '../auth/AuthService';
import { useNavigate } from 'react-router-dom';

export function BlockedList() {
	//send a post with image
	const [blockedList, setBlockedList] = useState<ShortUser[] | null>(null);
	const auth = useAuthService();
	const navigate = useNavigate();

	React.useEffect(() => {
		console.log('useEffect');
		console.log(auth.user);
		if (!auth.user) return;
		apiClient.get(`/api/users/blocked`).then((response) => {
			setBlockedList(response.data);
			console.log('blockedlist');
			console.log(response.data);
		});

	}, [auth.user]);

	const handleUnblockUser = (idPlayer: number) => {
		apiClient.post(`/api/users/unblockUser/${idPlayer}`).then((response) => {
			if (!auth.user) return;
			apiClient.get(`/api/users/blocked`).then((response) => {
				setBlockedList(response.data);
				console.log('blockedlist');
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
							blockeds
						</Typography>
					</AppBar>
					<Box position="static" sx={{ height: 'auto' }}>
						{blockedList?.length === 0 ? <Typography textAlign="center" variant="h6" sx={{ flexGrow: 1, p: '25px' }}> You don't have any blockeds yet </Typography> : null}
						{blockedList?.map((blocked: ShortUser) => {
							const imgPath = `/avatars/${blocked.id}.png`

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

												<Typography variant="h5" noWrap style={{ textOverflow: 'ellipsis', maxWidth: '200px' }} sx={{ flexGrow: 1, mr: '10px' }}>
													{blocked?.username}
												</Typography>
											</div>
										</Box>
										<Button variant="outlined" color="error" sx={{ ml: 'auto', mr: 3, mt: 2, mb: 2 }} onClick={() => handleUnblockUser(blocked.id)} >unblock </Button>
									</div>
									<Divider />
								</React.Fragment>
							)
						})}
					</Box>

				</Box>
			</Container>
		</React.Fragment>
	)
}