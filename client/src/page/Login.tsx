/* eslint-disable react/jsx-closing-tag-location */
/* eslint-disable react/jsx-props-no-spreading */
import React, { useEffect, useState, useContext } from 'react';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import Cookie from 'js-cookie';
import { getGuGongImage } from '../utils/gugong_wallImage';
import { loadImage } from '../utils/utils';
import axios from '../utils/interceptor';
import { serve } from '../const/api';
import useMessage from './hook/useMessage';
// import useAnimation from './hook/useAnimation';
import logo200 from '../static/logo200.png';
import { User } from '../context/index';

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

const nameRegister = {
  minLength: {
    value: 3,
    message: '用户名不能少于3位',
  },
  maxLength: {
    value: 10,
    message: '用户名不能多于10位',
  },
};

const passwordHelpText = '密码为6-18位之间的任意字符';

const nameHelpText = '用户名为3-10位之间的任意字符';

export default function Login() {
  const {
    register, handleSubmit, formState: { errors }, reset, setError,
  } = useForm();
  const [backgroundImage, setBackgroundImage] = useState('');
  const [isSign, setIsSign] = useState(false);
  const { setUser } = useContext(User);
  const navigate = useNavigate();

  useEffect(() => {
    getGuGongImage().then((imageUrl: string) => {
      loadImage(imageUrl).then(() => {
        setBackgroundImage(imageUrl);
      }).catch(() => {
        // 监控
      });
    });
    const vuser = Cookie.get('vuser');
    if (vuser) {
      navigate('/createRoom', { replace: true });
    }
    return () => {
      // cleanup
    };
  }, []);

  const changeTemplate = () => {
    setIsSign(!isSign);
    reset(); // 切换登录/注册时重置表单
  };

  const loginIn = (data: any) => {
    const { userName, userPassword } = data;
    axios.post(`${serve.domain}/user/login`, {
      name: userName,
      password: userPassword,
    }).then((res: any) => {
      if (res && res.code === 1) {
        useMessage(res.message, {
          type: 'success',
        });
        navigate('/createRoom', { replace: false });
        setUser(res.data);
      } else {
        useMessage(res.message, {
          type: 'error',
        });
      }
    }).catch((error) => {
      useMessage(`${error.message}::网络错误`, {
        type: 'error',
      });
    });
  };

  const signUp = (data: any) => {
    const { signUserName, signUserPassword, confirmUserPassword } = data;
    if (signUserPassword !== confirmUserPassword) {
      setError('signUserPassword', { message: '前后输入的密码需一致！' });
      setError('confirmUserPassword', { message: '前后输入的密码需一致！' });
    } else {
      axios.post(`${serve.domain}/user/sign`, {
        name: signUserName,
        password: confirmUserPassword,
      }).then((res: any) => {
        if (res && res.code === 1) {
          useMessage(res.message, {
            type: 'success',
          });
          navigate('/createRoom', { replace: true });
          setUser(res.data);
        } else {
          useMessage(res.message, {
            type: 'error',
          });
        }
      }).catch((error) => {
        useMessage(`${error.message}::网络错误`, {
          type: 'error',
        });
      });
    }
  };

  return (
    <div className="user-login">
      {backgroundImage && <img className="login_background" src={backgroundImage} alt="background" />}
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
        <Box
          component="img"
          sx={{
            // width: 0.05,
            // height: 1,
            // marginLeft: '10px',
            position: 'absolute',
            right: '40px',
            top: '40px',
            minWidth: '50px',
            width: '10%',
          }}
          alt="Logo"
          src={logo200}
        />
        {/** *********************** 登录 ************************** */}
        {/* {!isSign && useAnimation(
          ( */}
        {
          !isSign && (
            <Box
              component="form"
              onSubmit={handleSubmit(loginIn)}
              sx={{
                float: 'left',
              }}
            >
              <Typography variant="h5" gutterBottom component="div">
                登录
              </Typography>
              <Typography
                variant="subtitle2"
                gutterBottom
                component="div"
                sx={{
                  marginBottom: 3,
                }}
              >
                没有帐号，去注册
                <Button onClick={changeTemplate}>
                  Sign Up
                </Button>
              </Typography>
              <TextField
                error={Boolean(errors.userName)}
                sx={{
                  width: '100%',
                  marginBottom: 2,
                }}
                // id="outlined-basic"
                label="帐号"
                variant="outlined"
                helperText={
                  errors.userName ? errors.userName.message : nameHelpText
                }
                {...register('userName', { required: '用户名不能为空！', ...nameRegister })}
              />
              <TextField
                error={Boolean(errors.userPassword)}
                sx={{
                  width: '100%',
                  marginBottom: 2,
                }}
                // id="outlined-basic"
                label="密码"
                type="password"
                variant="outlined"
                helperText={
                  errors.userPassword ? errors.userPassword.message : passwordHelpText
                }
                {...register('userPassword', { required: '密码不能为空！', ...passwordRegister })}
              />
              <Button onClick={changeTemplate}>
                忘记密码？
              </Button>
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{
                  marginTop: 2,
                }}
              >
                登录
              </Button>
            </Box>
          )
        }

        {/** ************************ 注册 ************************* */}

        {isSign && (
        <Box
          component="form"
          onSubmit={handleSubmit(signUp)}
          sx={{
            float: 'left',
          }}
        >
          <Typography variant="h5" gutterBottom component="div">
            注册
          </Typography>
          <Typography
            variant="subtitle2"
            gutterBottom
            component="div"
            sx={{
              marginBottom: 3,
            }}
          >
            已有帐号，去登录
            <Button onClick={changeTemplate}>
              Login In
            </Button>
          </Typography>
          <TextField
            error={Boolean(errors.signUserName)}
            sx={{
              width: '100%',
              marginBottom: 2,
            }}
            label="帐号"
            variant="outlined"
            helperText={
              errors.signUserName ? errors.signUserName.message : nameHelpText
            }
            {...register('signUserName', { required: '用户名不能为空！', ...nameRegister })}
          />
          <TextField
            error={Boolean(errors.signUserPassword)}
            sx={{
              width: '100%',
              marginBottom: 2,
            }}
            label="密码"
            type="password"
            variant="outlined"
            helperText={
              errors.signUserPassword ? errors.signUserPassword.message : passwordHelpText
            }
            {...register('signUserPassword', {
              required: '密码不能为空！',
              ...passwordRegister,
            })}
          />
          <TextField
            error={Boolean(errors.confirmUserPassword)}
            sx={{
              width: '100%',
              marginBottom: 2,
            }}
            label="确认密码"
            type="password"
            variant="outlined"
            helperText={
              errors.confirmUserPassword ? errors.confirmUserPassword.message : ''
            }
            {...register('confirmUserPassword', {
              required: '确认密码不能为空！',
              ...passwordRegister,
            })}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{
              marginTop: 2,
            }}
          >
            立即注册
          </Button>
        </Box>
        )}
      </Paper>
    </div>
  );
}
