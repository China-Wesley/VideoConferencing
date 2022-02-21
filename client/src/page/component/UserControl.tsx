/* eslint-disable @typescript-eslint/no-unused-expressions */
import React, { useState, useContext, useRef } from 'react';
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
  PlayCircleFilledWhite as PlayCircleFilledWhiteIcon,
  PauseCircle as PauseCircleIcon,
  RadioButtonChecked as RadioButtonCheckedIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import useDialog from '../hook/useDialog';
import { User as UserContext, Room as RoomContext } from '../../context/index';
import useMessage from '../hook/useMessage';

const commonBtnStyle = {
  height: '100%',
  color: '#b0bec5',
  width: '75px',
};
interface UserControlProps {
  onDrawerOpen: (tabValue: number) => void;
  onExitRoom: () => void;
  onShareScreen: () => Promise<any>;
  onPause: (kind: string) => void;
  onContinue: (kind: string) => void;
  onAddNewTrack: (kind: string, isScreen?: boolean) => Promise<any>;
  onStopShareScreen: () => void;
  camOpen: boolean;
  micOpen: boolean;
  socket: any;
}

export default function UserControl(props: UserControlProps) {
  const {
    micOpen,
    onStopShareScreen,
    camOpen, onDrawerOpen, onExitRoom, onShareScreen, onPause, onContinue, onAddNewTrack, socket,
  } = props;
  const [videoOpen, setVideoOpen] = useState(camOpen);
  const [audioOpen, setAudioOpen] = useState(micOpen);
  const [pauseScreen, setPauseScreen] = useState(false);
  const [isSharingScreen, setIsShareScreen] = useState(false);
  const { room } = useContext(RoomContext);
  const screenProducers: any = useRef();
  const { user, setUser } = useContext(UserContext);
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
            if (!videoOpen) {
              onContinue('video');
            } else {
              onPause('video');
            }
            if (!user.defaultCam) {
              onAddNewTrack('video').then(() => {
                setUser({ ...user, camOpen: !videoOpen, defaultCam: !user.defaultCam });
                setVideoOpen(!videoOpen);
              }).catch(() => {
                useMessage('开启视频失败，请重试！');
              });
            } else {
              setVideoOpen(!videoOpen);
              setUser({ ...user, camOpen: !videoOpen });
            }
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
            if (!audioOpen) {
              onContinue('audio');
            } else {
              onPause('audio');
            }
            if (!user.defaultMic) {
              onAddNewTrack('audio');
              setUser({ ...user, micOpen: !audioOpen, defaultMic: !user.defaultMic });
            } else {
              setAudioOpen(!audioOpen);
              setUser({ ...user, micOpen: !audioOpen });
            }
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
        <IconButton
          className="control-btn"
          sx={commonBtnStyle}
          onClick={() => {
            const producers = screenProducers.current;
            if (producers) {
              if (!pauseScreen) {
                producers.forEach((produce: any) => {
                  produce.pause();
                });
              } else {
                producers.forEach((produce: any) => {
                  produce.resume();
                });
              }
            }
            setPauseScreen(!pauseScreen);
          }}
        >
          {
            isSharingScreen && (
              pauseScreen ? (
                <PlayCircleFilledWhiteIcon />
              ) : (
                <PauseCircleIcon sx={{ color: '#dd2c00' }} />
              )
            )
          }
        </IconButton>
      </Stack>
      <Stack direction="row" className="userControl">
        <IconButton
          className="control-btn"
          sx={commonBtnStyle}
          onClick={() => {
            const textarea = document.createElement('textarea');
            document.body.appendChild(textarea);
            // 隐藏此输入框
            textarea.style.position = 'fixed';
            textarea.style.clip = 'rect(0 0 0 0)';
            textarea.style.top = '10px';
            // 赋值
            textarea.value = `Hi，你好。\n现邀请您加入本场会议\n会议链接：${window.location.href}\n房间号：${room.roomId}`;
            // 选中
            textarea.select();
            // 复制
            if (document.execCommand('copy')) {
              document.execCommand('copy', true);
              useMessage('邀请信息已复制，快去发送给别人吧～');
            }
          }}
        >
          <PersonAddIcon />
        </IconButton>
        <IconButton
          className="control-btn"
          sx={commonBtnStyle}
          onClick={() => {
            onDrawerOpen(0);
          }}
        >
          <InterpreterModeIcon />
        </IconButton>
        <IconButton
          className="control-btn"
          sx={{ ...commonBtnStyle, color: '#00c853' }}
          onClick={() => {
            if (!isSharingScreen) {
              onShareScreen().then((produces: any[]) => {
                screenProducers.current = produces;
                setIsShareScreen(!isSharingScreen);
              }).catch(() => {
                useMessage('共享屏幕失败！', { type: 'error' });
              });
            } else {
              onStopShareScreen();
              socket.socketEmit('close', { isScreen: true }).then(() => {
                screenProducers.current.forEach((producer: any) => {
                  // console.log('close');
                  producer.close();
                });
              }).catch(() => {
                screenProducers.current.forEach((producer: any) => {
                  // console.log('close');
                  producer.close();
                });
              });
              setIsShareScreen(!isSharingScreen);
            }
          }}
        >
          {
            isSharingScreen ? (
              <RadioButtonCheckedIcon sx={{ color: '#dd2c00' }} />
            ) : (
              <ScreenShareIcon />
            )
          }
        </IconButton>
        <IconButton
          className="control-btn"
          sx={commonBtnStyle}
          onClick={() => {
            onDrawerOpen(1);
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
