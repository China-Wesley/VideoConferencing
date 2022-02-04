/* eslint-disable @typescript-eslint/no-var-requires */
const cryptoTemp = require('crypto');

// 密匙
const SECRET_KEY = 'jmu_uni_wzw_201821111106';

// md5 加密
function md5(content) {
  const md5Func = cryptoTemp.createHash('md5');
  return md5Func.update(content).digest('hex'); // 把输出编程16进制的格式
}

// 加密函数
function genPassword(password) {
  const str = `password=${password}&key=${SECRET_KEY}`; // 拼接方式是自定的，只要包含密匙即可
  return md5(str);
}

module.exports = {
  genPassword
};
