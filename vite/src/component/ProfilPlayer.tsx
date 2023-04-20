
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
import { Input } from '@mui/material';
import { UsernameDialog } from './UsernameDialog';


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
	const [fileName, setFileName] = useState<string>('');
	const [responseFile, setResponseFile] = useState<string>('');
	const auth = useAuthService()
	const { idPlayer } = useParams<{ idPlayer: string }>();
	const imgPath = `/avatars/${idPlayer}.png`

	const [openUsername, setOpenUsername] = useState<boolean>(false);

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
			const file = event.target.files[0] as File;
			if (file) {
				setFile(file);
				if (file.name.length > 20)
					setFileName(file.name.substring(0, 20) + "...");
				else
					setFileName(file.name);

			}
		}
	};

	const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		if (file?.type !== 'image/png') {
			setResponseFile('Only png files are allowed');
			return;
		}
		if (file?.size > 1000000) {
			setResponseFile('File size must be less than 1MB');
			return;
		}
		const formData = new FormData();
		console.log(file);
		formData.append('image', fileToBlob(file as File));
		apiClient.post('/api/users/uploadAvatar', formData, {
			headers: {
				'Content-Type': 'multipart/form-data'
			}
		}).then((response) => {
			setResponseFile("Image uploaded successfully");
			console.log(response);
		}).catch((error) => {
			setResponseFile("Error while uploading image");
			console.log(error);
		});
	};

	const handleOpenImg = () => setOpenImg(true);
	const handleCloseImg = () => setOpenImg(false);

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

							{itsMe ? (
								<>
									<Button
										variant="contained" sx={{ ml: 'auto', mt: 2, mb: 2 }}
										onClick={() => setOpenUsername(true)}
									>
										Change username
									</Button>
									<Button
										variant="contained" sx={{ ml: 1, mr: 1, mt: 2, mb: 2 }} onClick={handleOpenImg}
									>
										Edit profil picture
									</Button>
									<Modal open={openImg} onClose={handleCloseImg} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
										<Container maxWidth="sm" className="centered-container" >
											<Box sx={{
												width: '100%',
												border: '1px solid #D3C6C6',
												boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)',
												borderRadius: '16px',
												display: 'flex',
												flexDirection: 'column',
												alignItems: 'center',
											}}
												style={{
													backgroundColor: '#f0f0f0'
												}}>
												<form onSubmit={handleSubmit}>
													<Typography textAlign="center" variant="h6" sx={{ flexGrow: 1, p: '2rem' }} > Update avatar</Typography>
													<Divider />
													<Button variant="contained" component="label" sx={{ flexGrow: 1, mt: '10px', width: '100%', height: '30px' }} >       {fileName ? fileName : '+ Upload file'} <input type="file" hidden onChange={handleChange} /> </Button>
													<Button variant="outlined" type="submit" sx={{ flexGrow: 1, mt: '10px', width: '100%', height: '30px' }}>Submit</Button>
													<Divider />
													<div> {responseFile} </div>
												</form>
												<Button onClick={handleCloseImg}>Fermer</Button>
											</Box>
										</Container>
									</Modal>
									<FormGroup>
										<FormControlLabel control={<Switch defaultChecked />} label="Active 2fA" />
									</FormGroup>
								</>
							) : (
								<>
									<Button variant="contained" sx={{ ml: 'auto', mr: 1, mt: 2, mb: 2 }} >add a friend </Button>
									<Button variant="outlined" color="error" sx={{ ml: '1', mr: 3, mt: 2, mb: 2 }}>block</Button>
								</>
							)}

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
									Ratio : {userData?.totalplayedGame ? (userData?.totalwonGames / userData?.totalplayedGames).toFixed(2) : 0}
								</Typography>
							</div>
						</div>
					</Box>
					<Divider />
					<Box position="static" sx={{ height: 'auto' ,display: 'flex',
												flexDirection: 'column',
												alignItems: 'center',
												mb:'30px'}}>
						<Typography textAlign="center" variant="h6" sx={{ flexGrow: 1, p: '1rem' }} > Match History</Typography>

							<GameHistory idPlayer={idPlayer} />
					</Box>
				</Box>
			</Container>
		</React.Fragment>
	)
}