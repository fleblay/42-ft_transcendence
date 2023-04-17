
import { useState } from 'react';
import { Button, TextField } from '@mui/material';
import apiClient from '../auth/interceptor.axios';
import { FormEvent } from 'react';
import { Label } from '@mui/icons-material';
import AvatarEditor from 'react-avatar-editor';
import getCroppingRect from 'react-avatar-editor';



function fileToBlob(file: File) {
	const blob = new Blob([file], { type: file.type });
	return blob;
}

export function MyProfil() {
	//send a post with image
	const [file, setFile] = useState<File | null>(null);
	const [error, setError] = useState<string | null>(null);

	const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		if (event.target.files) {
			setFile(event.target.files[0]);
		}
	};

	const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		if (file?.type !== 'image/png') {
			setError('Only png files are allowed');
			return;
		}
		const formData = new FormData();
		formData.append('image', fileToBlob(file as File));
		const size =  new getCroppingRect();
		formData.append('size', JSON.stringify(size));

		apiClient.post('/api/users/uploadAvatar', formData, {
			headers: {
				'Content-Type': 'multipart/form-data'
			}
		}).then((response) => {
			console.log(response);
		}).catch((error) => {
			console.log(error);
		});
	};


	return (
		<form onSubmit={handleSubmit}>
			<div>	Choose profil pic</div>
			<input  type="file" onChange={handleChange} />
			<Button type="submit">Submit</Button>
			<div>{error}</div>
			{file !== null  ? (<AvatarEditor
      image={file}
      width={250}
      height={250}
      border={50}
      color={[255, 255, 255, 0.6]} // RGBA
      scale={1.2}
      rotate={0}
    />): null}
		</form>

	)
}