/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/no-var-requires */
/** 登录接口 */
import express = require('express');
import { v4 as uuidv4 } from 'uuid';
import dbError from '../const/dbError';
const cors = require('cors');

const router = express.Router();

router.options('/*', cors());
router.post('/login', cors(), (req: express.Request | any, res: express.Response) => {
  const { Models: { User } } = req.context;
  const { name, password } = req.body;
  User.create({
    name,
    uuid: uuidv4(),
    password
  }).then(() => {
    res.send('login');
  }).catch((error) => {
    res.send(error);
  });
});

router.post('/sign', cors(), (req: express.Request | any, res: express.Response) => {
  const { Models: { User } } = req.context;
  const { name, password } = req.body;
  User.create({
    name,
    uuid: uuidv4(),
    password
  }).then(() => {
    res.send('sign');
  }).catch((error) => {
    const msgList = error && error.errors && error.errors.map((errInstance) => dbError[errInstance.message] || errInstance.message);
    res.send({
      code: -1,
      status: 'FAIL',
      message: `${error.name}: ${msgList[0] || '数据入库失败！'}`
    });
  });
});
export default router;
