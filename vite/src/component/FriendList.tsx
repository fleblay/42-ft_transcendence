
import React, { useState, useContext } from 'react';
import { AppBar, Avatar, Button, Container, Switch, TextField, Typography } from '@mui/material';
import apiClient from '../auth/interceptor.axios';
import { Box } from '@mui/system';
import { Divider } from '@mui/material';
import { Friend } from '../types';
import { useAuthService } from '../auth/AuthService';
import { useNavigate } from 'react-router-dom';
import { SocketContext } from '../socket/SocketProvider';

import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import { UserInfoDisplay } from './UserInfoDisplay';

// import PeopleIcon from '@mui/icons-material/People';
// import GroupAddIcon from '@mui/icons-material/GroupAdd';
// import GroupRemoveIcon from '@mui/icons-material/GroupRemove';


interface TabPanelProps {
	children?: React.ReactNode;
	index: number;
	value: number;
}
function TabPanel(props: TabPanelProps) {
	const { children, value, index, ...other } = props;

	return (
		<div
			role="tabpanel"
			hidden={value !== index}
			id={`simple-tabpanel-${index}`}
			aria-labelledby={`simple-tab-${index}`}
			{...other}
		>
			{value === index && (
				<Box sx={{ p: 3 }}>
					<Typography>{children}</Typography>
				</Box>
			)}
		</div>
	);
}

type FriendTabsValue = 'accepted' | 'pending';
interface FriendsTabsProps {
	value: FriendTabsValue;
	setValue: React.Dispatch<React.SetStateAction<FriendTabsValue>>;
}

function FriendsTabs({ value, setValue }: FriendsTabsProps) {

	const handleChange = (event: React.SyntheticEvent, newValue: FriendTabsValue) => {
		setValue(newValue);
	};
	return (
		<Box sx={{ borderBottom: 1, borderColor: 'divider'}} display="flex" flexDirection={'column'} alignItems={'center'} justifyContent={'center'}>
			<Tabs value={value} onChange={handleChange} aria-label="icon label tabs example">
				<Tab value={'accepted'} label="Friends" />
				<Tab value={'pending'} label="Pending" />
				{/* <Tab icon={<PeopleIcon />} label="Friends" /> */}
				{/* <Tab icon={<GroupAddIcon />} label="Incomings" /> */}
				{/* <Tab icon={<GroupRemoveIcon />} label="Outgoings" /> */}
			</Tabs>
		</Box>
	);
}

export function FriendList() {
	//send a post with image
	const [friendList, setFriendList] = useState<{[status: string]: Friend[]}>({});
	const auth = useAuthService();
	const navigate = useNavigate();
	const [tabs, setTabs] = useState<'accepted' | 'pending'>('accepted');

	React.useEffect(() => {
		if (!auth.user) return;
		console.log('Fetching friends')
		apiClient.get(`/api/users/friends?status=${tabs}`).then((response) => {
			console.log('Friends: ', response.data);
			setFriendList((oldList) => {
				return { ...oldList, [tabs]: response.data };
			});
		}).catch((error) => {
			console.error('Error fetching friends: ', error.response.data);
		});

	}, [auth.user, tabs]);

	const handleViewProfil = (id: number) => {
		navigate(`/player/${id}`);
	}
	if (!friendList) return null;

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
					<FriendsTabs value={tabs} setValue={setTabs} />
					<Box position="static" sx={{ height: 'auto' }}>
						{friendList[tabs]?.length === 0 ? <Typography textAlign="center" variant="h6" sx={{ flexGrow: 1, p: '25px' }}> You don't have any friends yet </Typography> : null}
						{friendList[tabs]?.map((friend: Friend) => {
							const imgPath = `/avatars/${friend.id}.png`

							return (
								<React.Fragment key={friend.id}>
									<UserInfoDisplay idPlayer={`${friend.id}`} itsme={false} relation={friend} setRelation={()=>{}}  />
									{/* <div style={{ display: 'flex', alignItems: 'center', paddingTop: '2rem', paddingBottom: '2rem', justifyContent: 'flex-start' }}>

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
													{friend?.username}
												</Typography>
												{<Avatar sx={{ bgcolor: friend.online ? 'green' : 'red' }} style={{ width: '15px', height: '15px' }}> </Avatar>}
											</div>
											{friend && friend.status ? <Typography sx={{ flexGrow: 1, marginTop: '5px' }}>{friend.status}</Typography> : <Typography sx={{ flexGrow: 1, marginTop: '5px' }}>{friend?.online ? "online" : "offline"}</Typography>}
										</Box>
										<Button variant="outlined" sx={{ ml: 'auto', mr: 1, mt: 2, mb: 2 }} onClick={() => handleRemoveFriend(friend.id)} >remove friend </Button> }
										<Button variant="contained" sx={{ ml: '2', mr: 3, mt: 2, mb: 2 }} onClick={() => handleViewProfil(friend.id)} >view profil </Button>
									</div> */}
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