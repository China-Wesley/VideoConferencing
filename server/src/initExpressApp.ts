/* eslint-disable @typescript-eslint/no-var-requires */
const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
import { initDatabase } from './database/index';
import router from './route/index';
const session = require('express-session');
import Context from './context';

function storeExpressApp(expressApp) {
  const context = Context();
  context.expressApp = expressApp;
}

// 创建 express app
const initExpressApp = () => {
  return new Promise((resolve, reject) => {
    const app = express();

    storeExpressApp(app);

    app.use(bodyParser());
    app.use(cookieParser('jmu_uni_cookie_secret'));

    app.use(session({
      name: 'vcs', // 这里是cookie的name，默认是connect.sid
      secret: 'jmu_uni_cookie_secret', // 建议使用 128 个字符的随机字符串
      resave: true,
      saveUninitialized: false,
      cookie: { maxAge: 24 * 60 * 60 * 1000, httpOnly: true }
      // store: new redisStore({
      //     host: '127.0.0.1',
      //     port: '6379',
      //     db: 0,
      //     pass: '',
      // })
    }));

    app.use(express.json());
    app.use(express.static(__dirname));
    app.use((error, req, res, next) => {
      if (error) {
        const err = error;
        console.warn('Express app error,', err.message);

        err.status = err.status || (err.name === 'TypeError' ? 400 : 500);

        res.statusMessage = err.message;
        res.status(err.status).send(String(err));
      } else {
        next();
      }
    });
    app.use('/commonCors', router.commonCORS);

    // 初始化数据库
    initDatabase().then((Models) => {
      app.use((req, res, next) => {
        req.context = { Models };
        next();
      });

      app.use('/user', router.userInfo);
      app.use('/room', router.room);
      // app.listen(3000, () => { console.log('success'); });
      resolve(app);
    }).catch((error) => {
      console.log(error);
      reject(error);
    });
  });
};

export default initExpressApp;
