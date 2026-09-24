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

Jevの実プリミティブ（Choice/Noul）へのマッピングは [ADR-0003](./decisions/0003-jev-primitive-mapping.md)、対応ガイド分類（メニュー分類の廃止）は [ADR-0004](./decisions/0004-action-guidance-replaces-menu.md) を参照。

```ts
type Aspect = "味" | "接客" | "待ち時間" | "清潔さ" | "コスパ";

type ReviewClassification = {
  reviewText: string;
  // 各アスペクトはNoul（0〜1の確率）。しきい値0.5超で「言及あり」と判定する
  aspectScores: Record<Aspect, number>;
  sentiment: { choice: "positive" | "negative" | "neutral"; confidence: number };
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
  sentimentCounts: { positive: number; negative: number; neutral: number };
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
