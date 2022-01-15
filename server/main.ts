/* eslint-disable @typescript-eslint/no-var-requires */
const config = require('./config');
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
import { initDatabase } from './src/database/index';
import router from './src/route/index';

app.use(bodyParser());

initDatabase().then((Models) => {
  app.use((req, res, next) => {
    req.context = { Models };
    next();
  });

  app.use('/user', router.userInfo);
}).catch((error) => {
  console.log(error);
});

app.use('/commonCors', router.commonCORS);

app.listen(config.port, () => {
  console.log(`Server Start in ${config.port} port!`);
});
