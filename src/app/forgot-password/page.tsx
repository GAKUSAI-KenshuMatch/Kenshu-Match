"use client";

import { useState } from "react";
import Link from "next/link";
import { resetPasswordForEmail } from "@/lib/auth/auth";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [emailHasError, setEmailHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMessage("");
    setSuccess(false);

    const invalid = !email.includes("@");
    setEmailHasError(invalid);
    if (invalid) return;

    setSubmitting(true);
    const { error } = await resetPasswordForEmail(email, `${window.location.origin}/reset-password`);
    setSubmitting(false);

    if (error) {
      setErrorMessage(`送信に失敗しました：${error.message}`);
      return;
    }

    setSuccess(true);
    setEmail("");
  }

  return (
    <main className="auth-page">
      <div className="auth-card">
        <p className="auth-card__eyebrow">RESET PASSWORD</p>
        <h1 className="auth-card__title">パスワードをお忘れの方</h1>
        <p className="auth-card__desc">登録済みのメールアドレスを入力してください。パスワード再設定用のリンクをお送りします。</p>

        {errorMessage && <div className="notice-banner is-visible">{errorMessage}</div>}
        {success && (
          <div className="notice-banner is-visible" style={{ background: "#e8f7ef", color: "#1e7a4c" }}>
            メールを送信しました。受信トレイをご確認ください。
          </div>
        )}

        <form noValidate onSubmit={handleSubmit}>
          <div className={`form-field${emailHasError ? " has-error" : ""}`}>
            <label htmlFor="resetEmail">メールアドレス</label>
            <input
              type="email"
              id="resetEmail"
              name="email"
              placeholder="you@example.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <p className="form-field__error">メールアドレスを正しく入力してください。</p>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn btn--primary btn--block" disabled={submitting}>
              {submitting ? "送信中…" : "再設定用リンクを送る"}
            </button>
          </div>
        </form>

        <p className="auth-switch">
          <Link href="/login">ログイン画面に戻る</Link>
        </p>
      </div>
    </main>
  );
}
