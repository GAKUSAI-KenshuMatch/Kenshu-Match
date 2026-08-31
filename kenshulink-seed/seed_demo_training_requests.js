/**
 * KenshuLink Branch B — Seed demo training requests (公募案件)
 * Tạo ~40 案件 (training_requests) công khai, gán ngẫu nhiên cho các tài khoản
 * demo-company-* / demo-individual-* đã có sẵn (từ seed_demo_accounts.js).
 *
 * ĐIỀU KIỆN TIÊN QUYẾT:
 *   Phải chạy seed_demo_accounts.js TRƯỚC (cần có sẵn 50 company + 50 individual
 *   demo users trong bảng public.users để script này gán làm requester_id).
 *
 * CÁCH CHẠY:
 *   1. npm install (trong cùng thư mục kenshulink-seed, dùng chung package.json)
 *   2. Set 2 biến môi trường (giống seed_demo_accounts.js):
 *        export SUPABASE_URL="https://gsqaggzafutqeypkamae.supabase.co"
 *        export SUPABASE_SERVICE_ROLE_KEY="...service role key..."
 *   3. node seed_demo_training_requests.js
 *
 * ⚠️ Dùng service role key — chỉ chạy trên máy của bạn, KHÔNG commit lên GitHub.
 * ⚠️ Toàn bộ request tạo ra đều là công khai (target_instructor_id = null,
 *    status = 'pending') để hiện ra ở "案件を探す" (đã login講師) và
 *    "講師の方へ" (preview chưa login).
 */

const { createClient } = require("@supabase/supabase-js");

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const EMAIL_DOMAIN = "kenshulink-demo.test";
const REQUEST_COUNT = 40; // 作成する公募案件の件数

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error("Thiếu SUPABASE_URL hoặc SUPABASE_SERVICE_ROLE_KEY trong biến môi trường.");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// ---------- Dữ liệu mẫu tiếng Nhật ----------
const TITLE_TEMPLATES = [
  "{subcat}研修の講師を探しています",
  "{subcat}に関する社内研修をお願いしたいです",
  "新入社員向け{subcat}研修の実施",
  "{subcat}スキルアップ研修の講師募集",
  "管理職向け{subcat}研修をお願いします",
  "{subcat}の実践講座を開催したいです",
];

const DESCRIPTION_TEMPLATES = [
  (subcat) => `${subcat}について、実務レベルまで踏み込んだ研修をお願いできる講師の方を探しています。初めての開催のため、内容のご提案も歓迎です。`,
  (subcat) => `社内で${subcat}に関する知識が不足しており、基礎から実践までを一貫して教えていただける方を募集しています。`,
  (subcat) => `${subcat}をテーマにした研修を検討しています。対象者のレベルに合わせて内容を調整いただける講師の方を希望します。`,
  (subcat) => `過去に外部研修を受けたことがなく、${subcat}分野の講師をお探しするのは今回が初めてです。丁寧にご対応いただける方だと嬉しいです。`,
];

const PREFECTURES_OFFLINE = ["東京都", "大阪府", "愛知県", "福岡県", "宮城県", "北海道", "神奈川県", "京都府"];
const SCHEDULE_HINTS = ["来月中に実施希望", "調整可能です", "8月中旬までに", "9月第1週を希望", "土日祝でも対応可能な方希望", "特に指定なし"];
const FORMATS = ["online", "offline", "both"];

function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function randInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function main() {
  console.log("=== 専門分野リストを取得 ===");
  const { data: subcats, error: subcatErr } = await supabase
    .from("training_subcategories")
    .select("id, name");
  if (subcatErr) { console.error("training_subcategories取得失敗:", subcatErr.message); process.exit(1); }
  if (!subcats || subcats.length === 0) {
    console.error("training_subcategoriesが空です。先にカテゴリマスタを投入してください。");
    process.exit(1);
  }
  console.log(`  ${subcats.length}件の分野を取得`);

  console.log("\n=== demo企業・個人アカウントを取得 ===");
  const { data: companyUsers, error: companyErr } = await supabase
    .from("users")
    .select("id, name")
    .ilike("email", `demo-company-%@${EMAIL_DOMAIN}`);
  if (companyErr) { console.error("company取得失敗:", companyErr.message); process.exit(1); }

  const { data: individualUsers, error: individualErr } = await supabase
    .from("users")
    .select("id, name")
    .ilike("email", `demo-individual-%@${EMAIL_DOMAIN}`);
  if (individualErr) { console.error("individual取得失敗:", individualErr.message); process.exit(1); }

  if (!companyUsers?.length || !individualUsers?.length) {
    console.error("demo-company-* / demo-individual-* アカウントが見つかりません。先に seed_demo_accounts.js を実行してください。");
    process.exit(1);
  }
  console.log(`  企業: ${companyUsers.length}件 / 個人: ${individualUsers.length}件`);

  console.log(`\n=== 公募案件 ${REQUEST_COUNT}件を作成 ===`);
  for (let i = 1; i <= REQUEST_COUNT; i++) {
    const isCompany = Math.random() < 0.6; // 企業6割・個人4割くらいの比率
    const requester = isCompany ? pick(companyUsers) : pick(individualUsers);
    const subcat = pick(subcats);
    const format = pick(FORMATS);

    const title = pick(TITLE_TEMPLATES).replace("{subcat}", subcat.name);
    const description = pick(DESCRIPTION_TEMPLATES)(subcat.name);

    const payload = {
      requester_id: requester.id,
      requester_type: isCompany ? "company" : "individual",
      title,
      description,
      expertise_field: subcat.id,
      budget: randInt(50, 400) * 1000,
      participant_count: randInt(3, 40),
      preferred_format: format,
      location: format === "online" ? null : `${pick(PREFECTURES_OFFLINE)}内`,
      preferred_schedule: pick(SCHEDULE_HINTS),
      target_instructor_id: null, // 公募（特定の講師を指名しない）
    };

    const { error } = await supabase.from("training_requests").insert(payload);
    if (error) {
      console.error(`  ✗ ${i}/${REQUEST_COUNT} 失敗: ${error.message}`);
    } else {
      console.log(`  ✓ ${i}/${REQUEST_COUNT}: 「${title}」`);
    }
    await sleep(100); // レート制限対策
  }

  console.log("\n=== 完了 ===");
  console.log(`「案件を探す」「講師の方へ」に反映されているか、Branch B 上で確認してください。`);
}

main().catch(err => {
  console.error("致命的エラー:", err);
  process.exit(1);
});
