
import React, { useState } from 'react';
import { AppBar, Avatar, Button, Container, TextField, Typography } from '@mui/material';
import apiClient from '../auth/interceptor.axios';
import { FormEvent } from 'react';

import { Box } from '@mui/system';
import { useAuthService } from '../auth/AuthService';
import { getIdByToken } from '../token/token';
import { useParams } from 'react-router-dom';


function fileToBlob(file: File) {
	const blob = new Blob([file], { type: file.type });
	return blob;
}

export function ProfilPlayer() {
	//send a post with image
	const [file, setFile] = useState<File | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [itsMe, setItsMe] = useState<boolean>(false);
	const [userData, setUserData] = useState<any>(null);
	const auth = useAuthService()
	const { idPlayer } = useParams<{ idPlayer: string }>();
	const imgPath = `/Avatars/${idPlayer}.png`


	React.useEffect(() => {
		apiClient.get(`/api/users/${idPlayer}`).then((response) => {
			setUserData(response.data);
			console.log("userData", userData);
		}).catch((error) => {
			console.log(error);
		});
	}, [idPlayer])


	React.useEffect(() => {
		console.log("idPlayer", idPlayer);
		if (!auth.user) return;
		if (idPlayer !== undefined && parseInt(idPlayer) === getIdByToken()) {
			setItsMe(true);
		}
		// need to recup url 
	}, [auth.user])



	const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		if (event.target.files) {
			setFile(event.target.files[0]);
		}
	};

	const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		if (file?.type !== 'image/png') {
			setError('Only png files are allowed');
			return;
		}
		const formData = new FormData();
		formData.append('image', fileToBlob(file as File));
		apiClient.post('/api/users/uploadAvatar', formData, {
			headers: {
				'Content-Type': 'multipart/form-data'
			}
		}).then((response) => {
			console.log(response);
		}).catch((error) => {
			console.log(error);
		});
	};


	return (
		<React.Fragment>
			{itsMe ? <form onSubmit={handleSubmit}>
				<div>	Choose profil pic</div>
				<input type="file" onChange={handleChange} />
				<Button type="submit">Submit</Button>
				<div> {error} </div>
			</form> : null}
			<Container maxWidth="md">
				<Box sx={{
					width: '100%',
					border: '1px solid #D3C6C6',
					boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)',
					borderRadius: '16px'
				}}>
					<AppBar position="static" sx={{ backgroundColor: '#1776D1', borderTopLeftRadius: '16px', borderTopRightRadius: '16px', height: '80px' } }>
						<Typography textAlign="center" variant="h6" sx={{ flexGrow: 1, paddingTop: '25px'}}>
							{userData?.username}
						</Typography>
					</AppBar>
					<Box sx={{ p: '2rem' }} >
						<Avatar src={imgPath} style={{ width: '100px', height: '100px' }} />

						<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '90px' , paddingTop: '1rem' }}>
							<Typography noWrap style={{ textOverflow: 'ellipsis', maxWidth: '75px'}} sx={{ flexGrow: 1, p: '0rem' }}>
								{userData?.username}
							</Typography>
							{userData && userData.userConnected ? <Avatar sx={{ bgcolor: 'green' }} style={{ width: '15px', height: '15px' }}> </Avatar> : <Avatar sx={{ bgcolor: 'red' }} style={{ width: '15px', height: '15px' }}> </Avatar>}
						</div>
					</Box>
				</Box>
			</Container>
		</React.Fragment>
	)
}