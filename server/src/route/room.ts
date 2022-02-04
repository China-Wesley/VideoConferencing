/* eslint-disable @typescript-eslint/no-var-requires */
/** 负责转发客户端跨域的请求 */
import express = require('express');
const cors = require('cors');
const { randomNum } = require('../utils/utils');
import initMediasoupWorker from '../initMediasoupWorker';
import initWebSocket from '../initWebSocket';
// const { handleAxiosError } = require('../utils/utils');
const roomUUid = [];

const router = express.Router();
router.options('/*', cors());

router.post('/createRoom', cors(), (req: express.Request | any, res: express.Response) => {
  const { Models: { Room } } = req.context;
  const { roomCode } = req.body;

  let uuid = 0;
  while (!uuid || roomUUid.includes(uuid)) {
    uuid = randomNum();
  }

  roomUUid.push(uuid);

  // 初始化当前房间服务
  initMediasoupWorker(uuid).then(() => {
    initWebSocket(uuid);
    console.log('房间服务创建好了');
  }).catch();
  Room.create({
    uuid,
    password: roomCode
  }).then(() => {
    res.send({
      code: 1,
      status: 'SUCCESS',
      message: `创建房间成功！房间号为${uuid}`,
      data: {
        roomId: uuid,
        password: roomCode
      }
    });
  }).catch(() => {
    res.send({
      code: -1,
      status: 'FAIL',
      message: '创建房间失败！'
    });
  });
});

router.post('/enterRoom', cors(), (req: express.Request | any, res: express.Response) => {
  const { Models: { Room } } = req.context;
  const { roomId, roomCode } = req.body;

  Room.findAll({
    attributes: ['uuid', 'password'],
    where: {
      uuid: roomId
    }
  }).then((data) => {
    if (data && data.length === 1) {
      if (data[0].password) {
        if (roomCode === data[0].password) {
          res.send({
            code: 1,
            status: 'SUCCESS',
            message: '进入房间成功！',
            data: {
              roomId,
              roomCode
            }
          });
        } else {
          res.send({
            code: -2,
            status: 'FAIL',
            message: '密码错误！'
          });
        }
      } else {
        res.send({
          code: 1,
          status: 'SUCCESS',
          message: '进入房间成功！',
          data: {
            roomId,
            roomCode
          }
        });
      }
    } else {
      res.send({
        code: -2,
        status: 'FAIL',
        message: '房间不存在，请确认房间号是否正确！'
      });
    }
  }).catch(() => {
    res.send({
      code: -1,
      status: 'FAIL',
      message: '内部错误！'
    });
  });
});

router.post('/leaveRoom', cors(), (req: express.Request | any, res: express.Response) => {
  const { Models: { Room } } = req.context;
  const { roomId } = req.body;

  const idIndex = roomUUid.indexOf(roomId);
  roomUUid.splice(idIndex, 1);

  Room.destroy({
    where: {
      uuid: roomId
    }
  }).then(() => {
    res.send({
      code: 1,
      status: 'FAIL',
      message: '已退出房间，您是最后一位成员，房间已自动关闭！',
      data: {
        roomId
      }
    });
  }).catch(() => {
    res.send({
      code: -1,
      status: 'FAIL',
      message: '内部错误！'
    });
  });
});

export default router;
