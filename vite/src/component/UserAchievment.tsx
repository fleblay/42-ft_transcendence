
import React, { useContext, useState } from 'react';
import { Typography } from '@mui/material';


import { Box } from '@mui/system';

import { Divider } from '@mui/material';
import EmojiEventsOutlinedIcon from '@mui/icons-material/EmojiEventsOutlined';
import ThumbDownAltOutlinedIcon from '@mui/icons-material/ThumbDownAltOutlined';
import MilitaryTechOutlinedIcon from '@mui/icons-material/MilitaryTechOutlined';
import AutoAwesomeOutlinedIcon from '@mui/icons-material/AutoAwesomeOutlined';

import { UserDataContext } from '../userDataProvider/userDataProvider';


export function UserAchivement() {
	const { userData } = useContext(UserDataContext);
	console.log("userdata is", userData)
	return (
		<>
			<Box position="static" sx={{ height: 'auto' }}>
				<div style={{ display: 'flex', alignItems: 'center', paddingTop: '2rem', paddingBottom: '2rem' }}>
					<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start' }}>
						<MilitaryTechOutlinedIcon sx={{ ml: 2 }} color="primary" />
						<Typography variant="h6" noWrap style={{ textOverflow: 'ellipsis', maxWidth: '200px' }} sx={{ flexGrow: 1, ml: '10px', mr: '20px' }}>
							Rank : {(userData?.rank != -1) ? userData?.rank : "/"}
						</Typography>
					</div>
					<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start' }}>
						<EmojiEventsOutlinedIcon sx={{ ml: 2 }} color="primary" />
						<Typography variant="h6" noWrap style={{ textOverflow: 'ellipsis', maxWidth: '200px' }} sx={{ flexGrow: 1, ml: '10px', mr: '20px' }}>
							Win : {userData?.totalwonGames}
						</Typography>
					</div>
					<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start' }}>
						<ThumbDownAltOutlinedIcon sx={{ ml: 2 }} color="primary" />
						<Typography variant="h6" noWrap style={{ textOverflow: 'ellipsis', maxWidth: '200px' }} sx={{ flexGrow: 1, ml: '10px', mr: '20px' }}>
							Loose : {userData?.totalplayedGames ? userData.totalplayedGames - userData?.totalwonGames : 0}
						</Typography>
					</div>

					<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start' }}>
						<AutoAwesomeOutlinedIcon sx={{ ml: 2 }} color="primary" />
						<Typography variant="h6" noWrap style={{ textOverflow: 'ellipsis', maxWidth: '200px' }} sx={{ flexGrow: 1, ml: '10px', mr: '20px' }}>
							Ratio : {userData?.totalplayedGames ? (userData?.totalwonGames / userData?.totalplayedGames).toFixed(2) : 0}
						</Typography>
					</div>
				</div>
			</Box>
			<Divider />
			<Box position="static" sx={{ display: 'flex', height: 'auto', flexDirection: 'column', alignItems: 'center' }}>
				<Typography variant="h6" noWrap style={{ textOverflow: 'ellipsis', maxWidth: '200px' }} sx={{ ml: '10px', mr: '20px', }}>
					Achievements :</Typography>
				<div style={{ display: 'flex', alignItems: 'center', paddingTop: '1rem', paddingBottom: '1rem' }}>
					<Divider />
					{userData?.achievements.map((achievement) => {
						return (
							<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start' }}>
								<Typography variant="h6" noWrap style={{ textOverflow: 'ellipsis', maxWidth: '200px' }} sx={{ flexGrow: 1, ml: '10px', mr: '20px' }}>
									{achievement}
								</Typography>

							</div>
						)
					})}
				</div>
			</Box>
			<Divider />
		</>
	)
} 
