export interface Random {
  url: string;
  list: string[];
  pageNum: number;
}

export interface Error {
  message: string;
  name: string;
  describe: ErrorEvent | any;
}
