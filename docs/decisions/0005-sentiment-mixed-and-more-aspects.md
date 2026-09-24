# ADR-0005: 感情を独立した2つのNoul（好意的/批判的）に分解し「賛否混在」を区別する

日付: 2026-09-25
ステータス: 承認（感情部分は[ADR-0003](./0003-jev-primitive-mapping.md)を置き換え）

## コンテキスト

これまで`sentiment`はChoice（`positive` / `negative` / `neutral`の3択）だった。しかし「味は良いが接客が悪い」のような賛否混在の口コミが、良い/悪いどちらの要素も強い場合に`neutral`（感情が読み取れない・中立）へ分類されてしまい、「中立（無感情）」と「賛否混在（両方とも強い感情がある）」という本来別の状態が区別できなかった。

3択のChoiceは互いに排他的な選択肢を前提とするが、「好意的か」と「批判的か」は本来独立した別々の判定であり、両方が真になりうる（[primitives](https://docs.typesafe.ai/primitives)のガイダンス通り、独立した条件は複数のNoulに分けて判定しコードで合成すべき）。

併せて、店主が知りたい観点として「見た目」「ニオイ」もアスペクトに追加する（既存のNoul多ラベル方式にそのまま乗せられる）。

## 決定

1. `sentiment`のChoiceを廃止し、独立した2つのNoulに置き換える。
   - `sentiment_positive`: この口コミは好意的・肯定的な内容を含んでいるか
   - `sentiment_negative`: この口コミは批判的・否定的な内容を含んでいるか
2. コード側で2つのNoul値（しきい値0.5）から4値のラベルを導出する。
   - 両方0.5超 → `mixed`（賛否混在）
   - 好意的のみ0.5超 → `positive`
   - 批判的のみ0.5超 → `negative`
   - どちらも0.5以下 → `neutral`
3. アスペクトに`見た目`・`ニオイ`を追加し、計7項目（味/接客/待ち時間/清潔さ/コスパ/見た目/ニオイ）とする。既存のNoul多ラベル方式（[ADR-0003](./0003-jev-primitive-mapping.md)）をそのまま適用する。

## 理由

- 「好意的か」「批判的か」は独立した2軸であり、1つのChoiceに押し込めると賛否混在のニュアンスが失われる。TypeSafeの公式ガイダンスでも、独立した条件は別々のNoulに分けてコードで合成することが推奨されている。
- 店主にとって「賛否混在」と「無感情の中立」は対応が異なりうる（前者は返信で両方に触れるべき、後者は特に反応不要）ため、区別して表示する価値がある。
- 見た目・ニオイは、味・接客などと並ぶ独立したアスペクトとして自然に追加できる（設計変更を伴わない）。

## 影響

- `src/lib/jev/types.ts`: `ASPECTS`に`見た目`・`ニオイ`を追加。`ReviewClassification.sentiment`を`{ label, positiveScore, negativeScore }`に変更（`choice`/`confidence`/`probabilities`を廃止）。
- `src/lib/jev/live.ts` / `mock.ts`: 上記の質問・導出ロジックに合わせて更新。
- `src/lib/aggregate.ts`: `sentimentCounts`に`mixed`を追加。
- `docs/api-spec.md` / `docs/data-model.md` / `docs/architecture.md`: 感情分類・アスペクト一覧の記述を更新。
- ダッシュボードの「感情の内訳」に`mixed`（賛否混在）の区分を追加する。
