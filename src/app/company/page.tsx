import "./company.css";

const ROWS: [string, string][] = [
  ["会社名", "株式会社GAKUSAI"],
  ["設立", "2023年3月16日"],
  ["代表者", "代表取締役　前田 美香"],
  ["資本金", "6,300万円"],
  ["事業内容", "研修事業・産学連携事業・事業支援事業・人材支援事業・有料職業紹介事業（13-ユ-315843）・労働者派遣事業（派13-316932）"],
  ["所在地", "東京都中央区新川1−6−11　ニューリバータワーB1"],
  ["連絡先", "03-5244-9450"],
];

export default function CompanyPage() {
  return (
    <main className="detail-page" style={{ maxWidth: 760 }}>
      <p className="section__eyebrow">COMPANY</p>
      <h1 className="hero-band__title" style={{ fontSize: 26, marginBottom: 24 }}>
        会社概要
      </h1>

      <dl className="company-table">
        {ROWS.map(([label, value]) => (
          <div className="company-row" key={label}>
            <dt>{label}</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>

      <p style={{ fontSize: 11.5, color: "var(--color-ink-soft)", marginTop: 16 }}>
        研修講師マッチングプラットフォーム「ケンシュウリンク」は、株式会社GAKUSAIが企画・開発・運営しています。
      </p>
    </main>
  );
}
