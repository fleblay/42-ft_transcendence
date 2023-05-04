import { Grid, List, ListItem, ListItemText, makeStyles } from "@mui/material";
import { Message } from "../../types";
import { useContext, useEffect, useState } from "react";
import apiClient from "../../auth/interceptor.axios";
import { SocketContext } from "../../socket/SocketProvider";
import { ChatMsg } from "./ChatMessage";
import { useAuthService } from "../../auth/AuthService";

interface MessageAreaProps {
	channelId: string;
}

export function MessageArea({ channelId }: MessageAreaProps) {
	const {user} = useAuthService()

	const [messages, setMessages] = useState<Message[]>([]);

	const { customOn, customOff, addSubscription } = useContext(SocketContext);

	useEffect(() => {
		apiClient.get(`/api/chat/channels/${channelId}/messages`).then(({ data }: { data: Message[] }) => {
			console.log(`channels/${channelId}/messages`, data);
			setMessages(data);
		}).catch((error) => {
			console.log(error);
		});
	}, [channelId]);

	useEffect(() => {
		return addSubscription(`/chat/${channelId}`);
	}, [channelId]);

	useEffect(() => {
		function onNewMessage(message: Message) {
			console.log("onNewMessage", message);
			setMessages((messages) => {
				return [...messages, message];
			});
		}

		customOn("chat.message.new", onNewMessage);
		return () => {
			customOff("chat.message.new", onNewMessage);
		};
	}, [messages])

	// merge message in one array if it's the same user into array of array of message
	return (
		<List>
			{
				messages.reduce((acc: Message[][], message: Message) => {
					if (acc.length === 0) {
						return [[message]];
					}
					const lastMessage = acc[acc.length - 1][0];
					if (lastMessage.owner.user.id === message.owner.user.id) {
						acc[acc.length - 1].push(message);
					} else {
						acc.push([message]);
					}
					console.log(lastMessage.owner.user, message.owner.user);
					return acc;
				}, []).map((messages: Message[], i: number) => {
					return (
						<ChatMsg
							key={i}
							side={messages[0].id === user?.id ? 'right' : 'left'}
							avatar={`/avatars/${messages[0].owner.user.id}.png`}
							messages={messages.map((message) => message.content)}
							username={messages[0].owner.user.username}
						/>
					);
				})
			}
		</List>
	)
}
