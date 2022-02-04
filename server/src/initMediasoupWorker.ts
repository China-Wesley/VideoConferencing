/* eslint-disable @typescript-eslint/no-var-requires */
import mediasoup = require('mediasoup');
const config = require('../config');
import Context from './context';

async function initMediasoupWorker(roomId: any) {
  const context = Context();
  const worker = await mediasoup.createWorker({
    logLevel: config.mediasoup.worker.logLevel,
    logTags: config.mediasoup.worker.logTags,
    rtcMinPort: config.mediasoup.worker.rtcMinPort,
    rtcMaxPort: config.mediasoup.worker.rtcMaxPort
  });

  context.mediasoupWorker[roomId] = worker;

  worker.on('died', () => {
    console.error('mediasoup worker died, exiting in 2 seconds... [pid:%d]', worker.pid);
    setTimeout(() => process.exit(1), 2000);
  });

  const mediaCodecs = config.mediasoup.router.mediaCodecs;
  const router = await worker.createRouter({ mediaCodecs });

  context.mediasoupRouter[roomId] = router;

  return {
    worker,
    router
  };
}

export default initMediasoupWorker;
