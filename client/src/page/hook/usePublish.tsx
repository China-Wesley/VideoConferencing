/* eslint-disable max-len */
export default function usePublish(props: any) {
  const {
    socket, device, stream,
  } = props;
  let producer;
  let transport: any;
  let produceNumber: number;
  let currentProduce = 0;
  let isScreen = false;
  // connecting hook
  let transportConnectCallback = () => {};
  const transportConnect = (callback: any) => { transportConnectCallback = callback; };
  // connected hook
  let transportConnectErrorCallback = () => {};
  const transportConnectError = (callback: any) => { transportConnectErrorCallback = callback; };
  // disconnect hook
  let transportProduceCallback: any = () => {};
  const transportProduce = (callback: any) => { transportProduceCallback = callback; };

  let transportProduceErrorCallback: any = () => {};
  const transportProduceError = (callback: any) => { transportProduceErrorCallback = callback; };

  const addProducer = (otherStream: any, screen = false) => {
    isScreen = screen;
    const tracks = otherStream.getTracks();
    produceNumber = tracks.length;
    return Promise.all(tracks.map((track: any) => {
      const produceParams = { track };
      return transport.produce(produceParams);
    }));
  };
  // let addProducer = () => {};

  return new Promise((resolve, reject) => {
    // 服务端创建一个produceTransport 以接收承载即将发送过来的数据流
    socket.socketEmit('createProducerTransport', {
      forceTcp: false,
      rtpCapabilities: device.rtpCapabilities, //
    }).then((params: any) => {
      if (params.error) {
        console.error(params.error);
        return new Error(params.error);
      }
      console.log(params);
      transport = device.createSendTransport(params);

      // 监听该transport的事件。
      transport.on('connect', async ({ dtlsParameters }: any, callback: any, errback: any) => {
        socket.socketEmit('connectProducerTransport', { dtlsParameters })
          .then(callback)
          .catch(errback);
      });
      // 加上轨道之后触发
      transport.on('produce', async ({ kind, rtpParameters }: any, callback: any, errback: any) => {
        try {
        // emit produce
          currentProduce += 1;
          const { id, userId } = await socket.socketEmit('produce', {
            transportId: transport.id,
            kind,
            rtpParameters,
            shouldBroadcast: produceNumber === currentProduce,
            isScreen,
          });
          console.log(123123, id);
          transportProduceCallback(userId);
          callback({ id });
        } catch (err) {
          transportProduceErrorCallback();
          errback(err);
        }
      });

      transport.on('connectionstatechange', (state: any) => {
        switch (state) {
          case 'connecting': break;

          case 'connected':
          // 钩子
            transportConnectCallback();

            break;

          case 'failed':
            transport.close();
            transportConnectErrorCallback();
            break;

          default: break;
        }
      });

      const tracks = stream.getTracks(); // 获取视频轨道
      produceNumber = tracks.length;
      return Promise.all(tracks.map((track: any) => {
        const produceParams = { track };
        return transport.produce(produceParams);
      }));
      //   const audioTrack = stream.getAudioTracks()[0];
      // 如果采用联播模式，设置视频资源的比特率
      // if ($chkSimulcast.checked) {
      //   params.encodings = [
      //     { maxBitrate: 100000 },
      //     { maxBitrate: 300000 },
      //     { maxBitrate: 900000 },
      //   ];
      //   params.codecOptions = {
      //     videoGoogleStartBitrate: 1000,
      //   };
      // }
      // 给produce加上视频轨
    }).then((res: any) => {
      console.log(res, transport);
      producer = res;
      resolve({
        producer,
        transport,
        addProducer,
        transportConnect,
        transportConnectError,
        transportProduce,
        transportProduceError,
      });
    }).catch((error: any) => {
      reject(error);
    });
  });
}
