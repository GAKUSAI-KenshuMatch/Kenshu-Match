"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { updatePassword, signOut } from "@/lib/auth/auth";
import { useToast } from "@/components/common/Toast";

const EyeIcon = () => (
  <svg className="eye" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8Z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);
const EyeOffIcon = () => (
  <svg className="eye-off" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-7 0-11-8-11-8a18.5 18.5 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
    <path d="M1 1l22 22" />
  </svg>
);

export default function ResetPasswordPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const recoveryReadyRef = useRef(false);

  const [linkError, setLinkError] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordHasError, setPasswordHasError] = useState(false);
  const [confirmHasError, setConfirmHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    // Supabase が URL の hash からトークンを読み取り、自動的に
    // 「パスワード再設定用の一時セッション」を張る（PASSWORD_RECOVERY イベント）。
    const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""));
    const errorCode = hashParams.get("error_code");
    if (errorCode) {
      // Deferred a microtask so this doesn't set state synchronously within
      // the effect body (window.location is only readable client-side, so
      // this can't move into a render-time lazy initializer either).
      queueMicrotask(() =>
        setLinkError(
          errorCode === "otp_expired"
            ? "このリンクの有効期限が切れています。お手数ですが、もう一度パスワード再設定をリクエストしてください。"
            : "このリンクは無効です。お手数ですが、もう一度パスワード再設定をリクエストしてください。"
        )
      );
    }

    const supabase = createClient();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        recoveryReadyRef.current = true;
      }
    });

    (async () => {
      const { data } = await supabase.auth.getSession();
      if (data?.session) recoveryReadyRef.current = true;
    })();

    return () => subscription.unsubscribe();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMessage("");

    const passwordInvalid = password.length < 8;
    const confirmInvalid = password !== confirmPassword;
    setPasswordHasError(passwordInvalid);
    setConfirmHasError(confirmInvalid);
    if (passwordInvalid || confirmInvalid) return;

    if (!recoveryReadyRef.current) {
      setLinkError("リンクの有効期限が切れているか、無効です。もう一度パスワード再設定をリクエストしてください。");
      return;
    }

    setSubmitting(true);
    const { error } = await updatePassword(password);
    setSubmitting(false);

    if (error) {
      setErrorMessage(`更新に失敗しました：${error.message}`);
      return;
    }

    showToast("パスワードを更新しました。ログインしてください。");
    await signOut();
    setTimeout(() => router.push("/login"), 800);
  }

  return (
    <main className="auth-page">
      <div className="auth-card">
        <p className="auth-card__eyebrow">RESET PASSWORD</p>
        <h1 className="auth-card__title">新しいパスワードを設定</h1>
        <p className="auth-card__desc">新しいパスワードを入力してください。</p>

        {(linkError || errorMessage) && <div className="notice-banner is-visible">{linkError || errorMessage}</div>}

        {linkError ? (
          <div className="form-actions">
            <Link href="/forgot-password" className="btn btn--primary btn--block">
              パスワード再設定を再リクエストする
            </Link>
          </div>
        ) : (
          <form noValidate onSubmit={handleSubmit}>
            <div className={`form-field${passwordHasError ? " has-error" : ""}`}>
              <label htmlFor="newPassword">新しいパスワード</label>
              <div className="password-field">
                <input
                  type={showPassword ? "text" : "password"}
                  id="newPassword"
                  name="password"
                  placeholder="••••••••"
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  className={`password-field__toggle${showPassword ? " is-visible" : ""}`}
                  aria-label={showPassword ? "パスワードを非表示" : "パスワードを表示"}
                  onClick={() => setShowPassword((v) => !v)}
                >
                  <EyeIcon />
                  <EyeOffIcon />
                </button>
              </div>
              <p className="form-field__error">8文字以上のパスワードを入力してください。</p>
            </div>

            <div className={`form-field${confirmHasError ? " has-error" : ""}`}>
              <label htmlFor="confirmPassword">新しいパスワード（確認）</label>
              <div className="password-field">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  id="confirmPassword"
                  name="confirmPassword"
                  placeholder="••••••••"
                  required
                  minLength={8}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                <button
                  type="button"
                  className={`password-field__toggle${showConfirmPassword ? " is-visible" : ""}`}
                  aria-label={showConfirmPassword ? "パスワードを非表示" : "パスワードを表示"}
                  onClick={() => setShowConfirmPassword((v) => !v)}
                >
                  <EyeIcon />
                  <EyeOffIcon />
                </button>
              </div>
              <p className="form-field__error">パスワードが一致しません。</p>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn--primary btn--block" disabled={submitting}>
                {submitting ? "更新中…" : "パスワードを更新する"}
              </button>
            </div>
          </form>
        )}
      </div>
    </main>
  );
}
