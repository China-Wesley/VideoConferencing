/* eslint-disable prefer-const */
/* eslint-disable max-len */
import socketClient from 'socket.io-client';
import { serve } from '../../const/api';
import { socketEmit, loadDevice } from '../../utils/connect';
import useMessage from './useMessage';

const { hostname } = window.location;

const opts = {
  path: '/',
  transports: ['websocket'],
};

const serverUrl = `https://${hostname}:${serve.listenPort}`;

export default function useConnect(socketConfig: any, otherConfig?: any) {
  let socket: any;
  let device: any;

  // connecting hook
  let socketConnectingCallback = () => {};
  const socketConnecting = (callback: any) => { socketConnectingCallback = callback; };
  // connected hook
  let socketConnectedCallback: any = () => {};
  const socketConnected = (callback: any) => { socketConnectedCallback = callback; };
  // disconnect hook
  let socketDisconnectCallback = () => {};
  const socketDisconnect = (callback: any) => { socketDisconnectCallback = callback; };

  let socketErrorCallback: any = () => {};
  const socketError = (callback: any) => { socketErrorCallback = callback; };

  socketConnectingCallback();

  socket = socketClient(serverUrl, { ...opts, ...socketConfig }); // socket.io 自动创建链接
  console.log(otherConfig, 'otherConfig--->');
  socket.socketEmit = socketEmit(socket, { userId: otherConfig.userId, userName: otherConfig.userName });

  if (window.onbeforeunload) {
    window.onbeforeunload = () => {
      socket.disconnect();
    };
  }

  socket.on('connect', async () => {
    // emit getRouterRtpCapabilities
    const rtpCapabilities = await socket.socketEmit('getRouterRtpCapabilities').catch(() => {}); // 获取rtp， 信令交换
    // 加载设备，创建peer connection
    await socket.socketEmit('store', { camOpen: otherConfig.defaultCam, micOpen: otherConfig.defaultMic }).catch(() => { console.log('store 失败'); });
    console.log(socket, 'socket--->');
    device = await loadDevice(rtpCapabilities).catch(() => {
      useMessage('创建 Peer Connection 失败！', { type: 'error' });
    });
    socketConnectedCallback(device, socket);
  });
  // 监听
  // 关闭链接
  socket.on('disconnect', () => {
    console.warn('链接断开');
    // socket.socketEmit('disconnect');
    socketDisconnectCallback();
  });
  // 链接出错
  socket.on('connect_error', (error: any) => {
    console.warn('链接错误');
    socketErrorCallback(error);
  });

  return {
    socketConnecting,
    socketConnected,
    socketDisconnect,
    socketError,
    device,
    socket,
  };
}
