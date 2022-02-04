/* eslint-disable @typescript-eslint/no-var-requires */
import fs = require('fs');
import https = require('https');
const config = require('../config');
import Context from './context';

function storeWebServer(webServer) {
  const context = Context();
  context.webServer = webServer;
}

function initHttpsServer(expressApp: any) {
  return new Promise((resolve, reject) => {
    const {
      sslKey, sslCrt, listenPort
    } = config;
      // 判断ssl文件存不存在
    if (!fs.existsSync(sslKey) || !fs.existsSync(sslCrt)) {
      console.error('SSL files are not found. check your config.js file');
      process.exit(0);
    }
    const tls = {
      cert: fs.readFileSync(sslCrt),
      key: fs.readFileSync(sslKey)
    };

    // 创建https服务
    const webServer = https.createServer(tls, expressApp);
    storeWebServer(webServer);

    webServer.on('error', (err) => {
      console.error('starting web server failed:', err.message);
      reject(err);
    });
    // TODO: IP是否需要
    webServer.listen(listenPort, () => {
      const listenIps = config.mediasoup.webRtcTransport.listenIps[0];
      const ip = listenIps.announcedIp || listenIps.ip;

      resolve(webServer);

      console.log('server is running');
      console.log(`open https://${ip}:${listenPort} in your web browser`);
    });
  });
}

export default initHttpsServer;
