/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable prefer-promise-reject-errors */
const axios = require('axios');

// type = 0 先list后

const gugong = {
  domain: 'https://www.dpm.org.cn',
  wallPage: 'https://www.dpm.org.cn/searchs/royal/category_id/173/wallpaper_type/1007386/is_calendar/0/p/',
  defaultUrl: 'https://www.dpm.org.cn/searchs/royal/category_id/173/wallpaper_type/1007386/p/1.html',
  imagePageCache: 'jmu_video_conferencing_wallImage',
  pageNumCache: 'jmu_video_conferencing_pageNum'
};

const random = (type: string, min = 0, max = 1): number => {
  if (Math && (Math as any)[type]) {
    return (Math as any)[type](((Math.random() * max) + min));
  }
  return Math.random();
};

/**
 * 获取源图片list
 * @param source string 故宫壁纸html
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
const requestWallPage = (page) => new Promise((resolve, reject) => {
  // 获取页面
  axios.get(`${gugong.wallPage}${page}.html`, {}).then((res) => {
    // 埋点
    if (res && res.statusText === 'OK' && (res.data || res.request)) {
      const responseText: string = res.data || (res.request && res.request.response);
      // eslint-disable-next-line no-useless-escape
      const targetString = parseTargetString(responseText);

      // 获取图片总页数并缓存
      const totalNum = totalPageNumber(targetString);

      const wallImageList = parseOriginWallImageUrl(targetString);

      // 随机取一张图
      const randomIndex: number = random('round', 0, wallImageList.length - 1);
      resolve({
        totalNum,
        wallImageList,
        imagePageUrl: wallImageList[randomIndex]
      });
    } else {
      reject();
    }
  }).catch((error) => {
    // 监控
    reject(error);
  });
});

/**
   * 从原图页面中获取原图
   * @param url 原图页面URL
   * @returns string
   */
const getOriginImage = (parseRes) => new Promise((resolve, reject) => {
  const { imagePageUrl: url, wallImageList, totalNum } = parseRes;
  axios.get(url || '').then((res) => {
    if (res && res.statusText === 'OK' && (res.data || res.request)) {
      const responseText: string = res.data || (res.request && res.request.response);
      // eslint-disable-next-line no-useless-escape
      const matchList = responseText.match(/\/Uploads\/Picture.*?\"/g);
      const image: string = Array.isArray(matchList) ? (matchList[0] || '') : '';
      resolve({
        url: `${gugong.domain}${image.replace(/"/g, '')}`,
        pageList: wallImageList,
        totalNum
      });
    } else {
      reject();
    }
  }).catch((error) => {
    reject(error);
  });
});

const getGuGongImage = (page = 1) => requestWallPage(page).then((parseRes) => getOriginImage(parseRes));

module.exports = (res) => {
  getGuGongImage(res);
};
