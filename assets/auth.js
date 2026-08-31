/* ==========================================================================
   KenshuLink — 認証状態管理（Supabase Auth 接続版）
   users.role の許容値: 'INSTRUCTOR' | 'COMPANY' | 'INDIVIDUAL' | 'ENGINEER'（Branch A） | 'ADMIN'
   ========================================================================== */

const ROLE_META = {
  INSTRUCTOR: { label: "講師" },
  COMPANY:    { label: "企業" },
  INDIVIDUAL: { label: "生徒" },
  ADMIN:      { label: "管理者" },
};

// register.html の役割カード（instructor/business/individual）→ users.role の実値
const ROLE_CARD_TO_DB = {
  instructor: "INSTRUCTOR",
  business:   "COMPANY",
  individual: "INDIVIDUAL",
};

let currentUser = null; // { id, role, name, status } / 未ログインなら null
let authReady = false;  // 初回セッション確認が完了したか
let needsProfileCompletion = false; // Supabase セッションはあるが public.users に行がまだ無い（OAuth初回サインアップ直後）

/* --- session から public.users の行を取得して currentUser にキャッシュする --- */
async function syncUserFromSession(session) {
  if (!session) {
    currentUser = null;
    needsProfileCompletion = false;
    return null;
  }

  const { data, error } = await supabaseClient
    .from("users")
    .select("id, role, name, status")
    .eq("id", session.user.id)
    .maybeSingle(); // 0件でも例外を投げない（OAuth初回サインアップ直後は0件になりうるため）

  if (!error && data) {
    currentUser = data;
    needsProfileCompletion = false;
  } else {
    // セッションはあるが public.users に行が無い＝ handle_new_user() トリガーが
    // OAuth初回サインアップで意図的に INSERT をスキップしたケース（role未確定）
    currentUser = null;
    needsProfileCompletion = true;
  }
  return currentUser;
}

function getCurrentUser() {
  return currentUser;
}

/* --- 新規登録：Supabase Auth に作成 → handle_new_user トリガーが
       public.users 行を role 付きで自動生成する（role は metadata で渡す）。
       currentUser の更新は下の onAuthStateChange（SIGNED_IN）に任せる。 --- */
async function signUpAccount(email, password, dbRole, name) {
  const { data, error } = await supabaseClient.auth.signUp({
    email,
    password,
    options: { data: { role: dbRole, name } },
  });
  if (error) return { error };
  return { data };
}

async function signInAccount(email, password) {
  const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });
  if (error) return { error };
  return { data };
}

async function signOutAccount() {
  await supabaseClient.auth.signOut();
  // currentUser のクリア・イベント発火は下の onAuthStateChange（SIGNED_OUT）が行う
}

/* --- 認証状態の唯一の情報源（重要） -------------------------------------------
   ⚠️ ページ読み込み時に getSession() を別途手動で呼ぶと、Google OAuth リダイレクト
   直後はまだ URL 内のトークン交換が完了しておらず、空のセッションを読んでしまう
   競合状態（race condition）が発生しうる（＝マイページで「ログインが必要です」と
   誤表示され、もう一度ログインし直すとなぜか入れる、という不具合の原因だった）。

   onAuthStateChange は Supabase 内部の初期化処理（OAuth コールバックの処理を含む）が
   完了した直後に、必ず1回 'INITIAL_SESSION' イベントを発火してくれる。これだけを
   信頼できる情報源として使うことで、上記の競合状態を避けられる。
   （DOMContentLoaded での個別の getSession() 呼び出しはあえて行わない）
   ------------------------------------------------------------------------- */
supabaseClient.auth.onAuthStateChange(async (_event, session) => {
  await syncUserFromSession(session);
  authReady = true;
  document.dispatchEvent(new CustomEvent("kenshulink:authchange"));

  // OAuth初回サインアップ直後（role未確定）の場合、プロフィール完成ページへ誘導する。
  // 無限リダイレクトを避けるため、complete-profile.html 自身では実行しない。
  const isCompleteProfilePage = location.pathname.endsWith("complete-profile.html");
  if (needsProfileCompletion && !isCompleteProfilePage) {
    location.href = "complete-profile.html";
  }
});

function showToast(message, duration = 2600) {
  let toast = document.querySelector(".toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.className = "toast";
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.classList.add("is-visible");
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => toast.classList.remove("is-visible"), duration);
}
