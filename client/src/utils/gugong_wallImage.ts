/* eslint-disable max-len */
/* eslint-disable prefer-promise-reject-errors */
import axios, { AxiosError } from 'axios';
import { gugong, serve } from '../const/api';
import { random } from './utils';

/**
 * 返回包含原图页面的URL地址
 * @param source string 包含img与分页的html
 * @returns string[]
 */
const parseOriginWallImageUrl = (source: string) => {
  const imgDomList: (RegExpMatchArray | null) = source.match(/<a.*?target="_blank".*?>/g) || [];
  const urlList = imgDomList.map((url: string) => {
    const match = (url && url.match(/\shref=['"](.*?)['"]/)) || [];
    return match[1] ? `${gugong.domain}${match[1]}` : '';
  });
  return urlList;
};

/**
 *
 * @param source string 故宫壁纸页面的html
 * @returns string
 */
const parseTargetString = (source: string): string => {
  // eslint-disable-next-line no-useless-escape
  const matchList: (RegExpMatchArray | null) = source.match(/(\<\!\-\- 搜索 end \-\-\>[\s\S]*\<\!\-\- 分页 end \-\-\>)/g) || [];
  return matchList[0] || '';
};

/**
 * 获取故宫壁纸总页数
 * @param source 故宫壁纸页面的html
 * @returns string
 */
const totalPageNumber = (source: string) => {
  const matchList: (RegExpMatchArray | null) = source.match(/<a href="\/searchs\/royal\/category_id\/173\/wallpaper_type\/1007386\/is_calendar\/0\/p\/.*?">.*?<\/a>/g) || [];
  const domA = (matchList && matchList[matchList.length - 1]) || '';
  return domA.replace(/(<a href="\/searchs\/royal\/category_id\/173\/wallpaper_type\/1007386\/is_calendar\/0\/p\/.*?">)|(<\/a>)/g, '');
};

/**
 * 请求故宫某一页壁纸（随机）
 * @returns page url<string>
 */
const requestWallPage = () => new Promise<string>((resolve, reject) => {
  let currentCache: string[] = [];
  let totalPageNum = 1;
  // 当前有缓存则取缓存
  if (window.localStorage) {
    totalPageNum = Number(window.localStorage.getItem(gugong.pageNumCache) || 1);

    currentCache = JSON.parse(window.localStorage.getItem(gugong.imagePageCache) || '[]');
    if (Array.isArray(currentCache) && currentCache.length !== 0) {
      const randomIndex: number = random('round', 0, currentCache.length - 1);
      resolve(currentCache[randomIndex]);
    }
  }
  // 获取页面
  const randomPage: number = random('round', 1, totalPageNum);
  axios.post(`${serve.domain}/commonCors`, {
    originUrl: `${gugong.wallPage}${randomPage}.html`,
    methods: 'get',
  }).then((res: any) => {
    console.log(res);
    // 埋点
    if (res && res.code === 1) {
      const responseText: string = res.data;
      // eslint-disable-next-line no-useless-escape
      const targetString = parseTargetString(responseText);

      // 获取图片总页数并缓存
      const totalNum = totalPageNumber(targetString);

      const wallImageList = parseOriginWallImageUrl(targetString);

      // 更新缓存
      if (window.localStorage) {
        window.localStorage.setItem(gugong.imagePageCache, JSON.stringify(wallImageList));
        window.localStorage.setItem(gugong.pageNumCache, totalNum);
      }

      // 随机取一张图
      const randomIndex: number = random('round', 0, wallImageList.length - 1);
      resolve(wallImageList[randomIndex]);
    } else {
      reject({
        name: 'GUGONG_REQUESTWALLPAGE_RESPONSE_ERROR',
        describe: res,
        message: 'request gugong wallImage api error!',
      });
    }
  }).catch((error: AxiosError) => {
    // 监控
    reject({
      name: 'GUGONG_REQUESTWALLPAGE_ERROR',
      describe: error,
      message: error.message,
    });
  });
});

/**
 * 从原图页面中获取原图
 * @param url 原图页面URL
 * @returns string
 */
const getOriginImage = (url: string) => new Promise<string>((resolve, reject) => {
  axios.post(`${serve.domain}/commonCors`, {
    originUrl: url || '',
    methods: 'get',
  }).then((res: any) => {
    if (res && res.code === 1) {
      const responseText: string = res && res.data;
      // eslint-disable-next-line no-useless-escape
      const matchList = responseText.match(/\/Uploads\/Picture.*?\"/g);
      const image: string = Array.isArray(matchList) ? (matchList[0] || '') : '';
      resolve(`${gugong.domain}${image.replace(/"/g, '')}`);
    } else {
      reject({
        name: 'GET_ORIGIN_IMAGE_RESPONSE_ERROR',
        describe: res,
        message: 'get gugong origin image page error!',
      });
    }
  }).catch((error) => {
    reject({
      name: 'GET_ORIGIN_IMAGE_ERROR',
      message: error.message,
      describe: error,
    });
  });
});

export const getGuGongImage = () => requestWallPage().then((imagePageUrl: string) => getOriginImage(imagePageUrl));

export default {
  getGuGongImage,
};
