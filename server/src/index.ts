/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable no-param-reassign */
/* eslint-disable consistent-return */
import initExpressApp from './initExpressApp';
import Context from './context';
import initHttpsServer from './initHttpsServer';

// let worker;
// let webServer;
// let socketServer;
// let expressApp;
// let producer;
// let consumer;
// let producerTransport;
// let consumerTransport;
// let mediasoupRouter;

// 一个router --- router即一个房间
// router会为每个设备创建一个peer
// 一个peer中有一个consumer 一个 producer

async function initServer() {
//   await runExpressApp();
  const context = Context();
  await initExpressApp();

  //   console.log(context);
  await initHttpsServer(context.expressApp);
  //   await runSocketServer(Context().webServer);
  //   await runMediasoupWorker();
  console.log('success');
}

(async () => {
  try {
    await initServer();
  } catch (err) {
    console.error(err);
  }
})();
