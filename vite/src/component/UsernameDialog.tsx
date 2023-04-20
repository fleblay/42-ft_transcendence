import * as React from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import { useNavigate } from 'react-router-dom';
import { TextField } from '@mui/material';
import apiClient from '../auth/interceptor.axios';

export function UsernameDialog() {
	const [error, setError] = React.useState<string | undefined>();
	const navigate = useNavigate()

	const handleConfirm = () => {
		apiClient.post('/api/user/username', { username: 'bob' })
		.then((response) => {
			if (response.status === 200) {
				navigate(0)
			}
		})
		.catch((error) => {
			setError(error.response.data.message)
		});
	}

	return (
		<Dialog
			open={true}
			onClose={() => {}}
		>
			<DialogTitle id="alert-dialog-title">
				{"You don't have a username."}
			</DialogTitle>
			<DialogContent>
				<DialogContentText id="alert-dialog-description">
					Choose a unique username to play the game.
				</DialogContentText>
				<TextField error={!!error} helperText={error} size='small' id="standard-basic" label="Username" margin="normal" fullWidth />
			</DialogContent>
			<DialogActions>
				<Button onClick={handleConfirm} autoFocus>
					Validate
				</Button>
			</DialogActions>
		</Dialog>
	);
}
