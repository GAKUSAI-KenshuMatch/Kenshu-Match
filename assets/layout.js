/* ==========================================================================
   KenshuLink — 共通レイアウト（ヘッダー / フッター）
   全ページで <div id="site-header"></div> / <div id="site-footer"></div>
   を用意すれば、ここから自動的に描画される。
   ========================================================================== */

/* --- ロール別のナビゲーションリンク ---------------------------------------
   ⚠️ FIX: 以前はここが固定配列（全ロール共通）になっており、
   INSTRUCTOR（講師）でログインしても「講師を探す」（instructors.html＝
   企業/個人が講師を探すためのページ）に飛ばされてしまっていた。
   本来は下記の通り、双方向のマッチングになる：
     - INSTRUCTOR（講師）        → 案件（依頼）を探す側
     - COMPANY / INDIVIDUAL      → 講師を探す側
   getNavLinks(user) が現在ログイン中のユーザーの role を見て、
   表示するナビゲーションを出し分ける。
   ------------------------------------------------------------------- */
function getNavLinks(user) {
  // 未ログイン：企業・個人向け（講師を探す）と、講師向け（案件を探す）の
  // 両方の入り口を見せる。「案件を探す」を未ログインでクリックした場合は
  // open-requests.html 側の renderGate("no-user") がログイン/新規登録への
  // 導線を表示する仕組みが既にあるため、ここではリンクを出すだけでよい。
  if (!user) {
    return [
      { href: "index.html", label: "トップ" },
      { href: "instructors.html", label: "講師を探す" },
      { href: "open-requests.html", label: "講師の方へ" },
    ];
  }

  if (user.role === "INSTRUCTOR") {
    // 講師：トップ + 案件（研修依頼）を探す側 + マイページ
    return [
      { href: "index.html", label: "トップ" },
      { href: "open-requests.html", label: "案件を探す" },
      { href: "mypage.html", label: "マイページ" },
    ];
  }

  // COMPANY / INDIVIDUAL（および将来ロール追加時のフォールバック）：トップ + 講師を探す側 + マイページ
  return [
    { href: "index.html", label: "トップ" },
    { href: "instructors.html", label: "講師を探す" },
    { href: "mypage.html", label: "マイページ" },
  ];
}

let currentActiveHref = ""; // renderNav() を authchange のたびに呼び直すために保持

function renderNav(activeHref) {
  const nav = document.querySelector(".main-nav");
  if (!nav) return;

  const user = typeof getCurrentUser === "function" ? getCurrentUser() : null;
  const links = getNavLinks(user);

  nav.innerHTML = links.map(link => `
    <a class="main-nav__link ${link.href === activeHref ? "is-active" : ""}" href="${link.href}">
      ${link.label}
    </a>
  `).join("");
}

function renderHeader(activeHref) {
  const el = document.getElementById("site-header");
  if (!el) return;
  el.classList.add("site-header"); // ⚠️ FIX: 外側の div に class が付いていなかったため .site-header の CSS が一切適用されていなかった

  currentActiveHref = activeHref;

  el.innerHTML = `
    <div class="site-header__inner">
      <a class="brand" href="index.html">
        <img class="brand__logo" src="assets/images/logo-07-teal.png" alt="KenshuLink" width="40" height="40">
        <span>
          <span class="brand__name">ケンシュウリンク</span>
          <span class="brand__sub">KENSHU LINK </span>
        </span>
      </a>

      <nav class="main-nav" aria-label="メインナビゲーション"></nav>

      <div class="header-actions" id="headerActions"></div>
    </div>
  `;

  // 初回描画時点では supabaseClient.auth のセッション確認がまだ完了しておらず
  // getCurrentUser() が null を返す可能性があるため、未ログイン状態としてまず描画。
  renderNav(activeHref);
  renderHeaderActions();

  // セッション確認が完了して role が判明したタイミング（kenshulink:authchange）で
  // ナビゲーションとヘッダーアクションの両方を role に応じて再描画する。
  document.addEventListener("kenshulink:authchange", () => {
    renderNav(currentActiveHref);
    renderHeaderActions();
  });
}

function renderHeaderActions() {
  const el = document.getElementById("headerActions");
  if (!el) return;
  const user = typeof getCurrentUser === "function" ? getCurrentUser() : null;

  if (!user) {
    el.innerHTML = `
      <a class="btn btn--ghost" href="login.html">ログイン</a>
      <a class="btn btn--primary" href="register.html">無料登録</a>
      <button class="nav-toggle" aria-label="メニューを開く"><span></span></button>
    `;
    return;
  }

  const roleLabel = ROLE_META[user.role]?.label || "";
  el.innerHTML = `
    <a class="header-user" href="mypage.html">
      <span class="hanko hanko--role" aria-hidden="true" style="width:26px;height:26px;font-size:12px;">${roleLabel.slice(0,1)}</span>
      <span class="header-user__name">${user.name}</span>
    </a>
    <button type="button" class="btn btn--ghost btn--sm" id="headerLogoutBtn">ログアウト</button>
    <button class="nav-toggle" aria-label="メニューを開く"><span></span></button>
  `;

  document.getElementById("headerLogoutBtn")?.addEventListener("click", async () => {
    await signOutAccount();
    window.location.href = "index.html";
  });
}

function renderFooter() {
  const el = document.getElementById("site-footer");
  if (!el) return;
  el.classList.add("site-footer"); // ⚠️ FIX: 同上。.site-footer の CSS（背景色など）が適用されていなかった

  el.innerHTML = `
    <div class="site-footer__inner">
      <div>
        <div class="brand">
          <img class="brand__logo" src="assets/images/logo-07-teal.png" alt="KenshuLink" width="32" height="32">
          <span class="brand__name" style="font-size:16px;">ケンシュウリンク</span>
        </div>
        <p class="site-footer__copy">© 2026 KenshuLink — 研修講師 × 企業・個人マッチング</p>
      </div>
      <div class="site-footer__links">
        <a href="terms.html">利用規約</a>
        <a href="privacy.html">プライバシーポリシー</a>
        <a href="contact.html">お問い合わせ</a>
        <a href="company.html">運営会社</a>
      </div>
    </div>
  `;
}

document.addEventListener("DOMContentLoaded", () => {
  const page = document.body.dataset.activeNav || "";
  renderHeader(page);
  renderFooter();
});

/* --- モバイル用ハンバーガーメニューの開閉 -------------------------------
   ヘッダーは renderHeaderActions() で何度も再描画される（ログイン状態変化のたび）ため、
   .nav-toggle に直接 addEventListener すると再描画のたびに消えてしまう。
   document への委譲（イベントデリゲーション）にすることで、再描画後も常に効くようにする。
   ------------------------------------------------------------------- */
document.addEventListener("click", (e) => {
  if (e.target.closest(".nav-toggle")) {
    document.querySelector(".main-nav")?.classList.toggle("is-open");
    return;
  }
  // ナビ内のリンクをクリックしたらメニューを閉じる（別ページへ遷移するため）
  if (e.target.closest(".main-nav__link")) {
    document.querySelector(".main-nav")?.classList.remove("is-open");
  }
});