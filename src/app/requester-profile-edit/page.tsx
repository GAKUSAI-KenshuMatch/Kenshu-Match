"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/components/common/Toast";
import { useRoleTheme } from "@/hooks/useRoleTheme";
import { getRequesterProfile, upsertRequesterProfile } from "@/lib/requester/profile";

export default function RequesterProfileEditPage() {
  const { authReady, user } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();
  useRoleTheme("business");

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [companyName, setCompanyName] = useState("");
  const [website, setWebsite] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const isCompany = user?.role === "COMPANY";

  useEffect(() => {
    if (!authReady || !user) return;
    if (user.role !== "COMPANY" && user.role !== "INDIVIDUAL") {
      return;
    }

    (async () => {
      const { data, error } = await getRequesterProfile(user.id);
      if (error) {
        setLoadError(error.message);
        setLoading(false);
        return;
      }
      setCompanyName(data?.company_name || (user.role === "COMPANY" ? user.name : "") || "");
      setWebsite(data?.website || "");
      setPhone(data?.phone || "");
      setAddress(data?.address || "");
      setNotes(data?.notes || "");
      setLoading(false);
    })();
  }, [authReady, user]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setErrorMessage("");

    const payload: Parameters<typeof upsertRequesterProfile>[0] = {
      id: user.id,
      phone: phone.trim() || null,
      address: address.trim() || null,
      notes: notes.trim() || null,
    };
    if (isCompany) {
      payload.company_name = companyName.trim() || null;
      payload.website = website.trim() || null;
    }

    setSubmitting(true);
    const { error } = await upsertRequesterProfile(payload);
    setSubmitting(false);

    if (error) {
      setErrorMessage(`保存に失敗しました：${error.message}`);
      return;
    }

    showToast("プロフィールを保存しました");
    setTimeout(() => router.push("/mypage"), 700);
  }

  if (!authReady) {
    return (
      <main className="auth-page" style={{ alignItems: "flex-start", paddingTop: 40 }}>
        <div className="auth-card" style={{ maxWidth: 560 }}>
          <p style={{ color: "var(--color-ink-soft)", fontSize: 13 }}>読み込み中…</p>
        </div>
      </main>
    );
  }

  return (
    <main className="auth-page" style={{ alignItems: "flex-start", paddingTop: 40 }}>
      <div className="auth-card" style={{ maxWidth: 560 }}>
        <p className="auth-card__eyebrow">REQUESTER PROFILE</p>
        <h1 className="auth-card__title">{isCompany ? "企業プロフィール" : "生徒プロフィール"}</h1>
        <p className="auth-card__desc">
          ここで入力した電話番号・会社情報は、依頼が承諾され連絡先が開示された後にのみ講師に共有されます。
        </p>

        {errorMessage && <div className="notice-banner is-visible">{errorMessage}</div>}

        {!user ? (
          <p style={{ fontSize: 13 }}>
            プロフィールを編集するにはログインしてください。{" "}
            <Link href="/login" style={{ color: "var(--color-primary)", fontWeight: 700 }}>
              ログイン
            </Link>
          </p>
        ) : user.role !== "COMPANY" && user.role !== "INDIVIDUAL" ? (
          <>
            <p style={{ fontSize: 13 }}>このページは企業・個人アカウントのみ利用できます。</p>
            <Link href="/mypage" className="btn btn--ghost" style={{ marginTop: 12 }}>
              マイページへ戻る
            </Link>
          </>
        ) : loading ? (
          <p style={{ color: "var(--color-ink-soft)", fontSize: 13 }}>読み込み中…</p>
        ) : loadError ? (
          <p style={{ color: "var(--color-danger)", fontSize: 13 }}>読み込みエラー：{loadError}</p>
        ) : (
          <form noValidate onSubmit={handleSubmit}>
            {isCompany && (
              <>
                <div className="form-field">
                  <label htmlFor="companyName">会社名</label>
                  <input
                    type="text"
                    id="companyName"
                    placeholder="株式会社サンプル"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                  />
                </div>
                <div className="form-field">
                  <label htmlFor="website">企業のホームページ（任意）</label>
                  <input
                    type="text"
                    id="website"
                    placeholder="https://example.com"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                  />
                </div>
              </>
            )}

            <div className="form-field">
              <label htmlFor="phone">電話番号</label>
              <input type="text" id="phone" placeholder="090-xxxx-xxxx" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>

            <div className="form-field">
              <label htmlFor="address">住所（任意）</label>
              <input
                type="text"
                id="address"
                placeholder="例：東京都渋谷区..."
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>

            <div className="form-field">
              <label htmlFor="notes">備考（任意）</label>
              <textarea
                id="notes"
                rows={3}
                placeholder="研修担当としての補足事項があればご記入ください"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn--primary btn--block" disabled={submitting}>
                {submitting ? "保存中…" : "保存する"}
              </button>
            </div>
          </form>
        )}
      </div>
    </main>
  );
}
