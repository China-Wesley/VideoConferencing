/* eslint-disable no-unused-expressions */
/* eslint-disable no-param-reassign */
/* eslint-disable no-plusplus */
/* eslint-disable no-await-in-loop */
/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/no-var-requires */
const socketIO = require('socket.io');
import Context from './context';
import { createConsumer, createWebRtcTransport, parseTransport } from './utils/mediasoupTool';

function addSocketListener(socketServer: any, mediasoupRouter: any, mediasoupData: any) {
  socketServer.on('connection', (socket) => { // 服务端优先触发
    console.log(socket, 'socket--->');
    // 链接失败问题
    socket.on('store', (data, callback) => {
      const { userId } = data;
      if (socketServer.socketToUserTable) {
        socketServer.socketToUserTable[socket.id] = userId;
      } else {
        socketServer.socketToUserTable = {
          [socket.id]: userId
        };
      }
      // 存储socketId与userId映射表
      mediasoupData[userId] = {
        // producers: {
        //   screen: [],
        //   video: [],
        //   audio: []
        // },
        // micOpen: false,
        // camOpen: false,
        // shareScreen: false,
        producers: [],
        consumers: {},
        consumerTransport: {},
        producerTransport: null
      };
      // mediasoupData[`${socket.id}`] = userId;
      console.log(mediasoupData, 'mediasoupData--->');
      callback();
    });

    // socket.on('disconnect_client', (data: any) => {
    //   console.log();
    // });

    socket.on('disconnect', () => {
      console.log(mediasoupData, 'socketIdToUserIdTable--->');
      const userId = socketServer.socketToUserTable[socket.id];
      userId && socket.broadcast.emit('someoneExitRoom', { userId });
      // 退出房间方法
    });

    socket.on('connect_error', (err) => {
      console.error('client connection error', err);
      // 退出房间方法
    });

    // 检查房间内是否有其他人
    socket.on('checkRoom', (data, callback) => {
      const { userId } = data;
      const member = Object.keys(mediasoupData).filter((key: string) => {
        return key !== userId;
      });
      if (member.length > 0) {
        callback({ hasMember: true, member });
      } else {
        callback({ hasMember: false });
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
    // 前端publish添加视频轨之后，触发该事件
    socket.on('produce', async (data, callback) => {
      const {
        kind,
        rtpParameters,
        userId,
        shouldBroadcast
      } = data;
      console.log(kind, 'kind--->');
      const kindProducer = await mediasoupData[userId].producerTransport.produce({ kind, rtpParameters });
      mediasoupData[userId].producers.push(kindProducer);
      shouldBroadcast && socket.broadcast.emit('broadcast', { userId });
      callback({ id: kindProducer.id, userId });
    });

    socket.on('consume', async (data, callback) => {
      const { userId, rtpCapabilities, consumerTransportId } = data;
      const paramses = [];
      const transport = mediasoupData[userId].consumerTransport[consumerTransportId];
      const producers = mediasoupData[userId].producers || [];
      if (transport && producers.length >= 0) {
        mediasoupData[userId].consumers[consumerTransportId] = [];
        for (let i = 0; i < mediasoupData[userId].producers.length; i++) {
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
