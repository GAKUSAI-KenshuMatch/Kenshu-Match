/**
 * Ported from assets/data.js. This mock/demo dataset is only used as a
 * fallback on /instructor-detail when the `id` query param isn't a real
 * Supabase UUID (legacy demo links) — mirrors instructor-detail.html exactly.
 * Not used by /instructors, which is fully backed by Supabase.
 */

export interface MockInstructor {
  id: string;
  name: string;
  initial: string;
  expertiseFields: string[];
  workFormat: "online" | "offline" | "both";
  workArea: string;
  hourlyRate: number;
  yearsExperience: number;
  ratingAvg: number;
  reviewCount: number;
  introduction: string;
}

export const MOCK_INSTRUCTORS: MockInstructor[] = [
  {
    id: "ins-001",
    name: "田中 陽子",
    initial: "田",
    expertiseFields: ["IT・プログラミング", "データ分析"],
    workFormat: "both",
    workArea: "東京都",
    hourlyRate: 12000,
    yearsExperience: 8,
    ratingAvg: 4.8,
    reviewCount: 23,
    introduction: "Python・SQLを中心とした企業向け研修を8年担当。未経験者向けの丁寧な進行に定評。",
  },
  {
    id: "ins-002",
    name: "鈴木 一郎",
    initial: "鈴",
    expertiseFields: ["マネジメント", "ロジカルシンキング"],
    workFormat: "offline",
    workArea: "大阪府",
    hourlyRate: 18000,
    yearsExperience: 15,
    ratingAvg: 4.9,
    reviewCount: 41,
    introduction: "大手コンサル出身。管理職向けの論理的思考・意思決定研修を専門とする。",
  },
  {
    id: "ins-003",
    name: "Nguyen Thi Mai",
    initial: "N",
    expertiseFields: ["語学（日本語）", "異文化コミュニケーション"],
    workFormat: "online",
    workArea: "オンライン対応",
    hourlyRate: 6000,
    yearsExperience: 4,
    ratingAvg: 4.6,
    reviewCount: 12,
    introduction: "外国人材向け日本語研修と、異文化理解ワークショップを提供。",
  },
  {
    id: "ins-004",
    name: "佐藤 健太",
    initial: "佐",
    expertiseFields: ["インフラ・クラウド", "IT・プログラミング"],
    workFormat: "both",
    workArea: "東京都",
    hourlyRate: 15000,
    yearsExperience: 10,
    ratingAvg: 4.7,
    reviewCount: 19,
    introduction: "AWS認定資格を複数保有。クラウド基盤構築の実践研修を得意とする。",
  },
  {
    id: "ins-005",
    name: "山本 美咲",
    initial: "山",
    expertiseFields: ["プレゼンテーション", "コミュニケーション"],
    workFormat: "online",
    workArea: "オンライン対応",
    hourlyRate: 9000,
    yearsExperience: 6,
    ratingAvg: 4.5,
    reviewCount: 15,
    introduction: "アナウンサー出身。話し方・伝え方に特化した研修を全国オンラインで提供。",
  },
  {
    id: "ins-006",
    name: "高橋 誠",
    initial: "高",
    expertiseFields: ["セキュリティ", "IT・プログラミング"],
    workFormat: "offline",
    workArea: "愛知県",
    hourlyRate: 20000,
    yearsExperience: 12,
    ratingAvg: 5.0,
    reviewCount: 8,
    introduction: "情報処理安全確保支援士。中部圏の製造業向けセキュリティ研修に強み。",
  },
];

export interface MockReview {
  reviewerType: string;
  reviewerName: string;
  rating: number;
  comment: string;
  date: string;
}

