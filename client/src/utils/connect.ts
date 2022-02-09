import { Device } from 'mediasoup-client';

export function socketEmit(socket: any, options: any) {
  const { userId } = options;
  return (type: string, data = {}) => new Promise((resolve) => {
    socket.emit(type, { userId, ...data }, resolve);
  });
}

export function loadDevice(routerRtpCapabilities: any) {
  return new Promise((resolve, reject) => {
    let device: any;
    try {
      device = new Device();
    } catch (error: any) {
      console.log(error);
      if (error.name === 'UnsupportedError') {
        reject(new Error('browser not supported'));
      }
    }
    // 按照rtp需求加载device // create RTCPeerConnection
    if (device) {
      device.load({ routerRtpCapabilities }).then(() => {
        resolve(device);
      }).catch((error: any) => {
        reject(error);
      });
    } else {
      reject(new Error('device is undefined!'));
    }
  });
}

export default { socketEmit, loadDevice };
