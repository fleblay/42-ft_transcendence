
import React, { ReactNode, useContext, useState } from 'react';
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
import AcUnitIcon from '@mui/icons-material/AcUnit';
import LaptopMacIcon from '@mui/icons-material/LaptopMac';
import AddAPhotoIcon from '@mui/icons-material/AddAPhoto';
import { UserInfo } from '../types';

const achievementArray: { name: string, text: string, color: string, icon: React.ElementType }[] =
	[
		{ name: "boss", text: "Boss : Win 100 or more points", color: "primary", icon: AutoAwesomeIcon },
		{ name: "quitter", text: "Quitter : Leave a game before the end", color: "error", icon: ThumbDownOffAltIcon },
		{ name: "friend", text: "Friendly : Play a game with a friend", color: "primary", icon: PeopleIcon },
		{ name: "perfect", text: "Accurate : Win a game without loosing a single point", color: "primary", icon: RadarIcon },
		{ name: "number1", text: "Xav, the boss of the game : Be the first of the LeaderBoard at some point", color: "primary", icon: EmojiEventsIcon },
		{ name: "stud", text: "Stud : Login with 42", color: "primary", icon: SchoolIcon },
		{ name: "sub-zero", text: "Sub-zero : Have a negative amount of points at some point", color: "error", icon: AcUnitIcon },
		{ name: "the-answer", text: "42, the answer : Play a game with an id containing the number '42'", color: "primary", icon: LaptopMacIcon },
		{ name: "picture", text: "Say Cheese ! : Upload a profile picture", color: "primary", icon: AddAPhotoIcon}
	]

function RenderSwitch({ userData }: { userData: UserInfo | null }): JSX.Element {
	if (!userData)
		return (<></>)
	return (
		<Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
			{
				achievementArray.map((ach) => {
					return (
						<Tooltip key={ach.name} title={ach.text}>
							<ach.icon color={userData.achievements.includes(ach.name) ? ach.color : "disabled"} fontSize={'large'} />
						</Tooltip>
					)
				})
			}

		</Box>
	)
}


export function UserAchivement() {
	const { userData } = useContext(UserDataContext);
	console.log("userdata is", userData)
	return (
		<>
			<Box position="static" sx={{ height: 'auto' }}>
				<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: '2rem', paddingBottom: '2rem' }}>
					<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start' }}>
						<MilitaryTechOutlinedIcon sx={{ ml: 2 }} color="primary" />
						<Typography variant="h6" noWrap style={{ textOverflow: 'ellipsis', maxWidth: '200px' }} sx={{ flexGrow: 1, ml: '10px', mr: '20px' }}>
							Rank : {(userData?.rank != -1) ? userData?.rank : "/"}
						</Typography>
					</div>
					<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start' }}>
						<EmojiEventsOutlinedIcon sx={{ ml: 2 }} color="primary" />
						<Typography variant="h6" noWrap style={{ textOverflow: 'ellipsis', maxWidth: '200px' }} sx={{ flexGrow: 1, ml: '10px', mr: '20px' }}>
							Win : {userData?.totalWonGames}
						</Typography>
					</div>
					<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start' }}>
						<ThumbDownAltOutlinedIcon sx={{ ml: 2 }} color="primary" />
						<Typography variant="h6" noWrap style={{ textOverflow: 'ellipsis', maxWidth: '200px' }} sx={{ flexGrow: 1, ml: '10px', mr: '20px' }}>
							Loose : {userData?.totalPlayedGames ? userData.totalPlayedGames - userData?.totalWonGames : 0}
						</Typography>
					</div>
					<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start' }}>
						<AutoAwesomeOutlinedIcon sx={{ ml: 2 }} color="primary" />
						<Typography variant="h6" noWrap style={{ textOverflow: 'ellipsis', maxWidth: '200px' }} sx={{ flexGrow: 1, ml: '10px', mr: '20px' }}>
							Ratio : {userData?.totalPlayedGames ? (userData?.totalWonGames / userData?.totalPlayedGames).toFixed(2) : 0}
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
					<RenderSwitch userData={userData} />
				</div>
			</Box>
			<Divider />
		</>
	)
} 
