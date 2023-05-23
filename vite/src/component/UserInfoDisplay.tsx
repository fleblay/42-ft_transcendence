
import React, { useContext, useState } from 'react';
import { Avatar, Button, IconButton, Typography } from '@mui/material';


import { Box } from '@mui/system';
import { Divider } from '@mui/material';

import { UserDataContext } from '../userDataProvider/userDataProvider';
import { UpdateProfil } from './UpdateProfil';
import apiClient from '../auth/interceptor.axios';
import { Friend, UserInfo, } from '../types';
import { SocketContext } from '../socket/SocketProvider';
import { useAuthService } from '../auth/AuthService';
import EmailIcon from '@mui/icons-material/Email';
import { useNavigate } from 'react-router-dom';

interface UserInfoDisplayProps {
	idPlayer: string | undefined;
	displayBlocked: boolean;
	setRender?: (render: boolean) => void;
	render?: boolean;


}

export const handleUnblockUser = (idPlayer: string | undefined) => {
	apiClient.post(`/api/users/unblockUser/${idPlayer}`).then((response) => {
	}).catch((error) => {
	});
}

export const handleBlockUser = (idPlayer: string | undefined) => {
	apiClient.post(`/api/users/blockUser/${idPlayer}`).then((response) => {

	}).catch((error) => {
	});
}



export function UserInfoDisplay({ idPlayer, displayBlocked, setRender, render }: UserInfoDisplayProps) {

	const [userData, setUserData] = useState<UserInfo | null>(null);
	const imgPath = `/avatars/${idPlayer}.png`;
	const [isBlocked, setIsBlocked] = useState<boolean>(false);
	const { customEmit, socket, customOn, customOff, addSubscription } = useContext(SocketContext);
	const [relation, setRelation] = useState<Friend | null>(null);
	const auth = useAuthService();
	const [itsMe, setItsMe] = useState<boolean>(false);
	const [displayUpdate, setDisplayUpdate] = useState<boolean>(false);
	const navigate = useNavigate();

	React.useEffect(() => {

		if (!auth.user) return;

		apiClient.get(`/api/users/${idPlayer}`).then((response) => {
			console.log("fetching user data")
			setUserData(response.data);
			console.log(response.data)
		}).catch((error) => { }).then(() => {

			if (idPlayer !== undefined && auth.user && parseInt(idPlayer) === auth.user.id) {
				setItsMe(true);
			}
			else {
				setItsMe(false);
				if (idPlayer !== undefined) {
					apiClient.get(`/api/friends/${idPlayer}`).then((response) => {
						console.log("get relation");
						setRelation(response.data);
						console.log(response.data);
					}).catch((error) => {

					}).then(() => {
						apiClient.get(`/api/users/getBlocked/${idPlayer}`).then((response) => {
							if (response.data) {
								setIsBlocked(true);
							}
							else
								setIsBlocked(false);
						}).catch((error) => {
						});
					}
					);
				}
			}
		});

	}, [auth.user, idPlayer, displayUpdate]);


	React.useEffect(() => {
		if (!socket) return;
		function updateComponent(data: any) {
			console.log("update component")
			if (userData) {
				setDisplayUpdate(!displayUpdate);
				if (setRender)
					setRender(!render)
			}
		}
		customOn('page.player', updateComponent)
		return (() => {
			customOff('page.player', updateComponent);
		})
	}, [socket, userData]);


	React.useEffect(() => {
		const room = `/player/${idPlayer}`;
		return addSubscription(room);
	}, [idPlayer]);

	React.useEffect(() => {
		if (!socket) return;
		function updateUserData(data: any) {
			if (userData)
				setUserData({ ...userData, ...data });
		}
		customOn('page.player', updateUserData)
		return (() => {
			customOff('page.player', updateUserData);
		})
	}, [socket, userData]);


	const joinDm = () => {
		apiClient.post(`/api/chat/dm/${idPlayer}/join`).then((response) => {
			navigate(`/chat/${response.data}`);
		}).catch((error) => {
		});
	}



	const handleUnblockUser = (idPlayer: string | undefined) => {
		apiClient.post(`/api/users/unblockUser/${idPlayer}`).then((response) => {
			setIsBlocked(false);
		}).catch((error) => {
		});
	}

	const handleBlockUser = (idPlayer: string | undefined) => {
		apiClient.post(`/api/users/blockUser/${idPlayer}`).then((response) => {
			setIsBlocked(true);
		}).catch((error) => {
		});
	}


	const handleAddFriend = () => {
		apiClient.post(`/api/friends/add/${idPlayer}`).then((response) => {
			if (response.data) {
				setRelation(response.data);
			}
		}).catch((error) => {
		});
	}

	const handleAcceptFriend = () => {
		apiClient.post(`/api/friends/accept/${idPlayer}`).then((response) => {
			if (response.data) {
				setRelation(response.data);
			}
		}).catch((error) => {
		});
	}

	const handleRemoveFriend = () => {
		apiClient.post(`/api/friends/remove/${idPlayer}`).then((response) => {
			setRelation(null);
		}).catch((error) => {
		});
	}

	const renderButton = (relation: Friend | null) => {

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
			default:
				return <Button variant="contained" sx={{ ml: 'auto', mr: 1, mt: 2, mb: 2 }} onClick={handleAddFriend}>Add Friend</Button>;
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
					{itsMe ? <UpdateProfil /> : (
						<>
							{relation?.requestStatus === "accepted" && <IconButton color='primary' sx={{ mr: 'auto', marginTop: '5px' }} onClick={joinDm}><EmailIcon /></IconButton>}
							{auth.user && userData && !userData.blockedId.includes(auth.user?.id) && renderButton(relation) || <Box sx={{ ml: 'auto', mr: 1, mt: 2, mb: 2 }}></Box>}
							{displayBlocked && isBlocked ? <Button variant="outlined" color="error" sx={{ ml: '1', mr: 3, mt: 2, mb: 2 }} onClick={() => handleUnblockUser(idPlayer)}>unblock</Button> : <Button variant="outlined" color="error" sx={{ ml: '1', mr: 3, mt: 2, mb: 2 }} onClick={() => handleBlockUser(idPlayer)}>block</Button>}
						</>
					)}

				</div>
			</Box>
			<Divider />
		</React.Fragment >
	)
}
