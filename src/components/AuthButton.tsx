import { useEffect, useState, type FormEvent } from 'react';
import type { User } from '@supabase/supabase-js';
import {
  AUTH_RETURN_TO_KEY,
  getAuthCallbackUrl,
  getCurrentUser,
  isSupabaseConfigured,
  onAuthStateChange,
  signInWithMagicLink,
  signOut,
} from '../lib/supabase';

export default function AuthButton() {
  const [user, setUser] = useState<User | null>(null);
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const configured = isSupabaseConfigured();

  useEffect(() => {
    if (!configured) {
      return;
    }

    let active = true;

    getCurrentUser()
      .then((nextUser) => {
        if (active) {
          setUser(nextUser);
        }
      })
      .catch(() => {
        if (active) {
          setMessage('暂时无法读取登录状态。');
        }
      });

    const unsubscribe = onAuthStateChange((nextUser) => {
      if (active) {
        setUser(nextUser);
      }
    });

    return () => {
      active = false;
      unsubscribe();
    };
  }, [configured]);

  async function handleSignIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!email.trim()) {
      setMessage('请输入邮箱地址。');
      return;
    }

    try {
      setBusy(true);
      setMessage(null);
      window.localStorage.setItem(AUTH_RETURN_TO_KEY, window.location.href);
      await signInWithMagicLink(email.trim(), getAuthCallbackUrl());
      setMessage('魔法链接已发送，请在邮箱中完成登录。');
      setShowForm(false);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : '发送登录链接失败。');
    } finally {
      setBusy(false);
    }
  }

  async function handleSignOut() {
    try {
      setBusy(true);
      setMessage(null);
      await signOut();
      setUser(null);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : '退出失败。');
    } finally {
      setBusy(false);
    }
  }

  if (!configured) {
    return (
      <div className="auth-widget auth-widget--disabled">
        <button className="button button--ghost" type="button" disabled>
          未配置同步
        </button>
      </div>
    );
  }

  if (user) {
    return (
      <div className="auth-widget">
        <div className="auth-widget__signed-in">
          <span>{user.email ?? '已登录'}</span>
          <button className="button button--ghost" type="button" onClick={handleSignOut} disabled={busy}>
            退出
          </button>
        </div>
        {message ? <p className="auth-widget__message">{message}</p> : null}
      </div>
    );
  }

  return (
    <div className="auth-widget">
      <button
        className="button button--ghost"
        type="button"
        onClick={() => setShowForm((current) => !current)}
        disabled={busy}
      >
        邮箱登录
      </button>

      {showForm ? (
        <form className="auth-form" onSubmit={handleSignIn}>
          <label>
            <span>邮箱</span>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
            />
          </label>
          <button className="button button--primary" type="submit" disabled={busy}>
            {busy ? '发送中...' : '发送魔法链接'}
          </button>
        </form>
      ) : null}

      {message ? <p className="auth-widget__message">{message}</p> : null}
    </div>
  );
}
