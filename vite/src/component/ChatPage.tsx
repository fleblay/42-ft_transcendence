import { Box, Button, Container } from '@mui/material';
import React, { useRef, useState, useEffect } from 'react';
import apiClient from '../auth/interceptor.axios';


export function ChatPage() {

    const createChannel = () => {
        console.log("createChannel");
        const channelParams = {
            name: "test",
            type : "private",
            password: "test"
        }
        apiClient.post(`/api/chat/channels`, channelParams).then((response) => {
            console.log("response", response);
        }).catch((error) => {
            console.log(error);
        }
        );
    }

    const joinChannel = () => {
        console.log("joinChannel");
    };
    

	return (
		<>
			<Container maxWidth="lg">
				<Box sx={{
					width: '100%',
					border: '1px solid #D3C6C6',
					boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)',
					borderRadius: '16px',
					p: '2rem',
					bgcolor: 'background.paper',
				}}>

                <Button variant="contained" color="primary" onClick={createChannel}> Create Channel </Button>

				</Box>
			</Container >
		</>
	);
}
