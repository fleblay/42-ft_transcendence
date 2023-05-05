import { Box, Button, Container, Divider, Typography } from "@mui/material";
import { FormEvent } from "react";
import apiClient from "../../auth/interceptor.axios";


export function CreateChannelModal({ handleClose }: { handleClose: () => void }) {


    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        const createChannel = () => {
            console.log("createChannel");
            const channelParams = {
                name: "test" + Math.floor(Math.random() * 1000),
                private: false,
                password: "test"
            }
            apiClient.post(`/api/chat/channels/create`, channelParams).then((response) => {
                console.log("channels/create", "ok");
            }).catch((error) => {
                console.log(error);
            }
            );
        }
    

	};

    return (
        <Container maxWidth="sm" className="centered-container" >
            <Box sx={{
                width: '100%',
                border: '1px solid #D3C6C6',
                boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)',
                borderRadius: '16px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
            }}
                style={{
                    backgroundColor: '#ffffff'
                }}>
                <form onSubmit={handleSubmit}>
                    <Typography textAlign="center" variant="h6" sx={{ flexGrow: 1, p: '2rem' }} > create channel</Typography>
                    <Divider />

    
                    <Button variant="outlined" type='submit' sx={{ flexGrow: 1, mt: '10px', width: '100%', height: '30px' }}>Create</Button>
                    <Divider />
                </form>
                <Button onClick={handleClose}>Close</Button>
            </Box>
        </Container>
    )
}