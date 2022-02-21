/* eslint-disable react/jsx-props-no-spreading */
import React from 'react';
import Box from '@mui/material/Box';
import {
  Videocam as VideocamIcon,
  VideocamOff as VideocamOffIcon,
  MicSharp as MicSharpIcon,
  MicOffSharp as MicOffSharpIcon,
} from '@mui/icons-material';
import CAvatar from './Avatar';

export default function MemberList(props: any) {
  const { memberInfo = {} } = props;
  const { userInfo: { userName }, micOpen = true, camOpen = true } = memberInfo;
  console.log(memberInfo, 'memberInfo--->');
  return (
    <Box sx={{
      padding: '15px 30px', color: '#b0bec5', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <CAvatar
          sx={{
            marginRight: 2,
            fontSize: '14px',
          }}
          name={userName}
        />
      </Box>
      <Box sx={{ minWidth: '65px', display: 'flex', justifyContent: 'space-between' }}>
        {
            camOpen ? (<VideocamIcon />) : (
              <VideocamOffIcon sx={{ color: '#dd2c00' }} />
            )
        }
        {
            micOpen ? (
              <MicSharpIcon />
            ) : (
              <MicOffSharpIcon sx={{ color: '#dd2c00' }} />
            )
        }
      </Box>
    </Box>
  );
}
