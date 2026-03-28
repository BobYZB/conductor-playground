import { useEffect, useState } from 'react';
import { AUTH_RETURN_TO_KEY, finishAuthFromUrl, getDefaultPostAuthUrl, isSupabaseConfigured } from '../lib/supabase';

export default function AuthCallback() {
  const [message, setMessage] = useState('正在完成登录...');

  useEffect(() => {
    let active = true;

    async function completeAuth() {
      if (!isSupabaseConfigured()) {
        setMessage('Supabase 未配置，无法完成登录。');
        return;
      }

      try {
        await finishAuthFromUrl();

        if (!active) {
          return;
        }

        setMessage('登录成功，正在返回你刚才的阅读位置...');

        const nextLocation = window.localStorage.getItem(AUTH_RETURN_TO_KEY) ?? getDefaultPostAuthUrl();

        window.localStorage.removeItem(AUTH_RETURN_TO_KEY);
        window.setTimeout(() => {
          window.location.replace(nextLocation);
        }, 500);
      } catch (error) {
        if (!active) {
          return;
        }

        setMessage(error instanceof Error ? error.message : '登录回调失败，请重新尝试。');
      }
    }

    void completeAuth();

    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="callback-panel">
      <p className="section-kicker">身份验证</p>
      <h1>登录回调处理中</h1>
      <p>{message}</p>
    </div>
  );
}
