/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable jsx-a11y/media-has-caption */
/* eslint-disable react/jsx-props-no-spreading */
/* eslint-disable no-sparse-arrays */
import React, {
  useState, useEffect, useContext, useRef,
} from 'react';
import { styled, useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import UserControl from './component/UserControl';
import TabPanel from './component/TabPanel';
import { RTCStream as RTCStreamContext, Room as RoomContext, User as UserContext } from '../context/index';
import useConnect from './hook/useConnect';
import usePublish from './hook/usePublish';
import useSubscribe from './hook/useSubscribe';
import Videox from './component/Videox';
import useMessage from './hook/useMessage';
import { getMedia } from '../utils/utils';
import Member from './component/Member';
import Chat from './component/Chat';
import SendMessage from './component/SendMessage';

const drawerWidth = 400;

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
  const { user } = useContext(UserContext);
  const streamCache: any = useRef({});
  const socketCache: any = useRef();
  const addProducerFunc: any = useRef();
  const [videoSources, setVideoSources] = useState([] as any);
  const [memberList, setMemberList] = useState([] as any);
  const [chatList, setChatList] = useState([] as any);
  const screenStream: any = useRef({});
  const [currentSource, setCurrentSource] = useState<any>(null);

  // const [publishTransport, setPublishTransport] = useState(null);
  //   const peimaryVideo: any = useRef();

  useEffect(() => {
    streamCache.current[user.uuid] = RTCStream;
    const currentVideoSource = {
      micOpen: user.micOpen,
      camOpen: user.camOpen,
      shareScreen: false,
      userInfo: {
        userName: user.username,
        userId: user.uuid,
      },
      stream: RTCStream,
    };
    setMemberList([
      currentVideoSource,
    ]);
    setVideoSources({ ...streamCache.current });
    setCurrentSource(user.uuid);
  }, []);

  const getRoomId = () => {
    if (room && room.roomId) {
      return room.roomId;
    }
    const location = window.location.pathname;
    const paths = location.split('/') || [];
    return paths[(paths.length - 1) >= 0 ? (paths.length - 1) : 0];
  };

  useEffect(() => {
    socketCache.current && socketCache.current.on('someoneSendMessage', (data: any) => {
      setChatList([...chatList, data.messageObj]);
    });
  }, [socketCache.current, chatList]);

  useEffect(() => {
    const {
      socketConnected,
      // socketDisconnect,
    } = useConnect({ path: `/${getRoomId()}` }, { ...user, userId: user.uuid, userName: user.username });

    // socketDisconnect(() => {
    //   const tracks = RTCStream.getTracks();
    //   tracks.forEach((track: any) => {
    //     track.stop();
    //   });
    // });

    socketConnected((device: any, socket: any) => {
      // publish
      socketCache.current = socket;
      socket.on('someoneExitRoom', (data: any) => {
        const { userId } = data;
        delete streamCache.current[userId];
        const tempSources: any[] = [];
        Object.keys(streamCache.current).forEach((id: string) => {
          tempSources.push(streamCache.current[id]);
        });
        // setVideoSources([...tempSources]);
        setVideoSources(streamCache.current);
      });
      socket.on('memberListUpdate', (data: any) => {
        const { memberList: remoteMemberList } = data;
        console.log(remoteMemberList, 'remoteMemberList-->');
        setMemberList(remoteMemberList);
        // setChatList([]);
      });
      socket.on('broadcast', (data: any) => {
        const { userId } = data;
        useSubscribe({ device, socket, memberId: userId }).then((subScribe: any) => {
          const { stream } = subScribe;
          streamCache.current[userId] = stream;
          const tempSources: any[] = [];
          Object.keys(streamCache.current).forEach((id: string) => {
            tempSources.push(streamCache.current[id]);
          });
          console.warn(tempSources, streamCache.current);
          // setVideoSources([...tempSources]);
          setVideoSources({ ...streamCache.current });
        }).catch((error: any) => {
          console.log(error);
        });
      });
      usePublish({
        device, socket, stream: RTCStream,
      })
        .then((publishRes: any) => {
          const { addProducer } = publishRes;
          addProducerFunc.current = addProducer;
          socket.socketEmit('checkRoom')
            .then((checkData: any) => {
              const { hasMember, member, memberList: remoteMemberList } = checkData;
              console.log(memberList);
              setMemberList(remoteMemberList);
              if (hasMember) {
                let count = 0;
                member.forEach((memberId: string) => {
                  useSubscribe({ device, socket, memberId }).then((subScribe: any) => {
                    const { stream } = subScribe;

                    count += 1;
                    streamCache.current[memberId] = stream;
                    if (member.length === count) {
                      const tempSources: any[] = [];
                      Object.keys(streamCache.current).forEach((id: string) => {
                        tempSources.push(streamCache.current[id]);
                      });
                      // setVideoSources([...tempSources]);
                      setVideoSources(streamCache.current);
                    }
                  }).catch((error: any) => {
                    console.log(error);
                  });
                });
              } else {
                useMessage('房间目前只有您一位成员，快去邀请其他人吧！', { type: 'warning' });
              }
            }).catch((error: any) => {
              console.log(error, 'checkRoom--->');
            });
        })
        .catch((error: any) => {
          console.log(error, 'error--->');
        });
    });
  }, []);

  const handleDrawerOpen = (tab: number) => {
    if (tab !== tabValue && open) {
      setTabValue(tab);
    } else {
      setTabValue(tab);
      setOpen(!open);
    }
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleExitRoom = () => {
    socketCache.current && socketCache.current.disconnect();
  };

  const handelPause = (kind: string) => {
    // socketCache.current && socketCache.current.socketEmit('pause', { userId: user.uuid, kind });
    socketCache.current && socketCache.current.socketEmit('pause', { userId: user.uuid, kind }).then((res: any) => {
      console.log(res, 'members--->');
      setMemberList(res.memberList);
    }).catch((error: any) => {
      console.log(error, 'members---->');
    });
  };

  const handleContinue = (kind: string) => {
    // socketCache.current && socketCache.current.socketEmit('continue', { userId: user.uuid, kind });
    socketCache.current && socketCache.current.socketEmit('continue', { userId: user.uuid, kind }).then((res: any) => {
      console.log(res, 'members--->');
      setMemberList(res.memberList);
    }).catch((error: any) => {
      console.log(error);
    });
  };

  const handleAddNewTrack = (kind: any, isScreen = false) => getMedia({ [kind]: true })
    .then((stream: any) => addProducerFunc.current(stream, isScreen, (tracks: any) => {
      console.log(tracks, 'tracks--->');
      tracks.forEach((track: any) => {
        RTCStream.addTrack(track);
      });
    }));

  const handleShareScreen = () => getMedia({ video: true }, true).then((stream: any) => {
    screenStream.current = stream;
    addProducerFunc.current(stream, true);
  });

  const handleStopShareScreen = () => {
    const tracks = screenStream.current.getTracks();
    tracks.forEach((track: any) => {
      track.stop();
    });
  };

  const renderCurrentVideo = () => {
    const curVideo: any[] = Object.keys(videoSources).filter((key: string) => {
      if (key === currentSource) {
        return true;
      }
      return false;
    });
    if (curVideo.length) {
      return curVideo.map((key: any) => {
        const stream = videoSources[key];
        const {
          micOpen, camOpen, userInfo: { userName },
        } = memberList.find((item: any) => {
          const { userInfo: { userId: uuid } } = item;
          if (uuid === key) {
            return true;
          }
          return false;
        });
        return (
          <Videox
                    // ref={testVideo}
            name={userName}
            width="100%"
            height="100%"
            micOpen={micOpen}
            camOpen={camOpen}
            stream={stream}
            style={{
              video: {
                maxHeight: '100%',
              },
            }}
          />
        );
      });
    }
    // setCurrentSource(user.uuid);
    return (
      <Videox
                  // ref={testVideo}
        name={user.username}
        width="100%"
        height="100%"
        micOpen={user.micOpen}
        camOpen={user.camOpen}
        stream={RTCStream}
        style={{
          video: {
            maxHeight: '100%',
          },
        }}
      />
    );
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
            Object.keys(videoSources).map((key: string) => {
              const stream = videoSources[key];
              const {
                micOpen, camOpen, userInfo: { userName },
              } = memberList.find((item: any) => {
                const { userInfo: { userId: uuid } } = item;
                if (uuid === key) {
                  return true;
                }
                return false;
              });
              return (
                <Box
                  key={key}
                  sx={{
                    flex: '0 0 200px',
                    height: '100%',
                    backgroundColor: '#ccc',
                    margin: '0 5px',
                    border: `${key === currentSource ? '3px solid #1565c0' : ''}`,
                    boxSizing: 'border-box',
                    cursor: 'pointer',
                    '&:hover': {
                      border: '3px solid #5595ec',
                    },
                  }}
                  onClick={() => {
                    setCurrentSource(key);
                  }}
                >
                  <Videox
                    name={userName}
                    width="100%"
                    height="100%"
                    micOpen={micOpen}
                    camOpen={camOpen}
                    stream={stream}
                  />
                </Box>
              );
            })
        }
        </Box>
        <Box sx={{
          display: 'flex', overflowX: 'scroll', justifyContent: 'center', flex: '6',
        }}
        >
          {renderCurrentVideo()}
        </Box>
        <UserControl
          socket={socketCache.current}
          micOpen={user.micOpen}
          camOpen={user.camOpen}
          onPause={handelPause}
          onContinue={handleContinue}
          onDrawerOpen={handleDrawerOpen}
          onExitRoom={handleExitRoom}
          onShareScreen={handleShareScreen}
          onStopShareScreen={handleStopShareScreen}
          onAddNewTrack={handleAddNewTrack}
        />
      </Main>
      <Drawer
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            overflow: 'hidden',
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
          <Box>
            {
                  memberList && memberList.map((item: any) => (
                    <Member memberInfo={item} />
                  ))
              }
          </Box>
        </TabPanel>
        <TabPanel index={1} value={tabValue} style={{ height: 'calc(100% - 160px)' }}>
          <Box>
            {
                  // chatList && chatList.map((item: any) => (
                  //   <Chat chatInfo={item} />
                  // ))
                  chatList.map((item: any) => (
                    <Chat chatInfo={item} />
                  ))
              }
          </Box>
        </TabPanel>
        {tabValue === 1 && (
          <SendMessage handleSendMessage={async (message: any) => {
            if (!message) return;
            const msgObj = await socketCache.current.socketEmit('sendMessage', { message });
            setChatList([...chatList, msgObj]);
          }}
          />
        )}
      </Drawer>
    </Box>
  );
}
