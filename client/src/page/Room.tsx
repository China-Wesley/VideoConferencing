/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable jsx-a11y/media-has-caption */
/* eslint-disable react/jsx-props-no-spreading */
/* eslint-disable no-sparse-arrays */
import React, {
  useState, useEffect, useContext,
} from 'react';
import { styled, useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Avatar from '@mui/material/Avatar';
import {
  Videocam as VideocamIcon,
  VideocamOff as VideocamOffIcon,
  MicSharp as MicSharpIcon,
  MicOffSharp as MicOffSharpIcon,
} from '@mui/icons-material';
import UserControl from './component/UserControl';
import TabPanel from './component/TabPanel';
import { RTCStream as RTCStreamContext, Room as RoomContext } from '../context/index';
import useConnect from './hook/useConnect';
import usePublish from './hook/usePublish';
import useSubscribe from './hook/useSubscribe';
import Videox from './component/Videox';

const drawerWidth = 400;

function stringToColor(string: string) {
  let hash = 0;
  let i;
  /* eslint-disable no-bitwise */
  for (i = 0; i < string.length; i += 1) {
    hash = string.charCodeAt(i) + ((hash << 5) - hash);
  }
  let color = '#';
  for (i = 0; i < 3; i += 1) {
    const value = (hash >> (i * 8)) & 0xff;
    color += `00${value.toString(16)}`.substr(-2);
  }
  /* eslint-enable no-bitwise */

  return color;
}

function stringAvatar(name: string) {
  return {
    children: `${name.split(' ')[0][0]}${name.split(' ')[1][0]}`,
  };
}

const Main = styled('main', { shouldForwardProp: (prop) => prop !== 'open' })<{
  open?: boolean;
}>(({ theme, open }) => ({
  flexGrow: 1,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  transition: theme.transitions.create('margin', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  marginRight: -drawerWidth,
  ...(open && {
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
    marginRight: 0,
  }),
}));

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-start',
  ...theme.mixins.toolbar,
}));

