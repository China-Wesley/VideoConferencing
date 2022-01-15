/* eslint-disable @typescript-eslint/no-var-requires */
/** 负责转发客户端跨域的请求 */
import express = require('express');
const cors = require('cors');

const axios = require('axios');
// const { handleAxiosError } = require('../utils/utils');

const router = express.Router();

const commonCORS = (req: express.Request, res: express.Response) => {
  console.log(req.body);
  const { originUrl: url, methods, params } = req.body;
  axios({
    url,
    methods,
    ...params
  }).then((response) => {
    if (response && response.statusText === 'OK' && (response.data || response.request)) {
      res.send({
        status: 'SUCCESS',
        data: (response.data || response.request.response),
        code: 1,
        message: '转发成功成功！'
      });
    } else {
      res.send({
        status: 'FAIL',
        code: -2,
        message: JSON.stringify(response.response)
      });
    }
  }).catch(() => {
    res.send({
      code: -1,
      status: 'FAIL',
      message: '请求转发失败！'
    });
  });
};

router.options('/', cors());
router.post('/', cors(), commonCORS);

export default router;
