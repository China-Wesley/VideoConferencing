/* eslint-disable no-plusplus */
/* eslint-disable @typescript-eslint/no-loop-func */
/* eslint-disable no-await-in-loop */
/* eslint-disable max-len */
async function consume(props: any) {
  let hasError = false;
  let err = null;
  const {
    device, socket, transport, userId, consumerTransportId,
  } = props;
  const { rtpCapabilities } = device;
  // 触发消费事件
  const paramses = await socket.socketEmit('consume', { rtpCapabilities, userId, consumerTransportId }).catch((error: any) => {
    err = error;
    hasError = true;
  });

  if (hasError) {
    return err;
  }
  const stream = new MediaStream();

  for (let i = 0; i < paramses.length; i++) {
    const {
      producerId,
      id,
      kind,
      rtpParameters,
    } = paramses[i];

    const codecOptions = {};
    // 将consume连接起来 调用consume方法的时候应该会触发连接
    const consumer = await transport.consume({
      id,
      producerId,
      kind,
      rtpParameters,
      codecOptions,
    }).catch((error: any) => {
      err = error;
      hasError = true;
    });
    if (hasError) { return err; }

    stream.addTrack(consumer.track);
  }

  // 创建浏览器可识别的媒体流
  return stream;
}

export default function useSubscribe(props: any) {
  const { socket, device, memberId } = props;
  let transport: any;
  let consumerTransportParams: any;
  // connecting hook
  let transportConnectCallback = () => {};
  const transportConnect = (callback: any) => { transportConnectCallback = callback; };
  // connected hook
  let transportConnectErrorCallback = () => {};
  const transportConnectError = (callback: any) => { transportConnectErrorCallback = callback; };

  return new Promise((resolve, reject) => {
    socket.socketEmit('createConsumerTransport', {
      forceTcp: false,
      userId: memberId,
    }).then((params: any) => {
      if (params.error) {
        return new Error(params.error);
      }
      consumerTransportParams = params;

      transport = device.createRecvTransport(params);

      transport.on('connect', ({ dtlsParameters }: any, callback: any, errback: any) => {
        socket.socketEmit('connectConsumerTransport', {
          transportId: transport.id,
          dtlsParameters,
          userId: memberId,
          consumerTransportId: params.id,
        })
          .then(callback)
          .catch((error: any) => {
            errback();
            reject(error);
          });
      });

      // 连接状态变更
      transport.on('connectionstatechange', async (state: any) => {
        switch (state) {
          case 'connecting':
            break;

          case 'connected':
            transportConnectCallback();
            await socket.socketEmit('resume', { userId: memberId, consumerTransportId: params.id });
            break;

          case 'failed':
            transport.close();
            transportConnectErrorCallback();
            break;

          default: break;
        }
      });
      return consume({
        ...props, transport, userId: memberId, consumerTransportId: params.id,
      });
    }).then((stream: any) => {
      resolve({
        stream,
        consume,
        transport,
        transportConnect,
        transportConnectError,
        consumerTransportParams,
      });
    }).catch((error: any) => {
      reject(error);
    });
  });
}
