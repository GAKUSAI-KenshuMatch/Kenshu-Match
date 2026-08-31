"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/components/common/Toast";
import { supabase } from "@/lib/supabase/client";
import { completeOAuthProfile } from "@/services/auth";
import { RoleCard } from "@/components/auth/RoleCard";
import type { UserRole } from "@/types/database";

export default function CompleteProfilePage() {
  const { authReady, needsProfileCompletion, user, refreshProfile } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();

  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [nameHasError, setNameHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [hasSession, setHasSession] = useState<boolean | null>(null);

  useEffect(() => {
    if (!authReady) return;

    // すでにプロフィールが完成している（＝直接URLを叩いてこのページに来た）場合はマイページへ
    if (!needsProfileCompletion && user) {
      router.replace("/mypage");
      return;
    }

    // セッション自体が無い場合（未ログインで直接アクセス）はログインページへ
    if (!needsProfileCompletion && !user) {
      supabase.auth.getSession().then(({ data }) => {
        if (!data?.session) {
          router.replace("/login");
        } else {
          setHasSession(true);
        }
      });
      return;
    }

    // Googleアカウントの表示名を初期値として入れておく
    supabase.auth.getUser().then(({ data }) => {
      const meta = data?.user?.user_metadata || {};
      setDisplayName(meta.full_name || meta.name || "");
    });
  }, [authReady, needsProfileCompletion, user, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMessage("");

    const nameInvalid = displayName.trim().length === 0;
    setNameHasError(nameInvalid);

    if (!selectedRole || nameInvalid) {
      setErrorMessage(!selectedRole ? "役割を選択してください。" : "お名前を入力してください。");
      return;
    }

    setSubmitting(true);
    const { error } = await completeOAuthProfile(selectedRole, displayName.trim());
    setSubmitting(false);

    if (error) {
      setErrorMessage(`登録に失敗しました：${error.message}`);
      return;
    }

    showToast("登録が完了しました");
    // needsProfileCompletion を再判定させるため、セッションを読み直す
    await refreshProfile();
    setTimeout(() => router.push("/mypage"), 600);
  }

  if (!authReady || (!needsProfileCompletion && hasSession === null)) {
    return (
      <main className="auth-page">
        <div className="auth-card">
          <p style={{ color: "var(--color-ink-soft)", fontSize: 13 }}>読み込み中…</p>
        </div>
      </main>
    );
  }

  return (
    <main className="auth-page">
      <div className="auth-card">
        <p className="auth-card__eyebrow">ようこそ</p>
        <h1 className="auth-card__title">どちらの立場でご利用しますか？</h1>
        <p className="auth-card__desc">Googleアカウントでの初回ログインです。役割を選択して登録を完了してください。</p>

        {errorMessage && <div className="notice-banner is-visible">{errorMessage}</div>}

        <section>
          <div className="role-grid">
            <RoleCard
              hanko="講"
              name="研修講師"
              description="研修サービスを提供する。プロフィールを公開して依頼を受ける。"
              selected={selectedRole === "INSTRUCTOR"}
              onSelect={() => setSelectedRole("INSTRUCTOR")}
            />
            <RoleCard
              hanko="企"
              name="企業"
              description="自社の研修ニーズに合う講師を探し、依頼を送る。"
              selected={selectedRole === "COMPANY"}
              onSelect={() => setSelectedRole("COMPANY")}
            />
            <RoleCard
              hanko="生"
              name="生徒"
              description="生徒として学びたい分野の講師を探し、依頼を送る。"
              selected={selectedRole === "INDIVIDUAL"}
              onSelect={() => setSelectedRole("INDIVIDUAL")}
            />
          </div>
        </section>

        <form noValidate style={{ marginTop: 20 }} onSubmit={handleSubmit}>
          <div className={`form-field${nameHasError ? " has-error" : ""}`}>
            <label htmlFor="displayName">お名前</label>
            <input
              type="text"
              id="displayName"
              name="displayName"
              placeholder="山田 太郎"
              required
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
            />
            <p className="form-field__error">お名前を入力してください。</p>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn btn--primary btn--block" disabled={!selectedRole || submitting}>
              {submitting ? "登録中…" : "この内容で登録を完了する"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
