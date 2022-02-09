/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react/jsx-props-no-spreading */
import React, { useState, useContext } from 'react';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import { useForm } from 'react-hook-form';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import { useNavigate } from 'react-router-dom';
import axios from '../utils/interceptor';
import { serve } from '../const/api';
import useMessage from './hook/useMessage';
import { Room, User } from '../context/index';
import logo200 from '../static/logo200.png';

const passwordRegister = {
  minLength: {
    value: 6,
    message: '密码不能少于6位',
  },
  maxLength: {
    value: 18,
    message: '密码不能多于18位',
  },
};

const roomIdRegister = {
  minLength: {
    value: 6,
    message: '房间号为6位数字！',
  },
  maxLength: {
    value: 6,
    message: '房间号为6位数字！',
  },
};

export default function CreateRoom() {
  const [layout, setLayout] = useState('basic');
  const [codeRequire, setCodeRequire] = useState(false);
  const { setRoom } = useContext(Room);
  const { user, setUser } = useContext(User);
  const navigate = useNavigate();

  const {
    register,
    formState: { errors },
    handleSubmit,
    // reset, setError,
  } = useForm();

  const handelCreateRoom = (data: any) => {
    axios.post(`${serve.domain}/room/createRoom`, { ...data, userId: user.uuid }).then((res: any) => {
      if (res && res.code === 1) {
        useMessage(res.message, { type: 'success' });
        setRoom(res.data);
        navigate('/mediaTest', { replace: true });
      } else {
        useMessage(res.message, { type: 'error' });
      }
    }).catch((error) => {
      useMessage(`${error.message}::网络错误`, { type: 'error' });
    });
  };

  const handelJoinRoom = (data: any) => {
    axios.post(`${serve.domain}/room/enterRoom`, { ...data, userId: user.uuid }).then((res: any) => {
      if (res && res.code === 1) {
        useMessage(res.message, { type: 'success' });
        setRoom(res.data);
        navigate('/mediaTest', { replace: true });
      } else {
        useMessage(res.message, { type: 'error' });
      }
    }).catch((error) => {
      useMessage(`${error.message}::网络错误`, { type: 'error' });
    });
  };

  return (
    <div>
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
        {
          layout === 'basic' && (
          <Box component="div">
            <Typography
              variant="h5"
              gutterBottom
              component="div"
              sx={{
                marginBottom: '15px',
              }}
            >
              选择房间
            </Typography>
            <Button
              variant="outlined"
              fullWidth
              onClick={() => {
                setLayout('create');
              }}
            >
              创建房间
            </Button>
            <Box
              component="div"
              sx={{
                padding: '10px 0',
                textAlign: 'center',
                fontWeight: '600',
                fontSize: '14px',
              }}
            >
              或者
            </Box>
            <Button
              variant="contained"
              fullWidth
              onClick={() => {
                setLayout('enter');
              }}
            >
              加入房间
            </Button>
          </Box>
          )
        }
        {
          layout === 'create' && (
            <Box
              component="form"
              onSubmit={handleSubmit(handelCreateRoom)}
            >
              <Typography
                variant="h5"
                gutterBottom
                component="div"
                sx={{
                  marginBottom: '15px',
                }}
              >
                创建房间
              </Typography>
              <Button
                sx={{ position: 'absolute', right: '20px', top: '20px' }}
                onClick={() => {
                  setLayout('basic');
                }}
              >
                <ExitToAppIcon />
              </Button>
              <TextField
                error={Boolean(errors.roomCode)}
                sx={{
                  width: '100%',
                  marginBottom: 2,
                }}
                disabled={!codeRequire}
                  // id="outlined-basic"
                label={codeRequire ? '房间密码' : '无密码'}
                helperText={
                  errors.roomCode ? errors.roomCode.message : '密码位6-18位任意字符！'
                }
                variant="outlined"
                {...register('roomCode', { required: (codeRequire ? '密码不能为空！' : false), ...passwordRegister })}
              />
              <FormControlLabel
                control={(
                  <Switch
                    checked={codeRequire}
                    onChange={() => {
                      setCodeRequire(!codeRequire);
                    }}
                    name="gilad"
                  />
                )}
                label="设置房间密码"
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{
                  marginTop: 2,
                }}
              >
                创建房间
              </Button>
            </Box>
          )
        }
        {
          layout === 'enter' && (
          <Box
            component="form"
            onSubmit={handleSubmit(handelJoinRoom)}
          >
            <Typography
              variant="h5"
              gutterBottom
              component="div"
              sx={{
                marginBottom: '15px',
              }}
            >
              加入房间
            </Typography>
            <Button
              sx={{ position: 'absolute', right: '20px', top: '20px' }}
              onClick={() => {
                setLayout('basic');
              }}
            >
              <ExitToAppIcon />
            </Button>
            <TextField
              error={Boolean(errors.roomId)}
              sx={{
                width: '100%',
                marginBottom: 2,
              }}
                  // id="outlined-basic"
              label="房间号"
              variant="outlined"
              helperText={
                    errors.roomId ? errors.roomId.message : '房间号为6位数字'
                  }
              {...register('roomId', { required: '房间号不能为空！', ...roomIdRegister })}
            />
            <TextField
              error={Boolean(errors.enterRoomCode)}
              sx={{
                width: '100%',
                marginBottom: 2,
              }}
                  // id="outlined-basic"
              label="密码"
              variant="outlined"
              helperText={
                    errors.enterRoomCode ? errors.enterRoomCode.message : '密码可以为空'
              }
              {...register('enterRoomCode', { required: false, ...passwordRegister })}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{
                marginTop: 2,
              }}
            >
              进入房间
            </Button>
          </Box>
          )
        }
      </Paper>
    </div>
  );
}
