import React from 'react';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import NoMatchImage from '../static/404.png';

export default function NoMatch() {
  return (
    <Paper
      elevation={5}
      sx={{
        width: '60%',
        position: 'absolute',
        overflow: 'hidden',
        left: '50%',
        top: '50%',
        transform: 'translate(-50%, -50%)',
        background: 'rgba(255, 255, 255, 0.9)',
        padding: 5,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      <Typography
        variant="h2"
        gutterBottom
        component="div"
        sx={{
          color: '#ef5350',
          fontWeight: '600',
          textAlign: 'center',
        }}
      >
        404
      </Typography>
      <img
        src={NoMatchImage}
        alt="404"
        className="noMatchImage"
        style={{
          marginBottom: '20px',
          width: '60%',
          maxWidth: '600px',
        }}
      />
      <Typography
        variant="h4"
        gutterBottom
        component="div"
        sx={{
          textAlign: 'center',
          fontWeight: '600',
        }}
      >
        亲爱的，你访问的页面不存在～
      </Typography>
    </Paper>
  );
}
