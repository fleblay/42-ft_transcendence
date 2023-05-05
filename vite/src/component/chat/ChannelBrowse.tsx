import { Avatar, AvatarGroup, Badge, List, ListItem, ListItemButton, ListItemText } from "@mui/material"
import { FC, useContext, useEffect, useState } from "react"
import { Channel, Member } from "../../types"
import { useNavigate } from "react-router-dom"
import apiClient from "../../auth/interceptor.axios"
import { SocketContext } from "../../socket/SocketProvider"

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


	const moveToChannel = (channelId: number) => {
		navigate(`/chat/${channelId}`);
	}
	const joinChannel = (channelId: number) => {
		apiClient.post(`/api/chat/channels/${channelId}/join`).then((response) => {
			console.log("joinChannel", response);
		}).catch((error) => {
			console.log(error);
		});
	}

	return (
		<List>
			{Object.values(publicChannels).map((channel: Channel) => (
				<ListItem key={channel.id} sx={{ pl: 4 }}>
					<ListItemButton onClick={() => moveToChannel(channel.id)}>
						<Badge badgeContent={0} color="primary">
							<ListItemText primary={channel.name} />
						</Badge>
						<AvatarGroup sx={{ ml: 'auto' }} total={channel.members?.length}>
							{channel?.members?.map((member: Member) => (
								<Avatar key={member.id} src={`/avatars/${member.user.id}.png`} />
							))}
						</AvatarGroup>
					</ListItemButton>
					<ListItemButton onClick={() => joinChannel(channel.id)}>Join</ListItemButton>
				</ListItem>
			))}
		</List>
	)
}