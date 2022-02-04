export interface GugongApi {
  defaultUrl: string;
  domain: string;
  wallPage: string;
  imagePageCache: string;
  pageNumCache: string;
}

export interface Server {
  domain: string;
  listenPort: number;
}
