import React, { FC, ReactElement, createContext, useContext, useState } from 'react'

import { AppBar, Box, Container, Grid, Typography, autocompleteClasses } from '@mui/material'
import { Link } from 'react-router-dom'
import styled from '@emotion/styled'

const CustomLink = styled(Link)
({
    textDecoration: 'none',
    color: 'white',
    '&:hover': {
        textDecoration: 'none',
        color: 'white',
    }
})

export function Footer() {
    return (
        <AppBar position="fixed" color="primary" sx={{ top: 'auto', bottom: 0 }}>
            <Container maxWidth="lg" >
                <Grid container direction="column" alignItems="center">
                    <Grid item xs={12}>
                        <Typography color="white" variant="subtitle1">
                            {`${new Date().getFullYear()} | Made with ❤️ by `}
                        </Typography>
                    </Grid>
                    <Grid item xs={12}>
                        <CustomLink to="https://github.com/Fredo971" target="_blank"> Fle-blay </CustomLink>
                        <CustomLink to="https://github.com/ImHoppy" target="_blank"> Mbraets </CustomLink>
                        <CustomLink to="https://github.com/jremy42" target="_blank"> Jremy </CustomLink>
                    </Grid>
                </Grid>
            </Container>
        </AppBar>
    )
}


