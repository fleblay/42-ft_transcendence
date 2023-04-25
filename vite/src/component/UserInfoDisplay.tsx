
import React, { useContext, useState } from 'react';
import { Avatar, Button, Typography } from '@mui/material';


import { Box } from '@mui/system';
import { useAuthService } from '../auth/AuthService';
import { Divider } from '@mui/material';

import { UserDataProvider, UserDataContext } from '../userDataProvider/userDataProvider';
import { UpdateProfil } from './UpdateProfil';
import apiClient from '../auth/interceptor.axios';
import { Blocked, Friend } from '../types';


export function UserInfoDisplay({ idPlayer, relation, itsme }: { idPlayer: string | undefined, relation: Friend | null, itsme: boolean}) {

    const { userData, setUserData } = useContext(UserDataContext);
    const imgPath = `/avatars/${idPlayer}.png`;
	const [isBan, setIsBan] = useState<boolean>(false);
    const [changeRelation, setChangeRelation] = useState<boolean>(false);


 

    const handleAddFriend = () => {
		apiClient.post(`/api/users/addFriend/${idPlayer}`).then((response) => {
			console.log(response);
			setChangeRelation(!changeRelation);
		}).catch((error) => {
			console.log(error);
		});
	}


	const handleRemoveFriend = () => {
		apiClient.post(`/api/users/removeFriend/${idPlayer}`).then((response) => {
			console.log(response);
			setChangeRelation(!changeRelation);
		}).catch((error) => {
			console.log(error);
		});
	}

	const handleBlockUser = () => {
		apiClient.post(`/api/users/blockUser/${idPlayer}`).then((response) => {
			console.log(response);
			setChangeRelation(!changeRelation);

		}).catch((error) => {
			console.log(error);
		});
	}

	const handleUnblockUser = () => {
		apiClient.post(`/api/users/unblockUser/${idPlayer}`).then((response) => {
			console.log(response);
			setChangeRelation(!changeRelation);
		}).catch((error) => {
			console.log(error);
		});
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
                            {relation ? <Button variant="outlined" sx={{ ml: 'auto', mr: 1, mt: 2, mb: 2 }} onClick={handleRemoveFriend} >remove friend </Button> : <Button variant="contained" sx={{ ml: 'auto', mr: 1, mt: 2, mb: 2 }} onClick={handleAddFriend} >add a friend </Button>}
                            {isBan ? <Button variant="outlined" color="error" sx={{ ml: '1', mr: 3, mt: 2, mb: 2 }} onClick={handleUnblockUser}>unblock</Button> : <Button variant="outlined" color="error" sx={{ ml: '1', mr: 3, mt: 2, mb: 2 }} onClick={handleBlockUser}>block</Button>}
                        </>
                    )}

                </div>
            </Box>
            <Divider />
            </React.Fragment >
            )
}
