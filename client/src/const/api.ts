import { GugongApi, Server } from '../interface/api';

/** 故宫壁纸api (故宫壁纸页面为服务端渲染，因此以获取到的页面爬去壁纸URL) */
export const gugong: GugongApi = {
  domain: 'https://www.dpm.org.cn',
  wallPage: 'https://www.dpm.org.cn/searchs/royal/category_id/173/wallpaper_type/1007386/is_calendar/0/p/',
  defaultUrl: 'https://www.dpm.org.cn/searchs/royal/category_id/173/wallpaper_type/1007386/p/1.html',
  imagePageCache: 'jmu_video_conferencing_wallImage',
  pageNumCache: 'jmu_video_conferencing_pageNum',
};

export const serve: Server = {
  domain: 'http://localhost:3000',
};

export default {
  gugong,
};
