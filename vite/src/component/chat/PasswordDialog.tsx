
import React, { FC, useState } from 'react';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

interface PasswordDialogProps {
	handleClose: () => void;
	handleConfirm: (password: string) => void;
	open: boolean;
}

export const PasswordDialog: FC<PasswordDialogProps> = ({ open = true, handleClose, handleConfirm }) => {
	const [password, setPassword] = useState<string>("");
	return (
		<Dialog open={open} onClose={handleClose}>
			<DialogTitle>This channel is password protected</DialogTitle>
			<DialogContent>
				<DialogContentText>
					Please enter the password to join this channel
				</DialogContentText>
				<TextField
					autoFocus
					margin="dense"
					id="name"
					label="Channel password"
					type="password"
					fullWidth
					variant="standard"
					value={password}
					onChange={(event) => setPassword(event.target.value)}
				/>
			</DialogContent>
			<DialogActions>
				<Button onClick={handleClose}>Cancel</Button>
				<Button onClick={() => handleConfirm(password)}>Confirm</Button>
			</DialogActions>
		</Dialog>
	);
}
