import { useEffect, useState } from 'react';
import { AUTH_RETURN_TO_KEY, getDefaultPostAuthUrl, isSupabaseConfigured, waitForAuthCallback } from '../lib/supabase';
import { withBase } from '../lib/paths';

const PKCE_ERROR_HINT = 'code verifier';

function isPkceError(error: unknown): boolean {
  if (error instanceof Error) {
    return error.message.toLowerCase().includes(PKCE_ERROR_HINT);
  }

  return false;
}

export default function AuthCallback() {
  const [message, setMessage] = useState('正在完成登录...');
  const [failed, setFailed] = useState(false);
  const [pkceError, setPkceError] = useState(false);

  useEffect(() => {
    let active = true;

    async function completeAuth() {
      if (!isSupabaseConfigured()) {
        setMessage('Supabase 未配置，无法完成登录。');
        setFailed(true);
        return;
      }

      try {
        // SDK auto-detects the code in the URL and exchanges it via PKCE.
        // We just wait for the SIGNED_IN event instead of calling
        // exchangeCodeForSession manually (which would double-consume the code).
        await waitForAuthCallback();

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

        if (isPkceError(error)) {
          setPkceError(true);
          setMessage('登录验证信息已失效。这通常是因为你在不同的浏览器或设备中打开了登录链接，或者浏览器存储已被清除。');
        } else {
          setMessage(error instanceof Error ? error.message : '登录回调失败，请重新尝试。');
        }

        setFailed(true);
      }
    }

    void completeAuth();

    return () => {
      active = false;
    };
  }, []);

  function handleRetry() {
    window.location.href = withBase('/');
  }

  return (
    <div className="callback-panel">
      <p className="section-kicker">身份验证</p>
      <h1>{failed ? '登录失败' : '登录回调处理中'}</h1>
      <p>{message}</p>
      {pkceError ? (
        <p style={{ color: 'var(--color-text-muted, #666)', fontSize: '0.9em' }}>
          请在发起登录的同一浏览器中点击邮件中的链接，或重新发起登录。
        </p>
      ) : null}
      {failed ? (
        <button
          className="button button--primary"
          type="button"
          onClick={handleRetry}
          style={{ marginTop: '1rem' }}
        >
          返回首页重新登录
        </button>
      ) : null}
    </div>
  );
}