export const MOCK_REVIEWS: Record<string, MockReview[]> = {
  "ins-001": [
    { reviewerType: "business", reviewerName: "株式会社フォレスト", rating: 5, comment: "未経験のメンバーにも分かりやすく、演習中心で理解が深まりました。資料も丁寧でした。", date: "2026-05-12" },
    { reviewerType: "individual", reviewerName: "K.S 様", rating: 4.5, comment: "質問にその場で丁寧に答えていただき、独学で詰まっていた部分が解消しました。", date: "2026-04-02" },
  ],
  "ins-002": [
    { reviewerType: "business", reviewerName: "山田工業株式会社", rating: 5, comment: "管理職研修として実施。ケーススタディが自社の課題に近く、実践的でした。", date: "2026-06-01" },
  ],
  "ins-003": [
    { reviewerType: "business", reviewerName: "グローバル商事株式会社", rating: 4.5, comment: "外国人スタッフ向けの日本語研修を依頼。文化的な背景まで考慮した内容で好評でした。", date: "2026-03-20" },
    { reviewerType: "individual", reviewerName: "T.N 様", rating: 4.5, comment: "オンラインでも集中して受講でき、実務で使えるフレーズを多く学べました。", date: "2026-02-14" },
  ],
  "ins-004": [
    { reviewerType: "business", reviewerName: "テックブリッジ株式会社", rating: 5, comment: "AWSの実践研修、ハンズオン中心で非常に濃い内容でした。", date: "2026-05-28" },
  ],
  "ins-005": [
    { reviewerType: "individual", reviewerName: "R.M 様", rating: 4.5, comment: "話し方の癖を具体的に指摘してもらえて、プレゼンへの苦手意識が減りました。", date: "2026-04-18" },
  ],
  "ins-006": [
    { reviewerType: "business", reviewerName: "中部精密工業株式会社", rating: 5, comment: "製造業特有のセキュリティリスクまで踏み込んだ内容で、非常に実践的でした。", date: "2026-06-10" },
  ],
};

export interface MockInstructorDetail {
  bio: string;
  certifications: string[];
  availableSchedule: string;
}

export const INSTRUCTOR_DETAILS: Record<string, MockInstructorDetail> = {
  "ins-001": {
    bio: "SIerでのシステム開発を経て、企業研修講師として独立。Python・SQLを用いたデータ活用研修を中心に、未経験者向けの丁寧な進行と演習設計に定評があります。これまで累計40社以上の研修を担当。",
    certifications: ["基本情報技術者試験", "Python3 エンジニア認定基礎試験"],
    availableSchedule: "平日 10:00〜18:00（応相談）",
  },
  "ins-002": {
    bio: "大手コンサルティングファームでマネージャーを務めた後、独立。管理職向けの論理的思考・意思決定研修を専門とし、実際の経営課題を用いたケーススタディを得意とします。",
    certifications: ["中小企業診断士"],
    availableSchedule: "月〜金 9:00〜17:00（対面のみ）",
  },
  "ins-003": {
    bio: "日本語教育機関での指導経験を経て、企業向けの外国人材研修・異文化コミュニケーション研修を提供。ベトナム語・英語対応も可能。",
    certifications: ["日本語教育能力検定試験"],
    availableSchedule: "平日夜間・土日 対応可（オンラインのみ）",
  },
  "ins-004": {
    bio: "インフラエンジニアとして10年以上の実務経験を持ち、AWS認定資格を複数保有。クラウド基盤構築のハンズオン研修を得意とし、実務に直結する内容を重視。",
    certifications: ["AWS認定ソリューションアーキテクト - プロフェッショナル"],
    availableSchedule: "平日 13:00〜20:00 / 土曜応相談",
  },
  "ins-005": {
    bio: "アナウンサーとして10年勤務後、企業研修講師に転身。プレゼンテーション・話し方に特化し、オンラインでも実践的なフィードバックを行う研修を全国に提供。",
    certifications: ["なし（実務経験による専門性）"],
    availableSchedule: "平日 10:00〜19:00（オンラインのみ）",
  },
  "ins-006": {
    bio: "製造業の情報システム部門を経て独立。情報処理安全確保支援士として、中部圏の製造業を中心にセキュリティ研修・監査支援を行う。",
    certifications: ["情報処理安全確保支援士", "CISSP"],
    availableSchedule: "平日 9:00〜17:00（対面のみ・中部圏優先）",
  },
};
