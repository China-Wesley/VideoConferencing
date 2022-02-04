/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react/jsx-props-no-multi-spaces */
import React, {
  useRef, useState, useEffect, useContext,
} from 'react';
import Paper from '@mui/material/Paper';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { useNavigate } from 'react-router-dom';
import useMessage from './hook/useMessage';
import Videox from './component/Videox';
import { getMedia } from '../utils/utils';
import { RTCStream, Room } from '../context/index';
// import useConnect from './hook/useConnect';

const defaultMediaContain = {
  video: true,
  audio: true,
};

export default function MediaTest() {
  const testVideo: any = useRef();
  const [micOpen, setMicOpen] = useState(true);
  const [camOpen, setCamOpen] = useState(true);
  const { setRTCStream } = useContext(RTCStream);
  const { room } = useContext(Room);
  const RtcStream: any = useRef();
  const navigate = useNavigate();

  const videoPlay = () => {
    const video = testVideo.current.current;

    if ('srcObject' in video) {
      video.srcObject = RtcStream.current;
    } else {
      // 避免在新的浏览器中使用它，因为它正在被弃用。
      video.src = window.URL.createObjectURL(RtcStream.current);
    }
    const loadedFunc = () => {
      video.play();
      video.addEventListener('loadedmetadata', loadedFunc);
    };
    video.addEventListener('loadedmetadata', loadedFunc);
  };

  const setVideoMedia = (mediaContain?: any) => {
    const config = { ...defaultMediaContain, ...mediaContain };
    getMedia(config).then((stream: any) => {
      RtcStream.current = stream;
      videoPlay();
    }).catch((error) => {
      useMessage(`获取 摄像头/麦克风 数据失败${error.message}`, {
        type: 'error',
      });
    });
  };

  const adjuestMediaTrack = (kind: string, shouldOpen?: boolean) => {
    if (shouldOpen) {
      getMedia({ [kind]: true }).then((stream: any) => {
        const tracks = stream.getTracks();
        tracks.forEach((track: any) => {
          RtcStream.current && RtcStream.current.addTrack(track);
        });
      });
    } else {
      const tracks = RtcStream.current && RtcStream.current.getTracks().filter((track: any) => {
        if (track.kind === kind) {
          return track;
        }
        return false;
      });
      tracks && tracks.forEach((track: any) => {
        RtcStream.current && RtcStream.current.removeTrack(track);
      });
      videoPlay();
    }
  };

  useEffect(() => {
    setVideoMedia();
  }, []);

  return (
    <Paper
      elevation={5}
      sx={{
        width: '30%',
        position: 'absolute',
        overflow: 'hidden',
        left: '50%',
        top: '50%',
        transform: 'translate(-50%, -50%)',
        background: 'rgba(255, 255, 255, 0.9)',
        padding: 5,
      }}
    >
      <Typography
        variant="h5"
        gutterBottom
        component="div"
        sx={{
          marginBottom: '15px',
        }}
      >
        检查设备
      </Typography>
      <Videox
        ref={testVideo}
        width="100%"
        micOpen={micOpen}
        camOpen={camOpen}
        style={{
          backgroundColor: '#000',
          width: '100%',
          marginBottom: '20px',
        }}
      />
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          width: '100%',
          marginBottom: '20px',
        }}
      >
        <FormGroup>
          <FormControlLabel
            control={(
              <Switch
                checked={micOpen}
                onChange={(event: any) => {
                  setMicOpen(event.target.checked);
                  adjuestMediaTrack('audio', event.target.checked);
                }}
              />
            )}
            label="入会开启麦克风"
          />
          <FormControlLabel
            control={(
              <Switch
                checked={camOpen}
                onChange={(event: any) => {
                  setCamOpen(event.target.checked);
                  adjuestMediaTrack('video', event.target.checked);
                }}
              />
            )}
            label="入会开启视频"
          />
        </FormGroup>
      </Box>
      <Button
        variant="contained"
        fullWidth
        onClick={() => {
          setRTCStream(RtcStream.current);
          room && room.roomId && navigate(`/room/${room.roomId}`);
        }}
      >
        确认
      </Button>
    </Paper>
  );
}
