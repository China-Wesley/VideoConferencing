/* eslint-disable max-len */
/* eslint-disable react/jsx-props-no-spreading */
import React, { useRef, useEffect } from 'react';
import Collapse from '@mui/material/Collapse';
import Fade from '@mui/material/Fade';
import Grow from '@mui/material/Grow';
import Slide from '@mui/material/Slide';
import Zoom from '@mui/material/Zoom';

// 添加动画hook
export default function useAnimation(Component: JSX.Element | Element, config: any = {}, show = true) {
  const defaultConfig = {
    type: 'fade',
  };
  const curConfig = { ...defaultConfig, ...config };
  const Animation = useRef(Fade);

  useEffect(() => {
    switch (curConfig.type) {
      case 'collapse': (Animation.current = Collapse); break;
      case 'grow': (Animation.current = Grow); break;
      case 'slide': (Animation.current = Slide); break;
      case 'zoom': (Animation.current = Zoom); break;
      default: (Animation.current = Fade); break;
    }
  }, [curConfig.type]);

  const CAnimation = Animation.current;
  return (
    <CAnimation in={show} {...curConfig}>
      {Component}
    </CAnimation>
  );
}
