import Link from "next/link";

export default function PrivacyPage() {
  return (
    <main className="detail-page" style={{ maxWidth: 760 }}>
      <h1 className="hero-band__title" style={{ fontSize: 26, marginBottom: 8 }}>
        プライバシーポリシー
      </h1>
      <p style={{ color: "var(--color-ink-soft)", fontSize: 13, marginBottom: 32 }}>最終更新日：2026年7月28日</p>

      <div className="detail-block">
        <p className="detail-block__text">
          株式会社GAKUSAI（以下「当社」といいます）は、当社が提供するマッチングプラットフォーム「ケンシュウリンク」（以下「本サービス」といいます）における、ユーザーの個人情報の取り扱いについて、以下のとおりプライバシーポリシー（以下「本ポリシー」といいます）を定めます。
        </p>
      </div>

      <div className="detail-block">
        <h2 className="detail-block__title">基本方針</h2>
        <p className="detail-block__text">株式会社GAKUSAIでは個人情報の重要性を認識し、以下の方針に基づき個人情報保護に努めます。</p>
        <p className="detail-block__text" style={{ marginTop: 10, fontWeight: 700 }}>
          ■利用目的
        </p>
        <ol style={{ paddingLeft: 20, marginTop: 8 }}>
          <li className="detail-block__text" style={{ marginBottom: 8 }}>
            特定の個人を識別することができる情報（以下「個人情報」といいます）の取扱いについて規定を設け、組織体制を整備し、個人情報の保護に努めています。
          </li>
          <li className="detail-block__text" style={{ marginBottom: 8 }}>
            ご本人から直接個人情報を収集させていただく場合は、収集目的及び弊社担当窓口をお知らせし、目的に必要な範囲でのみ、個人情報を収集させていただきます。
          </li>
          <li className="detail-block__text" style={{ marginBottom: 8 }}>
            個人情報は収集目的の範囲内でのみ利用いたします。また適切に管理し特段の事情がない限り、ご本人の承諾なく第三者に開示・提供することはありません。
          </li>
          <li className="detail-block__text" style={{ marginBottom: 8 }}>
            個人情報を常に正確かつ最新の状態に保ち、不正アクセス、紛失、破壊、改ざん、漏えい等を防止するため、適切な措置を講じております。
          </li>
          <li className="detail-block__text" style={{ marginBottom: 8 }}>
            弊社が、個人情報の処理を外部へ委託する場合には、委託契約を結ぶことにより漏えいや再提供を行わないよう義務づけ、適切な管理を実施させていただきます。
          </li>
          <li className="detail-block__text" style={{ marginBottom: 8 }}>
            委託元よりお預かりする個人情報は、委託契約を結んだ上で、厳正に管理を行い契約の範囲内でのみ利用いたします。
          </li>
          <li className="detail-block__text">
            弊社が保有する個人情報に関して適用される法令、規範を遵守するとともに、上記各項における取り組み及び保護活動を、維持、改善してまいります。
          </li>
        </ol>
        <p className="detail-block__text" style={{ marginTop: 10 }}>
          当サイトからアクセスできる第三者サイトにつきましては、本方針の適用外とし、そのサイトに起因する損害については、弊社は一切の責任を負いません。
        </p>
      </div>

      <div className="detail-block">
        <h2 className="detail-block__title">第1条（個人情報）</h2>
        <p className="detail-block__text">
          「個人情報」とは、個人情報保護法にいう「個人情報」を指すものとし、氏名、生年月日、住所、電話番号、連絡先その他の記述等により特定の個人を識別できる情報、および容貌、指紋、声紋にかかるデータ、健康保険証の保険者番号などの当該情報単体から特定の個人を識別できる情報（個人識別情報）を指します。
        </p>
      </div>

      <div className="detail-block">
        <h2 className="detail-block__title">第2条（取得する情報）</h2>
        <p className="detail-block__text">
          当社は、ユーザーが本サービスの利用登録をする際に、氏名、メールアドレス、電話番号、会社名、研修依頼の内容、講師のプロフィール情報（対応分野・実績・希望単価等）をお尋ねすることがあります。また、Googleアカウントでのログインをご利用いただく場合、Googleより氏名・メールアドレス・プロフィール画像を取得します。本サービスの利用状況に関する情報を、Cookie等の技術を用いて取得する場合があります。
        </p>
      </div>

      <div className="detail-block">
        <h2 className="detail-block__title">第3条（利用目的）</h2>
        <p className="detail-block__text">
          当社は、取得した個人情報を、本サービスの提供・運営、ユーザー本人確認、講師と企業・個人とのマッチングの実施、お問い合わせへの対応、利用規約に違反したユーザーへの対応、本サービスの改善・新機能の開発のために利用します。
        </p>
      </div>

      <div className="detail-block">
        <h2 className="detail-block__title">第4条（第三者提供）</h2>
        <p className="detail-block__text">
          当社は、法令に基づく場合を除き、あらかじめユーザーの同意を得ることなく、第三者に個人情報を提供することはありません。ただし、業務委託先に対して、利用目的の達成に必要な範囲内で個人情報を提供する場合があります。
        </p>
        <p className="detail-block__text" style={{ marginTop: 10 }}>
          <strong>
            なお、本サービスの性質上、依頼が確定（マッチング成立）した場合には、当該依頼に関わる講師と依頼者（企業・個人）双方の連絡先情報（氏名・メールアドレス・電話番号等）が、相手方に開示されます。
          </strong>
          この開示は、依頼の確定操作をもってユーザーの同意があったものとして取り扱います。マッチングが成立していない依頼については、連絡先情報は相手方に開示されません。
        </p>
      </div>

      <div className="detail-block">
        <h2 className="detail-block__title">第5条（委託先・外部サービス）</h2>
        <p className="detail-block__text">
          本サービスは、データベース・認証基盤としてSupabase Inc.のサービスを利用しています。〔その他利用する外部サービス（決済代行、メール配信等）があれば追記してください〕
        </p>
      </div>

      <div className="detail-block">
        <h2 className="detail-block__title">第6条（個人情報の管理）</h2>
        <p className="detail-block__text">当社は、個人情報の漏えい、滅失または毀損の防止その他の個人情報の安全管理のために必要かつ適切な措置を講じます。</p>
      </div>

      <div className="detail-block">
        <h2 className="detail-block__title">第7条（開示・訂正・削除等の請求）</h2>
        <p className="detail-block__text">
          ユーザーは、当社の定める手続きに従い、当社に対して自己の個人情報の開示、訂正、追加、削除、利用停止を請求することができます。請求方法は本ポリシー末尾のお問い合わせ窓口までご連絡ください。
        </p>
      </div>

      <div className="detail-block">
        <h2 className="detail-block__title">第8条（本ポリシーの変更）</h2>
        <p className="detail-block__text">
          当社は、必要と判断した場合には、ユーザーに通知することなく本ポリシーを変更することがあります。変更後のプライバシーポリシーは、本サービス上に掲載した時点から効力を生じるものとします。
        </p>
      </div>

      <div className="detail-block">
        <h2 className="detail-block__title">第9条（お問い合わせ窓口）</h2>
        <p className="detail-block__text">
          本ポリシーに関するお問い合わせは、
          <Link href="/contact" style={{ color: "var(--color-primary)", fontWeight: 700 }}>
            お問い合わせフォーム
          </Link>
          よりご連絡ください。
        </p>
      </div>
    </main>
  );
}
