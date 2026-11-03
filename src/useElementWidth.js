import { useLayoutEffect, useState } from 'react';

const useElementWidth = ref => {
  const [width, setWidth] = useState(0);

  // 绘制前测量，避免依赖宽度的内容先以空壳（高度 0）被画出来
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) {
      return;
    }
    const update = () => setWidth(el.clientWidth);
    const resizeObserver = new ResizeObserver(update);
    resizeObserver.observe(el);
    update();
    return () => resizeObserver.disconnect();
  }, [ref]);

  return width;
};

export default useElementWidth;
