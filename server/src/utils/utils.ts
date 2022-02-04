/* eslint-disable @typescript-eslint/no-var-requires */
// eslint-disable-next-line no-unused-vars
import axios = require('axios');

exports.handleAxiosError = (error: axios.AxiosError) => {
  if (error.response) {
    return {
      data: error.response.data,
      status: error.response.status,
      headers: error.response.headers
    };
  } if (error.request) {
    return error.request;
  }
  return error.message;
};

exports.randomNum = () => {
  let mm = Math.random();
  let six = 0;
  if (mm > 0.1) {
    six = Math.round(mm * 1000000);
  } else {
    mm += 0.1;
    six = Math.round(mm * 1000000);
  }
  return six;
};
