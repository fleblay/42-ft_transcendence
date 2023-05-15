
import React, { useContext, useState } from 'react';
import { Tooltip, Typography } from '@mui/material';


import { Box } from '@mui/system';

import { Divider } from '@mui/material';
import EmojiEventsOutlinedIcon from '@mui/icons-material/EmojiEventsOutlined';
import ThumbDownAltOutlinedIcon from '@mui/icons-material/ThumbDownAltOutlined';
import MilitaryTechOutlinedIcon from '@mui/icons-material/MilitaryTechOutlined';
import AutoAwesomeOutlinedIcon from '@mui/icons-material/AutoAwesomeOutlined';

import { UserDataContext } from '../userDataProvider/userDataProvider';

import ThumbDownOffAltIcon from '@mui/icons-material/ThumbDownOffAlt';
import PeopleIcon from '@mui/icons-material/People';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import RadarIcon from '@mui/icons-material/Radar';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import SchoolIcon from '@mui/icons-material/School';

function renderSwitch(achievement: string): JSX.Element {
	switch (achievement) {
		case 'boss':
			return (
				<Tooltip title="Boss : Win 100 or more points">
					<AutoAwesomeIcon fontSize={'large'} />
				</Tooltip>
			)
		case 'quitter':
			return (
				<Tooltip title="Quitter : Leave a game before the end">
					<ThumbDownOffAltIcon fontSize={'large'} />
				</Tooltip>
			)
		case 'friend':
			return (
				<Tooltip title="Friendly : Play a game with a friend">
					<PeopleIcon fontSize={'large'} />
				</Tooltip>
			)
		case 'perfect':
			return (
				<Tooltip title="Accurate : Win a game without loosing a single point">
					<RadarIcon fontSize={'large'} />
				</Tooltip>
			)
		case 'number1':
			return (
				<Tooltip title="Xav : Be the first of the LeaderBoard at some point">
					<EmojiEventsIcon fontSize={'large'} />
				</Tooltip>
			)
		case 'stud':
			return (
				<Tooltip title="Stud : Login with 42">
					<SchoolIcon fontSize={'large'} />
				</Tooltip>
			)
		default:
			return (<></>)
	}
}


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
									{renderSwitch(achievement)}
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
