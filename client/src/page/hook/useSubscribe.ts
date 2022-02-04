/* eslint-disable no-plusplus */
/* eslint-disable @typescript-eslint/no-loop-func */
/* eslint-disable no-await-in-loop */
/* eslint-disable max-len */
async function consume(props: any) {
  let hasError = false;
  let err = null;
  const { device, socket, transport } = props;
  const { rtpCapabilities } = device;
  // 触发消费事件
  const paramses = await socket.socketEmit('consume', { rtpCapabilities }).catch((error: any) => {
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
  const { socket, device } = props;
  let transport: any;

  // connecting hook
  let transportConnectCallback = () => {};
  const transportConnect = (callback: any) => { transportConnectCallback = callback; };
  // connected hook
  let transportConnectErrorCallback = () => {};
  const transportConnectError = (callback: any) => { transportConnectErrorCallback = callback; };
  // disconnect hook
  //   const transportProduceCallback = useRef(() => {});
  //   const transportProduce = useCallback((callback) => { transportProduceCallback.current = callback; }, []);

  //   const transportProduceErrorCallback: any = useRef(() => {});
  //   const transportProduceError = useCallback((callback) => { transportProduceErrorCallback.current = callback; }, []);

  return new Promise((resolve, reject) => {
    // 服务端创建一个consumer transport准备消费数据流
    socket.socketEmit('createConsumerTransport', {
      forceTcp: false,
    }).then((params: any) => {
      if (params.error) {
        return new Error(params.error);
      }
      transport = device.createRecvTransport(params);

      transport.on('connect', ({ dtlsParameters }: any, callback: any, errback: any) => {
        socket.socketEmit('connectConsumerTransport', {
          transportId: transport.id,
          dtlsParameters,
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

          case 'connected': // 一旦连接上，那么设置上媒体流
            transportConnectCallback();
            //   document.querySelector('#remote_video').srcObject = await stream;
            await socket.socketEmit('resume');
            //   $txtSubscription.innerHTML = 'subscribed';
            //   $fsSubscribe.disabled = true;
            break;

          case 'failed':
            transport.close();
            transportConnectErrorCallback();
            //   $txtSubscription.innerHTML = 'failed';
            //   $fsSubscribe.disabled = false;
            break;

          default: break;
        }
      });
      return consume({ ...props, transport });
    }).then((stream: any) => {
      resolve({
        stream,
        transport,
        transportConnect,
        transportConnectError,
      });
    }).catch((error: any) => {
      reject(error);
    });
  });
}
