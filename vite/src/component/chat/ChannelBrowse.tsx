import { Button, List, ListItem, ListItemText, Theme } from "@mui/material"
import { FC, useContext, useEffect, useState } from "react"
import { Channel } from "../../types"
import { useNavigate } from "react-router-dom"
import apiClient from "../../auth/interceptor.axios"
import { SocketContext } from "../../socket/SocketProvider"
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';

interface ChannelMap { [id: number]: Channel };

export const ChannelBrowser: FC = () => {
	const [publicChannels, setPublicChannels] = useState<ChannelMap>({});
	const navigate = useNavigate();

	const { addSubscription, customOn, customOff } = useContext(SocketContext);

	useEffect(() => {
		return addSubscription(`/chat/public`);
	}, []);



	useEffect(() => {
		function onUpdateChannel(channel: Channel) {
			console.log("onNewMessage", channel);
			setPublicChannels((oldChannel) => {
				return { ...oldChannel, [channel.id]: channel };
			});
		}

		customOn("chat.message.new", onUpdateChannel);
		return () => {
			customOff("chat.message.new", onUpdateChannel);
		};
	}, [publicChannels])

	useEffect(() => {
		apiClient.get(`/api/chat/channels/my`).then((response) => {

			let result: ChannelMap = response.data.reduce((map: ChannelMap, obj: Channel) => {
				map[obj.id] = obj;
				return map;
			}, {});
			setPublicChannels(result);
		}).catch((error) => {
			console.log(error);
		});
	}, []);

	const joinChannel = (channelId: number) => {
		apiClient.post(`/api/chat/channels/${channelId}/join`).then((response) => {
			console.log("joinChannel", response);
			navigate(`/chat/${channelId}`);
		}).catch((error) => {
			console.log(error);
		});
	}

	return (
		<List>
			{Object.values(publicChannels).map((channel: Channel, index, array) => (
				<ListItem key={channel.id} sx={{
					paddingTop: 0,
					paddingBottom: 0,
					'&:hover': {
						bgcolor: (theme: Theme) => theme.palette.grey[200],
						'> button': {
							visibility: 'visible'
						}
					},
					borderBottom: array.length - 1 === index ? 1 : 0,
					borderTop: 1,
					borderColor: (theme: Theme) => theme.palette.grey[300],
					'> button': {
						visibility: 'hidden'
					}
				}}>
					{channel.hasPassword &&
						<LockOutlinedIcon
							sx={{
								color: (theme: Theme) => theme.palette.grey[500],
								marginRight: 1
							}}
						/>}
					<ListItemText
						primary={channel.name}
						secondary={`${channel.members?.length} members`}
					/>
					<Button onClick={() => joinChannel(channel.id)} variant='contained' color='success'>Join</Button>
				</ListItem>
			))}
		</List>
	)
}