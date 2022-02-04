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

export default function useConnect(socketConfig: any) {
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

  //   const socketDisconnectCallback = useRef(() => {});
  //   const socketDisconnect = useCallback((callback) => { socketDisconnectCallback.current = callback; }, []);

  socketConnectingCallback();

  socket = socketClient(serverUrl, { ...opts, ...socketConfig }); // socket.io 自动创建链接

  socket.socketEmit = socketEmit(socket);

  socket.on('connect', async () => {
    // emit getRouterRtpCapabilities
    const rtpCapabilities = await socket.socketEmit('getRouterRtpCapabilities'); // 获取rtp， 信令交换

    // 加载设备，创建peer connection
    device = await loadDevice(rtpCapabilities).catch(() => {
      useMessage('创建 Peer Connection 失败！', { type: 'error' });
    });
    socketConnectedCallback(device, socket);
  });
  // 监听
  // 关闭链接
  socket.on('disconnect', () => {
    socketDisconnectCallback();
    // $txtConnection.innerHTML = 'Disconnected';
    // $btnConnect.disabled = false;
    // $fsPublish.disabled = true;
    // $fsSubscribe.disabled = true;
  });
  // 链接出错
  socket.on('connect_error', (error: any) => {
    socketErrorCallback(error);
    // console.error('could not connect to %s%s (%s)', serverUrl, opts.path, error.message);
    // $txtConnection.innerHTML = 'Connection failed';
    // $btnConnect.disabled = false;
  });

  //   socket.on('newProducer', () => {
  // $fsSubscribe.disabled = false;
  //   });

  return {
    socketConnecting,
    socketConnected,
    socketDisconnect,
    socketError,
    device,
    socket,
  };
}
