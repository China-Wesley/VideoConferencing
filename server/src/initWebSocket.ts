/* eslint-disable no-unused-expressions */
/* eslint-disable no-param-reassign */
/* eslint-disable no-plusplus */
/* eslint-disable no-await-in-loop */
/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/no-var-requires */
const socketIO = require('socket.io');
import Context from './context';
import { createConsumer, createWebRtcTransport, parseTransport } from './utils/mediasoupTool';

function getMemberList(mediasoupData) {
  const users = Object.keys(mediasoupData);
  return users.map((userId) => {
    const {
      micOpen, camOpen, shareScreen, userInfo
    } = mediasoupData[userId];
    return {
      micOpen,
      camOpen,
      shareScreen,
      userInfo
    };
  });
}

function addSocketListener(socketServer: any, mediasoupRouter: any, mediasoupData: any) {
  socketServer.on('connection', (socket) => { // 服务端优先触发
    console.log(socket, 'socket--->');
    // 链接失败问题
    socket.on('sendMessage', (data, callback) => {
      // callback();
      const { userName, userId, message } = data;
      // console.log(userName, userId, message, new Date());
      const messageObj = {
        userName, userId, message, time: new Date()
      };
      socketServer.messages.push(messageObj);

      socket.broadcast.emit('someoneSendMessage', { messageObj });
      console.log(socketServer.messages);
      callback(messageObj);
    });

    socket.on('store', (data, callback) => {
      const {
        userId, userName, camOpen, micOpen
      } = data;
      console.log(userId, userName, camOpen, micOpen, 'user--------->');
      if (socketServer.socketToUserTable) {
        socketServer.socketToUserTable[socket.id] = userId;
      } else {
        socketServer.socketToUserTable = {
          [socket.id]: userId
        };
      }
      socketServer.messages = [];
      // 存储socketId与userId映射表
      mediasoupData[userId] = {
        producers: {
          screen: [], // 包含视频音频（一个视频轨以及一个可选的音频轨）
          video: [], // 摄像头视频轨
          audio: [] // 麦克风音频轨
        },
        micOpen: micOpen,
        camOpen: camOpen,
        shareScreen: false,
        // producers: [],
        consumers: {},
        consumerTransport: {},
        producerTransport: null,
        userInfo: {
          userId,
          userName
        }
      };
      // mediasoupData[`${socket.id}`] = userId;
      console.log(mediasoupData, 'mediasoupData--->');
      callback();
    });

    socket.on('disconnect', () => {
      console.log(mediasoupData, 'socketIdToUserIdTable--->');

      const userId = socketServer.socketToUserTable[socket.id];
      userId && socket.broadcast.emit('someoneExitRoom', { userId });
      socket.broadcast.emit('memberListUpdate', { memberList: getMemberList(mediasoupData) });
      // 退出房间方法
    });

    socket.on('connect_error', (err) => {
      console.error('client connection error', err);
      // 退出房间方法
      const userId = socketServer.socketToUserTable[socket.id];
      userId && socket.broadcast.emit('someoneExitRoom', { userId });
    });

    // 检查房间内是否有其他人
    socket.on('checkRoom', (data, callback) => {
      const { userId } = data;
      const member = Object.keys(mediasoupData).filter((key: string) => {
        return key !== userId;
      });
      if (member.length > 0) {
        callback({ hasMember: true, member, memberList: getMemberList(mediasoupData) });
      } else {
        callback({ hasMember: false, memberList: getMemberList(mediasoupData) });
      }
    });

    socket.on('getRouterRtpCapabilities', (data, callback) => {
      callback(mediasoupRouter.rtpCapabilities); // rtp 协议信息
      // 前戏
    });

    socket.on('createProducerTransport', async (data, callback) => {
      try {
        const { userId } = data;
        const { transport } = await createWebRtcTransport(mediasoupRouter).catch((error) => {
          console.log(error);
        });
        mediasoupData[userId].producerTransport = transport;
        const params = parseTransport(transport);
        callback(params);
      } catch (err) {
        console.error(err);
        callback({ error: err.message });
      }
    });

    socket.on('createConsumerTransport', async (data, callback) => {
      try {
        const { userId } = data;
        const { transport } = await createWebRtcTransport(mediasoupRouter);
        mediasoupData[userId].consumerTransport[transport.id] = transport;

        callback(parseTransport(mediasoupData[userId].consumerTransport[transport.id]));
      } catch (err) {
        console.error(err);
        callback({ error: err.message });
      }
    });

    socket.on('connectProducerTransport', async (data, callback) => {
      const { userId } = data;
      await mediasoupData[userId].producerTransport.connect({ dtlsParameters: data.dtlsParameters }).catch((error: any) => {
        console.log(error);
      });
      callback();
    });

    socket.on('connectConsumerTransport', async (data, callback) => {
      const { userId, consumerTransportId } = data;
      await mediasoupData[userId].consumerTransport[consumerTransportId].connect({ dtlsParameters: data.dtlsParameters }).catch((error: any) => {
        console.log(error, 'connectConsumerTransport--->');
      });
      callback();
    });

    socket.on('pause', (data, next) => {
      const { userId, kind } = data; // 用户自己

      if (kind === 'audio') {
        mediasoupData[userId].micOpen = false;
      } else if (kind === 'video') {
        mediasoupData[userId].camOpen = false;
      } else {
        mediasoupData[userId].shareScreen = false;
      }

      mediasoupData[userId]?.producers?.[kind]?.forEach((item) => {
        item.pause();
      });
      const member = { memberList: getMemberList(mediasoupData) };
      socket.broadcast.emit('memberListUpdate', member);

      next(member);
    });

    socket.on('continue', (data, next) => {
      const { userId, kind } = data;

      if (kind === 'audio') {
        mediasoupData[userId].micOpen = true;
      } else if (kind === 'video') {
        mediasoupData[userId].camOpen = true;
      } else {
        mediasoupData[userId].shareScreen = true;
      }

      mediasoupData[userId]?.producers?.[kind]?.forEach((item) => {
        item.resume();
      });
      const member = { memberList: getMemberList(mediasoupData) };
      socket.broadcast.emit('memberListUpdate', member);

      next(member);
    });

    socket.on('close', (data, callback) => {
      const { kind, userId, isScreen } = data;
      if (isScreen) {
        mediasoupData[userId].producers.screen.forEach((produce: any) => {
          produce.close();
        });
        mediasoupData[userId].producers.screen = [];
        socket.broadcast.emit('someoneStopShareScreen');
      } else if (kind === 'video') {
        mediasoupData[userId].producers.video.forEach((produce: any) => {
          produce.close();
        });
        mediasoupData[userId].producers.video = [];
      } else {
        mediasoupData[userId].producers.audio.forEach((produce: any) => {
          produce.close();
        });
        mediasoupData[userId].producers.audio = [];
      }
      socket.broadcast.emit('broadcast', { userId, isScreen });
      callback();
    });

    // 前端publish添加视频轨之后，触发该事件
    socket.on('produce', async (data, callback) => {
      const {
        kind,
        rtpParameters,
        userId,
        shouldBroadcast,
        isScreen
      } = data;

      const kindProducer = await mediasoupData[userId].producerTransport.produce({ kind, rtpParameters });
      // 分轨道
      if (isScreen) {
        console.log('屏幕共享中', kindProducer.id);
        mediasoupData[userId].producers.screen.push(kindProducer);
      } else if (kind === 'video') {
        mediasoupData[userId].producers.video.push(kindProducer);
      } else {
        mediasoupData[userId].producers.audio.push(kindProducer);
      }
      // 广播
      if (shouldBroadcast) {
        socket.broadcast.emit('broadcast', { userId, isScreen });
        socket.broadcast.emit('memberListUpdate', { memberList: getMemberList(mediasoupData) });
      }
      callback({ id: kindProducer.id, userId });
    });

    socket.on('consume', async (data, callback) => {
      const { userId, rtpCapabilities, consumerTransportId } = data;
      const paramses = [];
      const transport = mediasoupData[userId].consumerTransport[consumerTransportId];
      const producers = [];

      if (mediasoupData[userId].producers.screen.length > 0) {
        producers.push(...mediasoupData[userId].producers.screen);
      } else {
        producers.push(...mediasoupData[userId].producers.video);
      }
      producers.push(...mediasoupData[userId].producers.audio);

      if (transport && producers.length >= 0) {
        mediasoupData[userId].consumers[consumerTransportId] = [];
        for (let i = 0; i < producers.length; i++) {
          // 可以重复consume吗？会不会和现有的流冲突
          const { consumer: Consumer, params } = await createConsumer(mediasoupRouter, producers[i], transport, rtpCapabilities);
          mediasoupData[userId].consumers[consumerTransportId].push(Consumer);
          paramses.push(params);
        }
      }
      callback(paramses);
    });

    socket.on('resume', async (data, callback) => {
      const { userId, consumerTransportId } = data;
      for (let i = 0; i < mediasoupData[userId].consumers[consumerTransportId].length; i++) {
        await mediasoupData[userId].consumers[consumerTransportId][i].resume();
      }
      callback();
    });
  });
}

function initSocketServer(roomId: any) {
  // 创建socket服务
  const context = Context();
  const socketServer = socketIO(context.webServer, {
    serveClient: false,
    path: `/${roomId}`,
    log: true
  });

  const mediasoupData = {};

  context.socketServer[roomId] = socketServer;
  context.mediasoupData[roomId] = mediasoupData;

  const mediasoupRouter = context.mediasoupRouter[roomId];
  addSocketListener(socketServer, mediasoupRouter, mediasoupData);
}

export default initSocketServer;
