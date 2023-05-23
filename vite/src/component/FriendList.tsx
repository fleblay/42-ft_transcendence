
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
		<Box sx={{ borderBottom: 1, borderColor: 'divider' }} display="flex" flexDirection={'column'} alignItems={'center'} justifyContent={'center'}>
			<Tabs value={value} onChange={handleChange} aria-label="icon label tabs example">
				<Tab value={'accepted'} label="Friends" />
				<Tab value={'pending'} label="Pending" />
			</Tabs>
		</Box>
	);
}
//
export function FriendList() {
	const [friendList, setFriendList] = useState<{ [status: string]: Friend[] }>({});
	const auth = useAuthService();
	const navigate = useNavigate();
	const [tabs, setTabs] = useState<'accepted' | 'pending'>('accepted');
	const { customEmit, socket, customOn, customOff, addSubscription } = useContext(SocketContext);
	const [render, setRender] = useState(false);

	React.useEffect(() => {
		if (!auth.user) return;
		return addSubscription(`/player/${auth.user.id}`)
	}, [auth.user])

	React.useEffect(() => {
		function onPlayerEvent({ userId, event, targetId }: { userId: number, targetId?: number, event: string }) {
			setTabs(event.includes('add') ? 'pending' : 'accepted')
			setRender(!render)
		}
		customOn("page.player", onPlayerEvent);
		return (() => {
			customOff("page.player", onPlayerEvent);
		})
	}, [])

	React.useEffect(() => {
		if (!auth.user) return;
		apiClient.get(`/api/friends?status=${tabs}`).then((response) => {
			setFriendList((oldList) => {
				return { ...oldList, [tabs]: response.data };
			});
		}).catch((error) => {
			console.error('Error fetching friends: ', error.response.data);
		});

	}, [auth.user, tabs, render]);

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
					<AppBar position="static"
					sx={({ shape }) => ({
						borderRadius: `${shape.borderRadius}px ${shape.borderRadius}px 0 0`,
						height: '80px'
					})}>
						<Typography textAlign="center" variant="h6" sx={{ flexGrow: 1, paddingTop: '25px' }}>
							Friends
						</Typography>
					</AppBar>
					<FriendsTabs value={tabs} setValue={setTabs} />
					<Box position="static" sx={{ height: 'auto' }}>
						{friendList[tabs]?.length === 0 ? <Typography textAlign="center" variant="h6" sx={{ flexGrow: 1, p: '25px' }}> You don't have any friends yet </Typography> : null}
						{friendList[tabs]?.map((friend: Friend) => {
							//const imgPath = `/avatars/${friend.id}.png`

							return (
								<React.Fragment key={friend.id}>
									<UserInfoDisplay idPlayer={`${friend.id}`} displayBlocked={false} setRender={setRender} render={render} />
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
