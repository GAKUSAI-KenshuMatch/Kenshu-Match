import Link from "next/link";
import Image from "next/image";

export function Footer() {
  return (
    <div className="site-footer">
      <div className="site-footer__inner">
        <div>
          <div className="brand">
            <Image className="brand__logo" src="/images/logo-07-teal.png" alt="KenshuLink" width={32} height={32} />
            <span className="brand__name" style={{ fontSize: 16 }}>
              ケンシュウリンク
            </span>
          </div>
          <p className="site-footer__copy">© 2026 KenshuLink — 研修講師 × 企業・個人マッチング</p>
        </div>
        <div className="site-footer__links">
          <Link href="/terms">利用規約</Link>
          <Link href="/privacy">プライバシーポリシー</Link>
          <Link href="/contact">お問い合わせ</Link>
          <Link href="/company">運営会社</Link>
        </div>
      </div>
    </div>
  );
}
