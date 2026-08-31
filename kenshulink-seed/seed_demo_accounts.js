/**
 * KenshuLink Branch B — Seed demo accounts
 * Tạo 100 講師 (INSTRUCTOR, is_public=true) + 50 企業 (COMPANY) + 50 個人 (INDIVIDUAL)
 *
 * CÁCH CHẠY:
 *   1. npm install @supabase/supabase-js
 *   2. Set 2 biến môi trường (KHÔNG hardcode key vào file này):
 *        export SUPABASE_URL="https://gsqaggzafutqeypkamae.supabase.co"
 *        export SUPABASE_SERVICE_ROLE_KEY="...service role key của bạn..."
 *   3. node seed_demo_accounts.js
 *
 * ⚠️ Dùng service role key — chỉ chạy trên máy của bạn, KHÔNG commit file
 *    .env hay key này lên GitHub, KHÔNG paste vào bất kỳ file client-side nào.
 * ⚠️ Toàn bộ 200 tài khoản dùng chung mật khẩu: KenshuDemo2026!
 *    (chỉ để test nội bộ — đừng dùng seed này cho dữ liệu thật/production).
 */

const { createClient } = require("@supabase/supabase-js");

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const DEMO_PASSWORD = "KenshuDemo2026!";
const EMAIL_DOMAIN = "kenshulink-demo.test"; // domain giả, không gửi mail thật

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error("Thiếu SUPABASE_URL hoặc SUPABASE_SERVICE_ROLE_KEY trong biến môi trường.");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// ---------- Dữ liệu ngẫu nhiên tiếng Nhật ----------
const SEI = ["佐藤","鈴木","高橋","田中","伊藤","渡辺","山本","中村","小林","加藤",
  "吉田","山田","佐々木","山口","松本","井上","木村","林","斎藤","清水"];
const MEI = ["陽子","健太","美咲","一郎","真理","翔太","千尋","大輔","誠","結衣",
  "涼太","彩","豊","蓮","さくら","悠斗","花子","颯太","愛","拓也"];
const PREFECTURES = ["北海道","宮城県","東京都","神奈川県","愛知県","大阪府","京都府",
  "福岡県","広島県","オンライン対応（全国）"];
const WORK_STYLES = ["ONLINE","ONSITE","HYBRID"];
const CERTIFICATIONS = ["基本情報技術者試験","応用情報技術者試験","PMP","中小企業診断士",
  "MBA","TOEIC900点","G検定","AWS認定資格","なし"];
const COMPANY_PREFIX = ["株式会社","合同会社"];
const COMPANY_WORDS = ["サンプル","フューチャー","イノベーション","グローバル","テクノ",
  "ネクスト","クリエイト","パートナーズ","ソリューションズ","ビジョン"];
const DEPARTMENTS = ["人事部","研修企画課","総務部","経営企画室","人材開発部"];
const POSITIONS = ["課長","主任","マネージャー","担当","部長"];

function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function randInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function randomName() { return `${pick(SEI)} ${pick(MEI)}`; }
function randomCompanyName() { return `${pick(COMPANY_PREFIX)}${pick(COMPANY_WORDS)}`; }
function randomPhone() { return `0${randInt(70, 90)}-${randInt(1000, 9999)}-${randInt(1000, 9999)}`; }
function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function createAuthUser(email, name, role) {
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password: DEMO_PASSWORD,
    email_confirm: true, // bỏ qua bước xác nhận email cho tài khoản demo
    user_metadata: { role, name },
  });
  if (error) {
    console.error(`  ✗ auth作成失敗 ${email}:`, error.message);
    return null;
  }
  return data.user.id;
}

async function seedInstructor(i, subcategoryIds) {
  const email = `demo-instructor-${i}@${EMAIL_DOMAIN}`;
  const name = randomName();
  const userId = await createAuthUser(email, name, "INSTRUCTOR");
  if (!userId) return;

  const { error: profileErr } = await supabase.from("instructor_profiles").upsert({
    id: userId,
    prefecture: pick(PREFECTURES),
    years_of_experience: randInt(1, 20),
    self_pr: `${name}です。研修講師として${randInt(1, 15)}年の実績があります。実践的な内容を心がけています。`,
    work_style: pick(WORK_STYLES),
    desired_rate_min: randInt(5, 15) * 1000,
    desired_rate_max: randInt(16, 30) * 1000,
    certifications: pick(CERTIFICATIONS),
    contact_email: email,
    contact_phone: randomPhone(),
    is_public: true,
  });
  if (profileErr) { console.error(`  ✗ profile失敗 ${email}:`, profileErr.message); return; }

  // 1〜3個ランダムに専門分野を割り当て
  if (subcategoryIds.length) {
    const count = randInt(1, 3);
    const picked = new Set();
    while (picked.size < count) picked.add(pick(subcategoryIds));
    const rows = [...picked].map(subcategory_id => ({ instructor_id: userId, subcategory_id }));
    await supabase.from("instructor_expertise").insert(rows);
  }

  console.log(`  ✓ INSTRUCTOR ${i}/100: ${email}`);
}

async function seedRequester(i, role) {
  const isCompany = role === "COMPANY";
  const email = `demo-${isCompany ? "company" : "individual"}-${i}@${EMAIL_DOMAIN}`;
  const name = isCompany ? randomCompanyName() : randomName();
  const userId = await createAuthUser(email, name, role);
  if (!userId) return;

  const payload = {
    id: userId,
    phone: randomPhone(),
    address: isCompany ? `${pick(PREFECTURES)}内オフィス` : null,
  };
  if (isCompany) {
    payload.company_name = name;
    payload.department = pick(DEPARTMENTS);
    payload.position = pick(POSITIONS);
  }

  const { error: profileErr } = await supabase.from("requester_profiles").upsert(payload);
  if (profileErr) { console.error(`  ✗ profile失敗 ${email}:`, profileErr.message); return; }

  console.log(`  ✓ ${role} ${i}/50: ${email}`);
}

async function main() {
  console.log("=== 専門分野リストを取得 ===");
  const { data: subcats, error: subcatErr } = await supabase.from("training_subcategories").select("id");
  if (subcatErr) { console.error("training_subcategories取得失敗:", subcatErr.message); }
  const subcategoryIds = (subcats || []).map(s => s.id);
  console.log(`  ${subcategoryIds.length}件の分野を取得`);

  console.log("\n=== 講師 100件を作成 ===");
  for (let i = 1; i <= 100; i++) {
    await seedInstructor(i, subcategoryIds);
    await sleep(150); // Auth Admin APIのレート制限対策
  }

  console.log("\n=== 企業 50件を作成 ===");
  for (let i = 1; i <= 50; i++) {
    await seedRequester(i, "COMPANY");
    await sleep(150);
  }

  console.log("\n=== 個人 50件を作成 ===");
  for (let i = 1; i <= 50; i++) {
    await seedRequester(i, "INDIVIDUAL");
    await sleep(150);
  }

  console.log("\n=== 完了 ===");
  console.log(`全アカウントのパスワード: ${DEMO_PASSWORD}`);
  console.log(`メール例: demo-instructor-1@${EMAIL_DOMAIN} / demo-company-1@${EMAIL_DOMAIN} / demo-individual-1@${EMAIL_DOMAIN}`);
}

main().catch(err => {
  console.error("致命的エラー:", err);
  process.exit(1);
});
