export default (function PageResize() {
  let timer: NodeJS.Timeout;
  const delayFunc = (fn: () => void) => {
    const delay = 300;// 根据实际情况可调整延迟时间
    // 这里延时执行你的函数
    timer = setTimeout(() => {
      clearTimeout(timer);
      fn();
    }, delay);
  };

  (function getResize() {
    const width = window.innerWidth
    || (window as any).documentElement.clientWidth
    || (window as any).body.clientWidth;
    // width = width > 750 ? 750 : width;
    // width = width < 320 ? 320 : width;
    document.documentElement.style.fontSize = `${width / 24}px`;
    if (!window.onresize) {
      window.onresize = () => {
        delayFunc(getResize);
      };
    }
  }());
}());
