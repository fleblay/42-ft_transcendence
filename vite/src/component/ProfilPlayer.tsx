
import React, { useState } from 'react';
import { AppBar, Avatar, Button, Container, Switch, TextField, Typography } from '@mui/material';
import apiClient from '../auth/interceptor.axios';
import { FormEvent } from 'react';

import { Box } from '@mui/system';
import { useAuthService } from '../auth/AuthService';
import { getIdByToken } from '../token/token';
import { useParams } from 'react-router-dom';
import { Divider } from '@mui/material';
import EmojiEventsOutlinedIcon from '@mui/icons-material/EmojiEventsOutlined';
import ThumbDownAltOutlinedIcon from '@mui/icons-material/ThumbDownAltOutlined';
import MilitaryTechOutlinedIcon from '@mui/icons-material/MilitaryTechOutlined';
import AutoAwesomeOutlinedIcon from '@mui/icons-material/AutoAwesomeOutlined';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import { GameHistory } from './GameHistory';
import { Modal } from '@mui/material';


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
	const [openImg, setOpenImg] = useState<boolean>(false);
	const auth = useAuthService()
	const { idPlayer } = useParams<{ idPlayer: string }>();
	const imgPath = `/avatars/${idPlayer}.png`


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
		else
			setItsMe(false);
		// need to recup url
	}, [auth.user, idPlayer])



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
					<AppBar position="static" sx={{ backgroundColor: '#1776D1', borderTopLeftRadius: '16px', borderTopRightRadius: '16px', height: '80px' }}>
						<Typography textAlign="center" variant="h6" sx={{ flexGrow: 1, paddingTop: '25px' }}>
							{userData?.username}
						</Typography>
					</AppBar>
					<Box position="static" sx={{ height: 'auto' }}>
						<div style={{ display: 'flex', alignItems: 'center', paddingTop: '2rem', paddingBottom: '2rem', justifyContent: 'flex-start' }}>

							<Box sx={{ mr: '20px', ml: '20px' }}>
								<Avatar src={imgPath} style={{ width: '80px', height: '80px' }} />
							</Box>
							<Box sx={{
								display: 'flex',
								flexDirection: 'column',
								alignItems: 'center',
							}}
							>
								<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start' }}>

									<Typography variant="h5" noWrap style={{ textOverflow: 'ellipsis', maxWidth: '200px', marginLeft: '10px' }} sx={{ flexGrow: 1, ml: '20px', mr: '20px' }}>
										{userData?.username}
									</Typography>
									{userData && userData.userConnected ? <Avatar sx={{ bgcolor: 'green' }} style={{ width: '15px', height: '15px' }}> </Avatar> : <Avatar sx={{ bgcolor: 'red' }} style={{ width: '15px', height: '15px' }}> </Avatar>}
								</div>
								{userData && userData.status.lenght > 0 ? <Typography variant="h6" noWrap style={{ textOverflow: 'ellipsis', maxWidth: '200px' }} sx={{ flexGrow: 1, p: '2rem' }}>status </Typography> : null}
							</Box>
							{!itsMe ? <Button variant="contained" sx={{ ml: 'auto', mr: 1, mt: 3, mb: 2 }} > add a friend </Button> : <Button variant="contained" sx={{ ml: 'auto', mr: 1, mt: 3, mb: 2 }} > edit profil picture </Button>}
							{!itsMe ? <Button variant="outlined" color="error" sx={{ ml: '1', mr: 3, mt: 3, mb: 2 }} > block</Button> :  <FormGroup>
							<FormControlLabel control={<Switch defaultChecked />} label="Active 2fA" />
						  	</FormGroup>}


						</div>
					</Box>
					<Divider />
					<Box position="static" sx={{ height: 'auto' }}>
						<div style={{ display: 'flex', alignItems: 'center', paddingTop: '2rem', paddingBottom: '2rem' }}>
							<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start' }}>
								<MilitaryTechOutlinedIcon sx={{ ml: 2 }} />
								<Typography variant="h6" noWrap style={{ textOverflow: 'ellipsis', maxWidth: '200px' }} sx={{ flexGrow: 1, ml: '10px', mr: '20px' }}>
									Rank : {userData?.totalwonGames}
								</Typography>
							</div>
							<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start' }}>
								<EmojiEventsOutlinedIcon sx={{ ml: 2 }} />
								<Typography variant="h6" noWrap style={{ textOverflow: 'ellipsis', maxWidth: '200px' }} sx={{ flexGrow: 1, ml: '10px', mr: '20px' }}>
									Win : {userData?.totalwonGames}
								</Typography>
							</div>
							<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start' }}>
								<ThumbDownAltOutlinedIcon sx={{ ml: 2 }} />
								<Typography variant="h6" noWrap style={{ textOverflow: 'ellipsis', maxWidth: '200px' }} sx={{ flexGrow: 1, ml: '10px', mr: '20px' }}>
									Loose : {userData?.totalplayedGames - userData?.totalwonGames}
								</Typography>
							</div>

							<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start' }}>
								<AutoAwesomeOutlinedIcon sx={{ ml: 2 }} />
								<Typography variant="h6" noWrap style={{ textOverflow: 'ellipsis', maxWidth: '200px' }} sx={{ flexGrow: 1, ml: '10px', mr: '20px' }}>
									Ratio : { userData?.totalplayedGame ? (userData?.totalwonGames / userData?.totalplayedGames).toFixed(2) : 0}
								</Typography>
							</div>
						</div>
					</Box>
					<Box position="static" sx={{ height: 'auto' }}>
						<Typography> Match history</Typography>
						<Divider />
						<GameHistory idPlayer={idPlayer}/>
					</Box>
				</Box>
			</Container>
		</React.Fragment>
	)
}