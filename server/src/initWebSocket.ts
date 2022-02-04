/* eslint-disable no-plusplus */
/* eslint-disable no-await-in-loop */
/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/no-var-requires */
const socketIO = require('socket.io');
import Context from './context';
import { createConsumer, createWebRtcTransport } from './utils/mediasoupTool';

function addSocketListener(socketServer: any, mediasoupRouter: any) {
  // 监听connection，前端connect时会触发
//   const
  const producers = [];
  const consumers = [];
  let producerTransport;
  let consumerTransport;

  socketServer.on('connection', (socket) => { // 服务端优先触发
    // console.log('client connected----》', +new Date());

    // inform the client about existence of
    // console.log('producer: ', producer);
    // if (producer) {
    //   socket.emit('newProducer');
    // }
    // 链接失败问题
    socket.on('disconnect', () => {
      console.log('client disconnected');
    });

    socket.on('connect_error', (err) => {
      console.error('client connection error', err);
    });

    socket.on('getRouterRtpCapabilities', (data, callback) => {
      //   * exports.promise = function(socket) {
      //   return function request(type, data = {}) {
      //     return new Promise((resolve) => {
      //       socket.emit(type, data, resolve);
      //     });
      //   }
      // }；
      // callback === resolve
      callback(mediasoupRouter.rtpCapabilities); // rtp 协议信息
    });

    // Transport 可以承载consumer或者producer
    // A     B
    socket.on('createProducerTransport', async (data, callback) => {
      try {
        const { transport, params } = await createWebRtcTransport(mediasoupRouter).catch((error) => {
          console.log(error);
        });
        producerTransport = transport; // 全局唯一的
        callback(params);
      } catch (err) {
        console.error(err);
        callback({ error: err.message });
      }
    });

    socket.on('createConsumerTransport', async (data, callback) => {
      try {
        const { transport, params } = await createWebRtcTransport(mediasoupRouter);
        consumerTransport = transport;
        callback(params);
      } catch (err) {
        console.error(err);
        callback({ error: err.message });
      }
    });

    socket.on('connectProducerTransport', async (data, callback) => {
      await producerTransport.connect({ dtlsParameters: data.dtlsParameters });
      callback();
    });

    socket.on('connectConsumerTransport', async (data, callback) => {
      await consumerTransport.connect({ dtlsParameters: data.dtlsParameters });
      callback();
    });
    // 前端publish添加视频轨之后，触发该事件
    socket.on('produce', async (data, callback) => {
      const { kind, rtpParameters } = data;
      // rtpParameters里边应该有视频轨道的数据
      const kindProducer = await producerTransport.produce({ kind, rtpParameters });
      producers.push(kindProducer);
      //   console.log(kindProducer, kind, 'produce--->');
      callback({ id: kindProducer.id });
      // inform clients about new producer
      // 有了轨道之后，接收按钮应该变为可点击状态
    //   socket.broadcast.emit('newProducer');
    });

    socket.on('consume', async (data, callback) => {
      const paramses = [];
      for (let i = 0; i < producers.length; i++) {
        const { consumer: Consumer, params } = await createConsumer(mediasoupRouter, producers[i], consumerTransport, data.rtpCapabilities);
        consumers.push(Consumer);
        paramses.push(params);
      }
      callback(paramses);
    });

    socket.on('resume', async (data, callback) => {
      for (let i = 0; i < consumers.length; i++) {
        await consumers[i].resume();
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

  context.socketServer[roomId] = socketServer;
  const mediasoupRouter = context.mediasoupRouter[roomId];

  addSocketListener(socketServer, mediasoupRouter);
}

export default initSocketServer;
