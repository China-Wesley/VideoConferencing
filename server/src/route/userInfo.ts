/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/no-var-requires */
/** 登录接口 */
import express = require('express');
import { v4 as uuidv4 } from 'uuid';
import dbError from '../const/dbError';
const cors = require('cors');
const encode = require('../utils/encode');
import { crosOptions } from '../const/index';

const router = express.Router();

router.options('/*', cors(crosOptions));
router.post('/login', cors(crosOptions), (req: express.Request | any, res: express.Response) => {
  const { Models: { User } } = req.context;
  const { name, password } = req.body;
  const savePassword = encode.genPassword(password);

  User.findAll({
    attributes: ['name', 'uuid', 'password'],
    where: {
      name
    }
  }).then((data) => {
    if (data && data.length === 1) {
      if (savePassword === data[0].password) {
        req.session.user = name;
        res.cookie('vuser', `username=${name};uuid=${data[0].uuid}`, { maxAge: 60 * 60 * 24 * 1000, signed: false });
        res.send({
          code: 1,
          status: 'SUCCESS',
          message: '登录成功！',
          data: {
            name: data[0].name,
            uuid: data[0].uuid
          }
        });
      } else {
        res.send({
          code: -2,
          status: 'FAIL',
          message: '密码错误，请重试！'
        });
      }
    } else {
      res.send({
        code: -2,
        status: 'FAIL',
        message: '用户不存在，请重试'
      });
    }
  }).catch((error) => {
    const msgList = error && error.errors && error.errors.map((errInstance) => dbError[errInstance.message] || errInstance.message);

    res.send({
      code: -1,
      status: 'FAIL',
      message: `${error.name}: ${(msgList && msgList[0]) || '数据库查询失败！'}`
    });
  });
});

router.post('/sign', cors(crosOptions), (req: express.Request | any, res: express.Response) => {
  const { Models: { User } } = req.context;
  const { name, password } = req.body;

  const encodePassword = encode.genPassword(password);
  const uuid = uuidv4();
  User.create({
    name,
    uuid,
    password: encodePassword
  }).then(() => {
    // res.redirect('/login');
    // console.log(req.signedCookies);
    // console.log(req.session);
    // req.session.video_conferencing_uI = cookieValue;
    req.session.user = name;
    res.cookie('vuser', `username=${name};uuid=${uuid}`, { maxAge: 60 * 60 * 24 * 1000, signed: false });
    res.send({
      code: 1,
      status: 'SUCCESS',
      message: '注册成功！',
      data: {
        name,
        uuid
      }
    });
  }).catch((error) => {
    const msgList = error && error.errors && error.errors.map((errInstance) => dbError[errInstance.message] || errInstance.message);
    res.send({
      code: -1,
      status: 'FAIL',
      message: `${error.name}: ${(msgList && msgList[0]) || '数据入库失败！'}`
    });
  });
});
export default router;
