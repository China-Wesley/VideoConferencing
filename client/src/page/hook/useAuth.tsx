/* eslint-disable react/jsx-props-no-spreading */
import React from 'react';
import { Navigate } from 'react-router-dom';
import Cookie from 'js-cookie';
import useMessage from './useMessage';
// import { parseCookie } from '../../utils/utils';

/**
 * TODO: 更好的路由守卫方式
 * @param children
 * @param auth
 * @returns
 */
export default function useAuth(children: any, auth: boolean) {
  const vuser = Cookie.get('vuser');
  //   const context = parseCookie(vuser);
  if (auth) {
    if (!vuser && window.location.pathname !== '/') {
      useMessage('您暂时没有权限，请先登录！', { type: 'error' });
      return <Navigate to="/" />;
    }
    // setUser(context);
    return children;
  }
  //   setUser(context);
  return children;
}
