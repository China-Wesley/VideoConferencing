/* eslint-disable react/jsx-props-no-spreading */
import React from 'react';
import { Navigate } from 'react-router-dom';
// import { parseCookie } from '../../utils/utils';

/**
 * TODO: 更好的路由守卫方式
 * @param children
 * @param auth
 * @returns
 */
export default function useAuth(children: any, room: any) {
  if (!room?.roomId) {
    if (window.location.pathname !== '/createRoom') {
      return <Navigate to="/createRoom" />;
    }
    return children;
  }
  return children;
}
