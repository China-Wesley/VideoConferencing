/* eslint-disable prefer-promise-reject-errors */
/* eslint-disable max-len */
import { Error } from '../interface/utils';

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

export const loadImage = (url: string) => new Promise<HTMLImageElement | Error>((resolve, reject) => {
  const imageDom = document.createElement('img');
  imageDom.onload = () => {
    resolve(imageDom);
  };
  imageDom.onerror = (error: Event | string | Error | any) => {
    reject({
      name: 'LOAD_IMAGE_ERROR',
      message: error.message,
      describe: error,
    });
  };
  imageDom.src = url || '';
});

export default {
  random,
  loadImage,
};
