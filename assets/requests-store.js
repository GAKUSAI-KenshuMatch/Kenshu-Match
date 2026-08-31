/* ==========================================================================
   KenshuLink — 依頼データのモックストア
   ステップ④で Supabase（training_requests / instructor_responses）に
   置き換えるまでの仮実装。localStorage に保存し、ページをまたいで共有する。
   ========================================================================== */

const REQUESTS_STORAGE_KEY = "kenshulink_requests";

function getAllRequests() {
  try {
    const raw = localStorage.getItem(REQUESTS_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* fallthrough to seed */ }
  const seed = seedRequests();
  saveAllRequests(seed);
  return seed;
}

function saveAllRequests(list) {
  localStorage.setItem(REQUESTS_STORAGE_KEY, JSON.stringify(list));
}

function addRequest(data) {
  const list = getAllRequests();
  const newRequest = {
    id: "req-" + Date.now(),
    status: "pending",
    createdAt: new Date().toISOString(),
    response: null,
    review: null,
    ...data,
  };
  list.unshift(newRequest);
  saveAllRequests(list);
  return newRequest;
}

function respondToRequest(requestId, { action, quotePrice, message }) {
  const list = getAllRequests();
  const req = list.find(r => r.id === requestId);
  if (!req) return null;

  req.response = {
    action,
    quotePrice: action === "quote" ? quotePrice : null,
    message: message || "",
    respondedAt: new Date().toISOString(),
  };
  req.status = action === "accept" ? "accepted" : action === "quote" ? "quoted" : "rejected";
  saveAllRequests(list);
  return req;
}

function markCompleted(requestId) {
  const list = getAllRequests();
  const req = list.find(r => r.id === requestId);
  if (!req) return null;
  req.status = "completed";
  saveAllRequests(list);
  return req;
}

/* --- 依頼者側：見積りを承諾／見送る --- */
function acceptQuote(requestId) {
  const list = getAllRequests();
  const req = list.find(r => r.id === requestId);
  if (!req) return null;
  req.status = "accepted";
  saveAllRequests(list);
  return req;
}

function declineQuote(requestId) {
  const list = getAllRequests();
  const req = list.find(r => r.id === requestId);
  if (!req) return null;
  req.status = "rejected";
  saveAllRequests(list);
  return req;
}

function addReview(requestId, { rating, comment }) {
  const list = getAllRequests();
  const req = list.find(r => r.id === requestId);
  if (!req) return null;
  req.review = { rating, comment, createdAt: new Date().toISOString() };
  saveAllRequests(list);
  return req;
}

/* --- 初期シードデータ（mypage が空にならないようデモ用に2件用意） --- */
function seedRequests() {
  const now = Date.now();
  return [
    {
      id: "req-seed-2",
      requesterType: "individual",
      requesterName: "山田 太郎（デモ）",
      requesterContact: "yamada.taro.demo@example.com",
      targetInstructorId: "ins-001",
      targetInstructorName: "田中 陽子",
      title: "SQL基礎の個別指導",
      description: "業務でSQLを使い始めたばかりです。基礎的な集計・結合クエリが書けるようになりたいです。",
      expertiseField: "データ分析",
      budget: 10000,
      preferredFormat: "online",
      preferredSchedule: "平日夜 20:00〜",
      status: "accepted",
      createdAt: new Date(now - 1000 * 60 * 60 * 24 * 5).toISOString(),
      response: {
        action: "accept",
        quotePrice: null,
        message: "承知しました。まずは現状のレベル感を伺うため、初回30分の無料相談から始めましょう。",
        respondedAt: new Date(now - 1000 * 60 * 60 * 24 * 4).toISOString(),
      },
      review: null,
    },
    {
      id: "req-seed-1",
      requesterType: "business",
      requesterName: "株式会社サンプル（デモ）",
      requesterContact: "training@sample-demo.co.jp",
      targetInstructorId: "ins-001",
      targetInstructorName: "田中 陽子",
      title: "新人エンジニア向けPython基礎研修",
      description: "新卒エンジニア8名を対象に、Python基礎からデータ処理までの研修をお願いしたいです。",
      expertiseField: "IT・プログラミング",
      budget: 15000,
      preferredFormat: "offline",
      preferredSchedule: "8月中旬 平日午後（3日間）",
      status: "pending",
      createdAt: new Date(now - 1000 * 60 * 60 * 24 * 1).toISOString(),
      response: null,
      review: null,
    },
  ];
}
