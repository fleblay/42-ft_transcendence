import React, { FC } from 'react';
import PropTypes from 'prop-types';
import cx from 'clsx';
import Grid from '@mui/material/Grid';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';

interface ChatMsgProps {
	messages: string[];
	side: 'left' | 'right';
	avatar: string;
	username: string;
}

export const ChatMsg: FC<ChatMsgProps> = ({ side, avatar, messages, username }) => {
	console.log(side)
	return (
		<Grid
			container
			spacing={2}
			justifySelf={side === 'right' ? 'flex-end' : 'flex-start'}
		>
			{/* side === 'left' && */(
				<Grid item>
					<Avatar
						src={avatar}
					/>
				</Grid>
			)}
			<Grid item xs={8}>
				{/* text containing username in grey color and little size */}

				{/* side === 'left' && */ (
					<Typography
						align={'left'}
						variant={'caption'}
						color={'textSecondary'}
					>
						{username}
					</Typography>
				)}
				{messages.map((msg: string, i: number) => (
					<div key={i}>
						<Typography
							align={'left'}
						>
							{msg}
						</Typography>
					</div>
				))}
			</Grid>
		</Grid>
	);
};