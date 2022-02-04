/* eslint-disable max-len */
/* eslint-disable consistent-return */
/* eslint-disable @typescript-eslint/no-var-requires */
const config = require('../../config');

/** 创建一个Transport 这里选用默认的WebRtcTransport */
export async function createWebRtcTransport(mediasoupRouter: any) {
  // 配置
  const {
    maxIncomingBitrate,
    initialAvailableOutgoingBitrate,
    listenIps
  } = config.mediasoup.webRtcTransport;

  // 创建transport
  const transport = await mediasoupRouter.createWebRtcTransport({
    listenIps,
    enableUdp: true,
    enableTcp: true,
    preferUdp: true,
    initialAvailableOutgoingBitrate
  });

  if (maxIncomingBitrate) {
    try {
      await transport.setMaxIncomingBitrate(maxIncomingBitrate);
    } catch (error) {
      console.error('set maxIncomingBitrate error!');
    }
  }

  return {
    transport,
    params: {
      id: transport.id,
      iceParameters: transport.iceParameters,
      iceCandidates: transport.iceCandidates,
      dtlsParameters: transport.dtlsParameters
    }
  } as any;
}

/** 创建consumer */
export async function createConsumer(mediasoupRouter, producer, consumerTransport, rtpCapabilities) {
  // 检测rooter中的判断这个rooter中是否可以consume
  let consumer;
  if (!mediasoupRouter.canConsume(
    {
      producerId: producer.id,
      rtpCapabilities
    }
  )
  ) {
    console.error('can not consume');
    return;
  }
  try {
    consumer = await consumerTransport.consume({
      producerId: producer.id,
      rtpCapabilities,
      paused: producer.kind === 'video'
    }).catch((error) => {
      console.log(error);
    });
  } catch (error) {
    console.error('consume failed', error);
    return;
  }

  if (consumer.type === 'simulcast') {
    await consumer.setPreferredLayers({ spatialLayer: 2, temporalLayer: 2 }).catch((error) => {
      console.log(error);
    });
  }

  return {
    consumer,
    params: {
      producerId: producer.id,
      id: consumer.id,
      kind: consumer.kind,
      rtpParameters: consumer.rtpParameters,
      type: consumer.type,
      producerPaused: consumer.producerPaused
    }
  };
}
