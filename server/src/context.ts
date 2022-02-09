/* eslint-disable no-unused-vars */
class CurContext {
  webServer: any;

  expressApp: any;

  socketServer: any;

  mediasoupWorker: any;

  mediasoupRouter: any;

  mediasoupData: any;

  constructor(props?: any) {
    this.webServer = null;
    this.expressApp = null;
    this.socketServer = {};
    this.mediasoupWorker = {};
    this.mediasoupRouter = {};
    this.mediasoupData = {};
  }
}

let constContext = null;

function Context(props?: any) {
  if (constContext) {
    return constContext;
  }
  constContext = new CurContext(props);
  return constContext;
}

export default Context;
