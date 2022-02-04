/* eslint-disable prefer-promise-reject-errors */
/* eslint-disable max-len */
import { Error as cError } from '../interface/utils';

/**
 *
 * @param type string 某一Math函数名 如floor
 * @param max 上限
 * @param min 下限
 * @returns <Random>
 */
export const random = (type: string, min = 0, max = 1): number => {
  if (Math && (Math as any)[type]) {
    return (Math as any)[type](((Math.random() * max) + min));
  }
  return Math.random();
};

export const loadImage = (url: string) => new Promise<HTMLImageElement | cError>((resolve, reject) => {
  const imageDom = document.createElement('img');
  imageDom.onload = () => {
    resolve(imageDom);
  };
  imageDom.onerror = (error: Event | string | cError | any) => {
    reject({
      name: 'LOAD_IMAGE_ERROR',
      message: error.message,
      describe: error,
    });
  };
  imageDom.src = url || '';
});

/**
 * 获取本地媒体资源
 * @param mediaConstraints mediaConfig
 * @returns
 */
export const getMedia = (mediaConstraints: any) => new Promise((resolve, reject) => {
  if (window.navigator) {
    if (window.navigator.mediaDevices) {
      navigator.mediaDevices.getUserMedia(mediaConstraints).then((stream: any) => {
        resolve(stream);
      }).catch((error) => {
        reject(error);
      });
    } else {
      reject(new Error('您的浏览器不支持视频通话！'));
    }
  } else {
    reject(new Error('您的浏览器不支持视频通话！'));
  }
});

/**
 * 解析cookie
 * @param value
 * @returns
 */
export const parseCookie = (value: any) => {
  if (value) {
    const keys = value.split(';');
    const result: any = {};
    keys.forEach((key: string) => {
      const [index, val] = key.split('=');
      result[index] = val;
    });
    return result;
  }
  return {};
};

export default {
  random,
  loadImage,
  getMedia,
  parseCookie,
};
