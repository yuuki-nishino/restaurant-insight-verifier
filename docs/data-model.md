# データ構造（処理ステージ間の型）

最終更新: 2026-09-24

本アプリはDBを持たず、口コミ投入からダッシュボード・インサイト表示までを1リクエスト内のメモリ上で処理する（[ADR-0002](./decisions/0002-no-database-single-run-analysis.md)）。以下は各処理ステージがやり取りするデータの形（TypeScript型のイメージ）。

## 入力: 投入された口コミ

```ts
type ReviewInput = {
  rawText: string;
};
```

## Jev分類結果（口コミ1件ごと）

Jevの実プリミティブ（Choice/Noul）へのマッピングは [ADR-0003](./decisions/0003-jev-primitive-mapping.md)、対応ガイド分類（メニュー分類の廃止）は [ADR-0004](./decisions/0004-action-guidance-replaces-menu.md)、感情の再設計（賛否混在の区別）とアスペクト追加は [ADR-0005](./decisions/0005-sentiment-mixed-and-more-aspects.md) を参照。

```ts
type Aspect = "味" | "接客" | "待ち時間" | "清潔さ" | "コスパ" | "見た目" | "ニオイ";

type SentimentLabel = "positive" | "negative" | "neutral" | "mixed";

type ReviewClassification = {
  reviewText: string;
  // 各アスペクトはNoul（0〜1の確率）。しきい値0.5超で「言及あり」と判定する
  aspectScores: Record<Aspect, number>;
  // 「好意的か」「批判的か」は独立したNoul。両方0.5超なら mixed（賛否混在）
  sentiment: { label: SentimentLabel; positiveScore: number; negativeScore: number };
  // Noul。同じ口コミで両方高いこともある（例: 味は良いが接客が悪い）
  replyGuidance: { thanks: number; apology: number };
  improvementGuidance: { operations: number; menuRecipe: number };
};
```

## 集計結果（全件のReviewClassificationから計算）

しきい値0.5超をカウントする。実装は `src/lib/aggregate.ts` の `aggregateReviewClassifications`。

```ts
type AggregatedStats = {
  totalReviews: number;
  aspectCounts: Record<Aspect, number>;
  sentimentCounts: { positive: number; negative: number; neutral: number; mixed: number };
  replyGuidanceCounts: { thanks: number; apology: number };
  improvementGuidanceCounts: { operations: number; menuRecipe: number };
};
```

## Claude生成インサイト

```ts
type InsightClaim = {
  claimText: string; // 例: 「待ち時間への不満が全体の35%を占め、最も多い」
  evidence: string; // 根拠となった集計データの説明
};
```

## Jev検証結果（インサイトの主張ごと）

`isSupportedProbability`はNoulの生値（0〜1）。0.5から離れているほど確信度が高いとみなし、0.3〜0.7は「要確認」として表示する。

```ts
type ClaimVerification = {
  claimText: string;
  isSupportedProbability: number;
};
```

## 関連ドキュメント

- 全体設計: [architecture.md](./architecture.md)
- 各ステージのAPI仕様: [api-spec.md](./api-spec.md)
- DBを持たないことにした理由: [decisions/0002-no-database-single-run-analysis.md](./decisions/0002-no-database-single-run-analysis.md)
- Jevの実プリミティブへのマッピング: [decisions/0003-jev-primitive-mapping.md](./decisions/0003-jev-primitive-mapping.md)
- 対応ガイド分類の追加とメニュー分類の廃止: [decisions/0004-action-guidance-replaces-menu.md](./decisions/0004-action-guidance-replaces-menu.md)
- 感情の再設計（賛否混在の区別）とアスペクト追加: [decisions/0005-sentiment-mixed-and-more-aspects.md](./decisions/0005-sentiment-mixed-and-more-aspects.md)
