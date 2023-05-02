import React, { useEffect, useState } from "react";
import apiClient from "../auth/interceptor.axios";
import { Paper, Table, TableCell, TableContainer, TableHead, TableRow, TableBody, Button, Grid, Link } from "@mui/material";
import { Link as LinkRouter } from "react-router-dom";
import { TablePagination } from "@mui/material";

import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import { Channel, UserInfo } from "../types";





export function ChannelsList( { channels }: { channels : Channel[] }) {

    const rows = channels.map((channel : Channel) => {
        return {
            channelId: channel.channelId,
            channelName: channel.channelName,
            private : channel.private,
            password : channel.password,
        }
    });


	return (
		<div>

			<TableContainer component={Paper}>
				<Table sx={{ minWidth: 650 }} size="small" aria-label="a dense table">
					<TableHead>
						<TableRow>
							<TableCell align="left">channelId</TableCell>
							<TableCell align="right">ChannelName</TableCell>
							<TableCell align="right">Private</TableCell>
							<TableCell align="right">Password</TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
                    {rows?.map((row) => (
							<TableRow
								key={row.channelId}
								sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
							>
								
								<TableCell align="right">{row.channelName}</TableCell>
								<TableCell align="right">{row.private}</TableCell>
								<TableCell align="right">{row.password}</TableCell>
							</TableRow>
                        )
                        )}
					</TableBody>
				</Table>
    </TableContainer>
		</div>
	);
}
