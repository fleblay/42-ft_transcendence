
import React, { useContext, useEffect, useState } from 'react';
import { Button, Container, Switch, Typography } from '@mui/material';
import apiClient from '../auth/interceptor.axios';
import { FormEvent } from 'react';

import { Box } from '@mui/system';

import { Divider } from '@mui/material';

import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import { Modal } from '@mui/material';


import { UsernameDialog } from './UsernameDialog';
import { UserDataProvider, UserDataContext } from '../userDataProvider/userDataProvider';
import { SocialDistanceTwoTone } from '@mui/icons-material';
import { SocketContext } from '../socket/SocketProvider';

function fileToBlob(file: File) {
	const blob = new Blob([file], { type: file.type });
	return blob;
}

export function UpdateProfil()
{
	const [file, setFile] = useState<File | null>(null);
    const [fileName, setFileName] = useState<string>('');
    const [openImg, setOpenImg] = useState<boolean>(false);
	const [openUsername, setOpenUsername] = useState<boolean>(false);
    const [dfa, setDfa] = useState<boolean>(false);
    const { userData , setUserData } = useContext(UserDataContext);
    const [responseFile, setResponseFile] = useState<string>('');
    const socket = useContext(SocketContext);

    useEffect(() => {
        if (userData?.dfa !== undefined)
            setDfa(userData?.dfa as boolean);
    }, [userData?.dfa]);
    


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


    const handle2FaChange = () => {
		setDfa(!dfa);
		apiClient.post(`/api/users/toggle2fa`).then((response) => {
			console.log(response);
		}).catch((error) => {
			console.log(error);
		});
	}

    return ( 
        <React.Fragment>
            				<UsernameDialog open={openUsername} quit={() => setOpenUsername(false)} />

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
                                        <Button onClick={handleCloseImg}>Close</Button>
                                    </Box>
                                </Container>
                            </Modal>
                            <FormGroup>
                                <FormControlLabel control={<Switch checked={dfa} onChange={handle2FaChange} />} label="Active 2fA" />
                            </FormGroup>
                            
        </React.Fragment>
    )   
}