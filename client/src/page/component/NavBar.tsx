import React from 'react';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import logo200 from '../../static/logo200.png';

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
      <Box
        component="img"
        sx={{
          width: 0.05,
          // height: 1,
          marginLeft: '10px',
        }}
        alt="Logo"
        src={logo200}
      />
    </Grid>
  );
}