export default function PersistentDrawerRight() {
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const { RTCStream } = useContext(RTCStreamContext);
  const { room } = useContext(RoomContext);
  const [videoSources, setVideoSources] = useState([] as any);
  //   const peimaryVideo: any = useRef();

  const getRoomId = () => {
    if (room && room.roomId) {
      return room.roomId;
    }
    const location = window.location.pathname;
    const paths = location.split('/') || [];
    return paths[(paths.length - 1) >= 0 ? (paths.length - 1) : 0];
  };

  useEffect(() => {
    // peimaryVideo.current && (peimaryVideo.current.srcObject = RTCStream);

    // connect
    const {
      socketConnected, socketDisconnect, socketError,
    } = useConnect({ path: `/${getRoomId()}` });

    socketConnected((device: any, socket: any) => {
      console.log('connected', device, socket);
      // publish
      usePublish({ device, socket, stream: RTCStream })
        .then(() => useSubscribe({ device, socket }))
        .then((subScribe: any) => {
          const { stream } = subScribe;
          setVideoSources([...videoSources, stream]);
          //   console.log(stream, window.URL.createObjectURL(stream));
        //   peimaryVideo.current.srcObject = stream;
        //   console.log(stream.getVideoTracks(), 123123);
        })
        .catch((error: any) => {
          console.log(error, 'error--->');
        });
    });
    socketDisconnect(() => {
      console.log('disconnect');
    });
    socketError(() => {
      console.log('error');
    });

    // subscribe
  }, []);

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <Box
      sx={{
        display: 'flex',
        width: 1,
        height: 1,
        backgroundColor: 'rgba(0,0,0,0.8)',
      }}
    >
      <Main open={open}>
        <Box sx={{
          display: 'flex', overflowX: 'auto', justifyContent: 'center', flex: '1', padding: '10px 0',
        }}
        >
          {
            videoSources.map((item: any) => (
              <Box
                key={item.id}
                sx={{
                  flex: '0 0 200px', height: '100%', backgroundColor: '#ccc', margin: '0 5px',
                }}
              >
                {item[0]}
                {/* <video style={{ width: '100%', height: '100%', backgroundColor: '#000' }} autoPlay src="" /> */}
                <Videox
                    // ref={testVideo}
                  width="100%"
                  height="100%"
                  micOpen
                  camOpen
                  stream={item}
                />
              </Box>
            ))
        }
        </Box>
        <Box sx={{
          display: 'flex', overflowX: 'scroll', justifyContent: 'center', flex: '6',
        }}
        >
          <Videox
              // ref={testVideo}
            width="100%"
            height="100%"
            micOpen
            camOpen
            stream={RTCStream}
            style={{
              video: {
                maxHeight: '100%',
              },
            }}
          />
        </Box>
        <UserControl onDrawerOpen={handleDrawerOpen} />
      </Main>
      <Drawer
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
          },
        }}
        variant="persistent"
        anchor="right"
        open={open}
      >
        <DrawerHeader>
          <IconButton onClick={handleDrawerClose} sx={{ color: '#b0bec5' }}>
            {theme.direction === 'rtl' ? <ChevronLeftIcon /> : <ChevronRightIcon />}
          </IconButton>
        </DrawerHeader>
        <Tabs value={tabValue} onChange={handleChange} sx={{ p: '0 30px' }}>
          <Tab sx={{ color: '#b0bec5' }} label="成员列表" />
          <Tab sx={{ color: '#b0bec5' }} label="聊天记录" />
        </Tabs>
        <TabPanel index={0} value={tabValue}>
          {
                [1, 2, 3, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,,1, 1, 1, 1, 1].map(() => (
                  <Box sx={{
                    padding: '15px 30px', color: '#b0bec5', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Avatar
                        sx={{
                          bgcolor: stringToColor('吴 某'),
                          marginRight: 2,
                          fontSize: '14px',
                        }}
                        {...stringAvatar('吴 某')}
                      />
                      Name
                    </Box>
                    <Box sx={{ minWidth: '65px', display: 'flex', justifyContent: 'space-between' }}>
                      {
                            true ? (<VideocamIcon />) : (
                              <VideocamOffIcon sx={{ color: '#dd2c00' }} />
                            )
                        }
                      {
                            false ? (
                              <MicSharpIcon />
                            ) : (
                              <MicOffSharpIcon sx={{ color: '#dd2c00' }} />
                            )
                        }
                    </Box>
                  </Box>
                ))
            }
        </TabPanel>
        <TabPanel index={1} value={tabValue}>
          {
                [1, 2, 3, 1, 1, 1, 1, 1].map((item) => (
                  <Box sx={{ padding: '10px', overflow: 'hidden' }}>
                    <Box sx={{
                      color: '#b0bec5', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', flexDirection: (item === 1 ? 'row-reverse' : 'row') }}>
                        <Avatar
                          sx={{
                            bgcolor: stringToColor('吴 某'),
                            marginRight: (item === 1 ? 0 : 2),
                            marginLeft: (item === 1 ? 2 : 0),
                            fontSize: '14px',
                          }}
                          {...stringAvatar('吴 某')}
                        />
                        <Box sx={{ background: '#121212', borderRadius: 1, p: 1 }}>
                          Aliquam eget finibus ante
                          Aliquam eget finibus ante
                          Aliquam eget finibus ante
                          Aliquam eget finibus ante
                          Aliquam eget finibus ante
                        </Box>
                      </Box>
                    </Box>
                    <Box sx={{
                      fontSize: '12px',
                      padding: '0 60px',
                      float: (item === 1 ? 'right' : 'left'),
                      marginTop: '5px',
                      color: '#b0bec5',
                    }}
                    >
                      1.30 15:00
                    </Box>
                  </Box>
                ))
            }
        </TabPanel>
      </Drawer>
    </Box>
  );
}
