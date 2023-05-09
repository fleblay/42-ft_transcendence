import { Box, Button, Container, CssBaseline, Divider, FormControl, FormControlLabel, FormLabel, Grid, Input, Modal, Radio, RadioGroup, TextField, Typography } from "@mui/material";
import React, { FormEvent, useEffect } from "react";
import apiClient from "../../auth/interceptor.axios";
import { useNavigate } from "react-router-dom";
import { DatePicker, DateTimePicker } from "@mui/x-date-pickers";
import { Member } from "../../types";
import dayjs, {Dayjs} from "dayjs";

export function MuteMemberModal({ openModal, onClose, channelId, member }: { openModal: boolean, onClose: () => void, channelId: string, member: Member }) {

	const [muteEnd, setMuteEnd] = React.useState<Dayjs | null>(dayjs().add(1, 'hour'));
	const mutedState: boolean = Date.parse(member.muteTime) > Date.now()

	const handleSubmit = () => {
		apiClient.post(`/api/chat/channels/${channelId}/members/${member.id}`, { mute: mutedState ? dayjs("1970-1-1").toDate(): muteEnd }).
			then(() => {
				onClose();
			})
			.catch((error) => {
				console.log(error);
			});
	}

	return (
		<Modal open={openModal} onClose={onClose} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
			<Container maxWidth="sm" className="centered-container" >
				<Box sx={{
					width: '100%',
					border: '1px solid #D3C6C6',
					boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)',
					borderRadius: '16px',
					display: 'flex',
					flexDirection: 'column',
					alignItems: 'center',
					bgcolor: 'background.paper',
					p: '3rem'
				}}>
					<Typography textAlign="center" variant="h6" sx={{ flexGrow: 1, mb: '10px' }} >{`${mutedState ? "Unmute" : "Mute"} ${member.user.username}`}</Typography>
					<Divider />
					<form>
						{
							!mutedState && <DateTimePicker defaultValue={dayjs().add(1, 'hour')} onChange={(newValue) => setMuteEnd(newValue)} label="Select end of mute period" />
						}
						<Button onClick={handleSubmit} variant="outlined" sx={{ flexGrow: 1, mt: '10px', width: '100%', height: '30px' }}>{`${mutedState ? "Unmute" : "Mute"} ${member.user.username}`}</Button>
						<Divider />
					</form>
					<Button onClick={onClose}>Close</Button>
				</Box>
			</Container>
		</Modal>
	)
}

