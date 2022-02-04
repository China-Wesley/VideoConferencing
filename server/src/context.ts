/* eslint-disable no-unused-vars */
class CurContext {
  webServer: any;

  expressApp: any;

  socketServer: any;

  mediasoupWorker: any;

  mediasoupRouter: any;

  constructor(props?: any) {
    this.webServer = null;
    this.expressApp = null;
    this.socketServer = {};
    this.mediasoupWorker = {};
    this.mediasoupRouter = {};
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
