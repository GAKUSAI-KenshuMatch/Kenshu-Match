"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/components/common/Toast";
import {
  getSubcategoriesForAdmin,
  renameSubcategory,
  deleteSubcategory,
  type AdminSubcategoryRow,
} from "@/lib/admin/subcategories";

function fmtDate(iso: string) {
  const d = new Date(iso);
  return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, "0")}/${String(d.getDate()).padStart(2, "0")}`;
}

function SubcategoryCard({
  row,
  onSaved,
  onDeleted,
}: {
  row: AdminSubcategoryRow;
  onSaved: (row: AdminSubcategoryRow) => void;
  onDeleted: (id: string) => void;
}) {
  const { showToast } = useToast();
  const [editing, setEditing] = useState(false);
  const [draftName, setDraftName] = useState(row.name);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [busy, setBusy] = useState(false);

  const inUse = row.instructor_count > 0 || row.request_count > 0;

  async function handleSave() {
    setBusy(true);
    const { error } = await renameSubcategory(row, draftName);
    setBusy(false);
    if (error) {
      showToast("名称の更新に失敗しました");
      return;
    }
    const nextName = draftName.trim() || row.name;
    onSaved({ ...row, name: nextName });
    setEditing(false);
    showToast("更新しました");
  }

  async function handleDelete() {
    setBusy(true);
    const { error } = await deleteSubcategory(row);
    setBusy(false);
    if (error) {
      showToast("削除に失敗しました（使用中の可能性があります）");
      setConfirmingDelete(false);
      return;
    }
    showToast("削除しました");
    onDeleted(row.id);
  }

  return (
    <div className="request-card">
      <div className="request-card__top">
        <div style={{ flex: 1, minWidth: 0 }}>
          <p className="request-card__meta">{row.category_name}</p>
          {editing ? (
            <div className="form-field" style={{ marginBottom: 0, maxWidth: 320 }}>
              <input
                value={draftName}
                onChange={(e) => setDraftName(e.target.value)}
                disabled={busy}
                autoFocus
              />
            </div>
          ) : (
            <div className="request-card__title">{row.name}</div>
          )}
        </div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          <span className={`status-badge ${row.instructor_count > 0 ? "status-badge--accepted" : "status-badge--cancelled"}`}>
            講師 {row.instructor_count}
          </span>
          <span className={`status-badge ${row.request_count > 0 ? "status-badge--accepted" : "status-badge--cancelled"}`}>
            依頼 {row.request_count}
          </span>
        </div>
      </div>

      <p className="request-card__meta">
        {row.created_by ? `ユーザーが自由入力で追加 ・ ${fmtDate(row.created_at)}` : `初期データ ・ ${fmtDate(row.created_at)}`}
      </p>

      <div className="request-card__actions">
        {editing ? (
          <>
            <button type="button" className="btn btn--primary btn--sm" onClick={handleSave} disabled={busy}>
              保存
            </button>
            <button
              type="button"
              className="btn btn--ghost btn--sm"
              onClick={() => {
                setDraftName(row.name);
                setEditing(false);
              }}
              disabled={busy}
            >
              キャンセル
            </button>
          </>
        ) : (
          <button type="button" className="btn btn--ghost btn--sm" onClick={() => setEditing(true)}>
            名称を編集
          </button>
        )}

        {!editing && !inUse && !confirmingDelete && (
          <button type="button" className="btn btn--danger btn--sm" onClick={() => setConfirmingDelete(true)}>
            削除
          </button>
        )}

        {!editing && confirmingDelete && (
          <>
            <span className="request-card__meta" style={{ alignSelf: "center" }}>
              本当に削除しますか？
            </span>
            <button type="button" className="btn btn--danger btn--sm" onClick={handleDelete} disabled={busy}>
              削除する
            </button>
            <button
              type="button"
              className="btn btn--ghost btn--sm"
              onClick={() => setConfirmingDelete(false)}
              disabled={busy}
            >
              やめる
            </button>
          </>
        )}

        {!editing && inUse && (
          <span className="request-card__meta">使用中のため削除できません（名称の編集は可能です）</span>
        )}
      </div>
    </div>
  );
}

export default function AdminSubcategoriesPage() {
  const { user, authReady } = useAuth();
  const [rows, setRows] = useState<AdminSubcategoryRow[] | null>(null);
  const [loadError, setLoadError] = useState(false);

  const load = useCallback(async () => {
    const { data, error } = await getSubcategoriesForAdmin();
    if (error || !data) {
      setLoadError(true);
      return;
    }
    setLoadError(false);
    setRows(data);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // proxy.ts already redirects non-ADMIN users away from /admin; this just
  // avoids rendering a flash of the page before that resolves client-side.
  if (!authReady) return null;
  if (!user || user.role !== "ADMIN") return null;

  return (
    <main className="list-page">
      <div className="list-page__head">
        <h1 className="list-page__title">サブカテゴリ管理</h1>
        <p className="list-page__count">
          {rows ? (
            <>
              全 <strong>{rows.length}</strong> 件・ユーザーが自由入力で追加したものも含みます
            </>
          ) : (
            "読み込み中…"
          )}
        </p>
      </div>

      {loadError && <p className="request-card__desc">読み込みに失敗しました。時間をおいて再度お試しください。</p>}

      {rows && rows.length === 0 && <p className="request-card__desc">サブカテゴリがありません。</p>}

      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {rows?.map((row) => (
          <SubcategoryCard
            key={row.id}
            row={row}
            onSaved={(updated) => setRows((prev) => prev?.map((r) => (r.id === updated.id ? updated : r)) ?? prev)}
            onDeleted={(id) => setRows((prev) => prev?.filter((r) => r.id !== id) ?? prev)}
          />
        ))}
      </div>
    </main>
  );
}
