export default function TermsPage() {
  return (
    <main className="detail-page" style={{ maxWidth: 760 }}>
      <h1 className="hero-band__title" style={{ fontSize: 26, marginBottom: 8 }}>
        利用規約
      </h1>
      <p style={{ color: "var(--color-ink-soft)", fontSize: 13, marginBottom: 32 }}>最終更新日：2026年7月28日</p>

      <div className="detail-block">
        <p className="detail-block__text">
          この利用規約（以下「本規約」といいます）は、株式会社GAKUSAI（以下「当社」といいます）が提供するマッチングプラットフォーム「ケンシュウリンク」（以下「本サービス」といいます）の利用条件を定めるものです。登録ユーザーの皆さまには、本規約に従って本サービスをご利用いただきます。
        </p>
      </div>

      <div className="detail-block">
        <h2 className="detail-block__title">第1条（適用）</h2>
        <p className="detail-block__text">本規約は、ユーザーと当社との間の本サービスの利用に関わる一切の関係に適用されるものとします。</p>
      </div>

      <div className="detail-block">
        <h2 className="detail-block__title">第2条（利用登録）</h2>
        <p className="detail-block__text">
          登録希望者が当社の定める方法によって利用登録を申請し、当社がこれを承認することによって、利用登録が完了するものとします。当社は、利用登録の申請に際して虚偽の事項を届け出た場合など、当社が利用登録を相当でないと判断した場合、利用登録の申請を承認しないことがあります。
        </p>
      </div>

      <div className="detail-block">
        <h2 className="detail-block__title">第3条（禁止事項）</h2>
        <p className="detail-block__text">
          ユーザーは、本サービスの利用にあたり、法令または公序良俗に違反する行為、犯罪行為に関連する行為、当社や第三者の知的財産権・プライバシーを侵害する行為、本サービスの運営を妨害する行為をしてはなりません。
        </p>
      </div>

      <div className="detail-block">
        <h2 className="detail-block__title">第4条（本サービスの提供の停止等）</h2>
        <p className="detail-block__text">
          当社は、システムの保守点検・更新を行う場合、地震・落雷・火災等の不可抗力により本サービスの提供が困難となった場合、その他当社が本サービスの提供が困難と判断した場合には、ユーザーに事前に通知することなく本サービスの全部または一部の提供を停止または中断することができるものとします。
        </p>
      </div>

      <div className="detail-block">
        <h2 className="detail-block__title">第5条（免責事項）</h2>
        <p className="detail-block__text">
          当社は、本サービスに事実上または法律上の瑕疵がないことを明示的にも黙示的にも保証しておりません。当社は、本サービスに起因してユーザーに生じたあらゆる損害について、当社の故意または重過失による場合を除き、一切の責任を負いません。
        </p>
      </div>

      <div className="detail-block">
        <h2 className="detail-block__title">第6条（サービス内容の変更等）</h2>
        <p className="detail-block__text">
          当社は、ユーザーに通知することなく、本サービスの内容を変更し、または本サービスの提供を中止することができるものとし、これによってユーザーに生じた損害について一切の責任を負いません。
        </p>
      </div>

      <div className="detail-block">
        <h2 className="detail-block__title">第7条（利用規約の変更）</h2>
        <p className="detail-block__text">
          当社は、必要と判断した場合には、ユーザーに通知することなくいつでも本規約を変更することができるものとします。変更後の利用規約は、本サービス上に掲載した時点から効力を生じるものとします。
        </p>
      </div>

      <div className="detail-block">
        <h2 className="detail-block__title">第8条（準拠法・裁判管轄）</h2>
        <p className="detail-block__text">
          本規約の解釈にあたっては、日本法を準拠法とします。本サービスに関して紛争が生じた場合には、当社の本店所在地を管轄する裁判所を専属的合意管轄とします。
        </p>
      </div>
    </main>
  );
}
