import React from 'react';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import logo200 from '../static/logo200.png';

export default function NavBar() {
  return (
    <Grid
      xs={12}
      sx={{
        paddingTop: 1,
        paddingBottom: 1,
      }}
      container
      item
      className="video-conferencing-navbar"
    >
      <Grid
        xs={1}
        sx={{
          display: 'flex',
          justifyContent: 'center',
        }}
        container
        item
      >
        <Box
          component="img"
          sx={{
            width: 50,
            height: 50,
          }}
          alt="Logo"
          src={logo200}
        />
      </Grid>
      <Grid xs={4} container item className="">
        <Box
          component="h1"
          sx={{
            fontSize: 20,
            color: '#fff',
          }}
        >
          Jmu Video Conferencing
        </Box>
      </Grid>
    </Grid>
  );
}
