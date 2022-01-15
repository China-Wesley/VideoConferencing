declare const axios: any;
declare const gugong: {
    domain: string;
    wallPage: string;
    defaultUrl: string;
    imagePageCache: string;
    pageNumCache: string;
};
declare const random: (type: string, min?: number, max?: number) => number;
/**
 * 获取源图片list
 * @param source string 故宫壁纸html
 * @returns string[]
 */
declare const parseOriginWallImageUrl: (source: string) => string[];
/**
   *
   * @param source string 故宫壁纸页面的html
   * @returns string
   */
declare const parseTargetString: (source: string) => string;
/**
   * 获取故宫壁纸总页数
   * @param source 故宫壁纸页面的html
   * @returns string
   */
declare const totalPageNumber: (source: string) => string;
/**
   * 请求故宫某一页壁纸（随机）
   * @returns page url<string>
   */
declare const requestWallPage: (page: any) => Promise<unknown>;
/**
   * 从原图页面中获取原图
   * @param url 原图页面URL
   * @returns string
   */
declare const getOriginImage: (parseRes: any) => Promise<unknown>;
declare const getGuGongImage: (page?: number) => Promise<unknown>;
