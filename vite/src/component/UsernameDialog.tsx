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

interface UsernameDialogProps {
	quit?: () => void;
	open?: boolean;
}

export const UsernameDialog: React.FC<UsernameDialogProps> = ({ open = true, quit }) => {
	const [error, setError] = React.useState<string | undefined>();
	const navigate = useNavigate()

	const [username, setUsername] = React.useState<string>('');

	const handleConfirm = () => {
		if (!username) {
			setError('Username is required')
			return
		}
		if (username.length < 3) {
			setError('Username must be at least 3 characters')
			return
		}
		apiClient.patch('/api/users/me', { username })
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
			open={open}
			onClose={() => {
				if (typeof quit === 'function')
					quit();
			}}
		>
			<DialogTitle>
				{"You don't have a username."}
			</DialogTitle>
			<DialogContent>
				<DialogContentText>
					Choose a unique username to play the game.
				</DialogContentText>
				<TextField
					error={!!error} helperText={error}
					size='small' margin="normal" fullWidth
					label="Username"
					value={username}
					onChange={e => {
						setUsername(e.target.value)
					}}
					multiline
				/>
			</DialogContent>
			<DialogActions>
				{
					typeof quit === 'function' &&
					<Button onClick={() => quit()}>
						Cancel
					</Button>
				}
				<Button onClick={handleConfirm} autoFocus>
					Validate
				</Button>
			</DialogActions>
		</Dialog>
	);
}
