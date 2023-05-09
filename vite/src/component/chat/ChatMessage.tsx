import React, { FC } from 'react';
import PropTypes from 'prop-types';
import cx from 'clsx';
import Grid from '@mui/material/Grid';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import { Message } from '../../types';
import { Button } from '@mui/material';
import { Link as LinkRouter } from "react-router-dom";

interface ChatMsgProps {
	messages: Message[];
	side: 'left' | 'right';
	avatar: string;
	username: string;
}

export const ChatMsg: FC<ChatMsgProps> = ({ side, avatar, messages, username }) => {
	return (
		<Grid
			container
			spacing={2}
			justifyContent={side === 'right' ? 'flex-end' : 'flex-start'}
		>
			{side === 'left' && (
				<Grid item>
					<Avatar
						src={avatar}
					/>
				</Grid>
			)}
			<Grid item xs={8}>
				{/* text containing username in grey color and little size */}

				{side === 'left' && (
					<Typography
						align={'left'}
						variant={'caption'}
						color={'textSecondary'}
					>
						{username}
					</Typography>
				)}
				{messages.map((msg: Message, index: number) => {
					const borderStyle = side === 'left' ? {
						borderTopLeftRadius: index === 0 ? 15 : 5,
						borderBottomLeftRadius: index === messages.length - 1 ? 15 : 5,
					} : {
						borderTopRightRadius: index === 0 ? 15 : 5,
						borderBottomRightRadius: index === messages.length - 1 ? 15 : 5,
					};
					return (
						<div key={index}
							style={{
								backgroundColor: side === 'left' ? '#e0e0e0' : 'rgb(62, 74, 142)',
								color: side === 'left' ? '#000' : '#fff',
								borderTopLeftRadius: 15,
								borderBottomLeftRadius: 15,
								borderTopRightRadius: 15,
								borderBottomRightRadius: 15,
								padding: 10,
								marginBottom: 5,
								marginTop: 5,
								maxWidth: '80%',
								wordWrap: 'break-word',
								marginLeft: side === 'left' ? 0 : 'auto',
								marginRight: side === 'left' ? 'auto' : 0,
								...borderStyle
							}}
						>
							<>
								<Typography
									align={'left'}
								>
									{msg.content}
								</Typography>
								{msg.gameId &&
									<Button
										variant='contained'
										color='success'
										component={LinkRouter} to={`/game/${msg.gameId}`}
									>Join Game</Button>
								}
							</>
						</div>
					)
				})}
			</Grid>
		</Grid>
	);
};