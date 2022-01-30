/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react/jsx-props-no-spreading */
import React, { useState } from 'react';
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
import logo200 from '../static/logo200.png';

export default function CreateRoom() {
  const [layout, setLayout] = useState('basic');
  const [codeRequire, setCodeRequire] = useState(false);
  const navigate = useNavigate();

  const {
    register,
    formState: { errors },
    handleSubmit,
    // reset, setError,
  } = useForm();

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
              onSubmit={handleSubmit(() => {
                console.log('进入房间咯');
              })}
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
                error={Boolean(errors.createRomId)}
                sx={{
                  width: '100%',
                  marginBottom: 2,
                }}
                  // id="outlined-basic"
                label="房间号"
                variant="outlined"
                helperText={
                    errors.createRomId ? errors.createRomId.message : ''
                  }
                {...register('createRomId', { required: '房间号不能为空！' })}
              />
              <TextField
                error={Boolean(errors.roomCode)}
                sx={{
                  width: '100%',
                  marginBottom: 2,
                }}
                disabled={!codeRequire}
                  // id="outlined-basic"
                label={codeRequire ? '房间密码' : '无密码'}
                variant="outlined"
                {...register('roomCode')}
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
            onSubmit={handleSubmit(() => {
              console.log('进入房间咯');
              navigate('/room:id', { replace: true });
            })}
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
                    errors.roomId ? errors.roomId.message : ''
                  }
              {...register('roomId', { required: '房间号不能为空！' })}
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
