
import React, { useContext } from 'react';
import { Avatar, Button, Typography } from '@mui/material';


import { Box } from '@mui/system';
import { Divider } from '@mui/material';

import {  UserDataContext } from '../userDataProvider/userDataProvider';
import { UpdateProfil } from './UpdateProfil';
import apiClient from '../auth/interceptor.axios';
import { Friend, } from '../types';
import { SocketContext } from '../socket/SocketProvider';

interface UserInfoDisplayProps {
	idPlayer: string | undefined;
	relation: Friend | null;
	setRelation: (relation: Friend | null) => void;
	itsme: boolean;
}

export function UserInfoDisplay({ idPlayer, relation, setRelation, itsme }: UserInfoDisplayProps) {

    const { userData, setUserData } = useContext(UserDataContext);
    const imgPath = `/avatars/${idPlayer}.png`;
	const isBlocked = false;
	const { customEmit, socket, customOn, customOff } = useContext(SocketContext);

 

    const handleAddFriend = () => {
		apiClient.post(`/api/users/addFriend/${idPlayer}`).then((response) => {
			console.log("reponseAddFriend",response.data);
			if (response.data) {
				setRelation(response.data);
			}
		}).catch((error) => {
			console.log(error);
		});
	}

	const handleAcceptFriend = () => {
		apiClient.post(`/api/users/acceptFriend/${idPlayer}`).then((response) => {
			console.log("reponseAcceptFriend",response.data);
			if (response.data) {
				setRelation(response.data);
			}
				}).catch((error) => {
			console.log(error);
		});
	}

	const handleRemoveFriend = () => {
		apiClient.post(`/api/users/removeFriend/${idPlayer}`).then((response) => {
			console.log("remove",response.data);
			if (response.data) {
				setRelation(null);
			}
				}).catch((error) => {
			console.log(error);
		});
	}

	const handleBlockUser = () => {
		apiClient.post(`/api/users/blockUser/${idPlayer}`).then((response) => {
			console.log(response);
			//setChangeRelation(!changeRelation);

		}).catch((error) => {
			console.log(error);
		});
	}

	const handleUnblockUser = () => {
		apiClient.post(`/api/users/unblockUser/${idPlayer}`).then((response) => {
			console.log(response);
			//setChangeRelation(!changeRelation);
		}).catch((error) => {
			console.log(error);
		});
	}

	const renderButton = (relation : Friend | null) => {

		console.log ("relation", relation);
		if (!relation)
			return <Button variant="contained" sx={{ ml: 'auto', mr: 1, mt: 2, mb: 2 }} onClick={handleAddFriend}>Add Friend</Button>;

		switch (relation?.requestStatus) {
			case null:
				return <Button variant="contained" sx={{ ml: 'auto', mr: 1, mt: 2, mb: 2 }} onClick={handleAddFriend}>Add Friend</Button>;
			case "accepted":
				return <Button variant="outlined" sx={{ ml: 'auto', mr: 1, mt: 2, mb: 2 }} onClick={handleRemoveFriend}>Remove Friend</Button>;
			case "pending":
				{
					if (relation?.type === 'sent')
						return <Button variant="outlined" sx={{ ml: 'auto', mr: 1, mt: 2, mb: 2 }} onClick={handleRemoveFriend}>Cancel Request</Button>;
					else
						return <Button variant="outlined" sx={{ ml: 'auto', mr: 1, mt: 2, mb: 2 }} onClick={handleAcceptFriend}>Accept Request</Button>;
				}
		
		}
	}


	


    return (
        <React.Fragment>
            <Box position="static" sx={{ height: 'auto' }}>
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
                                {userData?.username}
                            </Typography>
                            {<Avatar sx={{ bgcolor: userData && userData.userConnected ? 'green' : 'red' }} style={{ width: '15px', height: '15px' }}> </Avatar>}
                        </div>
                        {userData && userData.states.join("-") != "" ? <Typography sx={{ flexGrow: 1, marginTop: '5px' }}>{userData.states[0]}</Typography> : <Typography sx={{ flexGrow: 1, marginTop: '5px' }}>{userData?.userConnected ? "online" : "offline"}</Typography>}
                    </Box>

                    {itsme ? <UpdateProfil /> : (
                        <>
							{renderButton(relation)}
                            {isBlocked? <Button variant="outlined" color="error" sx={{ ml: '1', mr: 3, mt: 2, mb: 2 }} onClick={handleUnblockUser}>unblock</Button> : <Button variant="outlined" color="error" sx={{ ml: '1', mr: 3, mt: 2, mb: 2 }} onClick={handleBlockUser}>block</Button>}
                        </>
                    )}

                </div>
            </Box>
            <Divider />
            </React.Fragment >
            )
}
