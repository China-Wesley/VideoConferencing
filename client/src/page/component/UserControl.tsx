import React, { useState } from 'react';
import {
  Box, Button, IconButton, Stack,
} from '@mui/material';
import {
  Videocam as VideocamIcon,
  VideocamOff as VideocamOffIcon,
  MicSharp as MicSharpIcon,
  MicOffSharp as MicOffSharpIcon,
  LogoutSharp as LogoutSharpIcon,
  PersonAdd as PersonAddIcon,
  InterpreterMode as InterpreterModeIcon,
  ScreenShare as ScreenShareIcon,
  Forum as ForumIcon,
  MoreHoriz as MoreHorizIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import useDialog from '../hook/useDialog';

const commonBtnStyle = {
  height: '100%',
  color: '#b0bec5',
  width: '75px',
};

interface UserControlProps {
  onDrawerOpen: () => void;
  onExitRoom: () => void;
  onShareScreen: () => void;
}

export default function UserControl(props: UserControlProps) {
  const { onDrawerOpen, onExitRoom, onShareScreen } = props;
  const [videoOpen, setVideoOpen] = useState(true);
  const [audioOpen, setAudioOpen] = useState(true);
  const navigate = useNavigate();
  return (
    <Box
      component="footer"
      sx={{
        // position: 'absolute',
        // bottom: 0,
        backgroundColor: 'rgb(37,37,37)',
        width: 1,
        height: '75px',
        display: 'flex',
        justifyContent: 'space-between',
      }}
    >
      <Stack direction="row" className="videoControl">
        <IconButton
          className="control-btn"
          onClick={() => {
            setVideoOpen(!videoOpen);
          }}
          sx={commonBtnStyle}
        >
          {
                videoOpen ? (<VideocamIcon />) : (
                  <VideocamOffIcon sx={{ color: '#dd2c00' }} />
                )
            }
        </IconButton>
        <IconButton
          className="control-btn"
          onClick={() => {
            setAudioOpen(!audioOpen);
          }}
          sx={commonBtnStyle}
        >
          {
                audioOpen ? (
                  <MicSharpIcon />
                ) : (
                  <MicOffSharpIcon sx={{ color: '#dd2c00' }} />
                )
            }
        </IconButton>
      </Stack>
      <Stack direction="row" className="userControl">
        <IconButton className="control-btn" sx={commonBtnStyle}>
          <PersonAddIcon />
        </IconButton>
        <IconButton
          className="control-btn"
          sx={commonBtnStyle}
          onClick={() => {
            onDrawerOpen();
          }}
        >
          <InterpreterModeIcon />
        </IconButton>
        <IconButton
          className="control-btn"
          sx={{ ...commonBtnStyle, color: '#00c853' }}
          onClick={() => {
            onShareScreen();
          }}
        >
          <ScreenShareIcon />
        </IconButton>
        <IconButton
          className="control-btn"
          sx={commonBtnStyle}
          onClick={() => {
            onDrawerOpen();
          }}
        >
          <ForumIcon />
        </IconButton>
        <IconButton className="control-btn" sx={commonBtnStyle}>
          <MoreHorizIcon />
        </IconButton>
      </Stack>
      <Button
        onClick={() => {
          useDialog('确定要退出房间吗？', {
            onConfirm: () => {
              onExitRoom();
              navigate('/createRoom', { replace: true });
            },
            title: '提示',
          });
        }}
        className="control-btn"
        color="error"
        sx={{ padding: '0 20px' }}
      >
        <LogoutSharpIcon />
        退出
      </Button>
    </Box>
  );
}
