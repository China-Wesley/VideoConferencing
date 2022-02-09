/* eslint-disable max-len */
import axios from 'axios';
// // 添加响应拦截器
const axiosInstance = axios.create({
  withCredentials: true,
});

axiosInstance.interceptors.response.use((response) => {
  console.log('axios response', response);
  return response && response.data;
}, (error) => Promise.reject(error));

export default axiosInstance;
