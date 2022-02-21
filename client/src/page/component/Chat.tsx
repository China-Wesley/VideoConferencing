/* eslint-disable react/jsx-props-no-spreading */
import React, { useContext } from 'react';
import Box from '@mui/material/Box';
import { User as UserContext } from '../../context/index';
import CAvatar from './Avatar';

export default function Chat(props: any) {
  const { chatInfo = {} } = props;
  const {
    userName, time, userId, message,
  } = chatInfo;
  const { user } = useContext(UserContext);
  const isSelf = userId === user.uuid;
  return (
    <Box sx={{ padding: '10px', overflow: 'hidden' }}>
      <Box sx={{
        color: '#b0bec5', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}
      >
        <Box sx={{
          display: 'flex', width: '100%', alignItems: 'center', flexDirection: (isSelf ? 'row-reverse' : 'row'),
        }}
        >
          <CAvatar
            sx={{
              marginRight: (isSelf ? 0 : 2),
              marginLeft: (isSelf ? 2 : 0),
              fontSize: '14px',
            }}
            name={userName}
          />
          <Box sx={{
            background: '#121212', borderRadius: 1, p: 1, wordBreak: 'break-all',
          }}
          >
            {message}
          </Box>
        </Box>
      </Box>
      <Box sx={{
        fontSize: '12px',
        padding: '0 60px',
        float: (isSelf ? 'right' : 'left'),
        marginTop: '5px',
        color: '#b0bec5',
      }}
      >
        {time}
      </Box>
    </Box>
  );
}
