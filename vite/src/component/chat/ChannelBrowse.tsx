import { Avatar, Box, Button, List, ListItem, ListItemText, Theme, Typography } from "@mui/material"
import { FC, useContext, useEffect, useState } from "react"
import { Channel, PublicChannel } from "../../types"
import { useNavigate } from "react-router-dom"
import apiClient from "../../auth/interceptor.axios"
import { SocketContext } from "../../socket/SocketProvider"
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { useDebouncedValue } from "../Debounced"
import { SearchBar } from "../SearchBar"
import { PasswordDialog } from "./PasswordDialog"

interface ChannelMap { [id: number]: PublicChannel };

export const ChannelBrowser: FC = () => {
	const [publicChannels, setPublicChannels] = useState<ChannelMap>({});
	const [searchChannel, setSearchChannel] = useState<string>("");
	const [debouncedSearchChannel] = useDebouncedValue(searchChannel, 10);

	const [passwordDialogChannel, setPasswordDialogChannel] = useState<number | undefined>(undefined);

	const navigate = useNavigate();

	const { addSubscription, customOn, customOff } = useContext(SocketContext);

	useEffect(() => {
		return addSubscription(`/chat/public`);
	}, []);

	useEffect(() => {
		function onUpdateChannel(channel: PublicChannel) {
			setPublicChannels((oldChannel) => {
				return { ...oldChannel, [channel.id]: channel };
			});
		}

		customOn("chat.public.update", onUpdateChannel);
		return () => {
			customOff("chat.public.update", onUpdateChannel);
		};
	}, [publicChannels])

	useEffect(() => {
		apiClient.get<PublicChannel[]>(`/api/chat/channels/public`).then(({ status, data }) => {
			if (status !== 200)
				return;
			let result: ChannelMap = data.reduce((map: ChannelMap, obj: PublicChannel) => {
				map[obj.id] = obj;
				return map;
			}, {});
			setPublicChannels(result);
		}).catch((error) => {
			console.log(error);
		});
	}, []);

	const joinChannel = (channelId: number, password?: string) => {
		apiClient.post(`/api/chat/channels/${channelId}/join`, { password }).then((response) => {
			console.log("joinChannel", response);
			navigate(`/chat/${channelId}`);
		}).catch((error) => {
			console.log(error);
		});
	}

	return (
		<Box>
			<Box sx={{ marginTop: 1 }}>
				<SearchBar value={searchChannel} onChange={(event) => setSearchChannel(event.target.value)} />
				<Typography variant="subtitle1" sx={{ marginLeft: 1, marginTop: 1 }} color="text.secondary"
				>{`${Object.values(publicChannels).length} channels`}</Typography>
			</Box>
			<List
				sx={{
					overflow: 'auto',
					maxHeight: 500,
				}}
			>
				{Object.values(publicChannels)
					.filter((channel: PublicChannel) => debouncedSearchChannel.length === 0 || channel.name.toLowerCase().includes(debouncedSearchChannel.toLowerCase()))
					.map((channel: PublicChannel, index, array) => (
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
								secondary={`${channel.membersLength} members`}
							/>
							{
								channel.owner && (
									<Box sx={{ display: 'flex', alignItems: 'center', flexDirection: 'column', marginRight: 1 }}>
										<Avatar src={`/avatars/${channel.owner?.id || 'default'}.png`} sx={{ width: 24, height: 24 }}>
											{channel.owner?.username[0]}
										</Avatar>
										<Typography variant="body2" color="text.secondary">
											{channel.owner?.username}
										</Typography>
									</Box>
								)
							}
							<Button
								onClick={() => {
									if (channel.hasPassword)
										setPasswordDialogChannel(channel.id);
									else
										joinChannel(channel.id)
								}}
								variant='contained' color='success'
							>Join</Button>
						</ListItem>
					))}
			</List>
			<PasswordDialog
				open={!!passwordDialogChannel}
				handleClose={() => setPasswordDialogChannel(undefined)}
				handleConfirm={(password) => {
					if (!passwordDialogChannel) return;
					joinChannel(passwordDialogChannel, password)
				}}
			/>
		</Box>
	)
}