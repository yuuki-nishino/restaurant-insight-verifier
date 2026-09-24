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

```ts
type ReviewClassification = {
  reviewText: string;
  aspect: { label: "味" | "接客" | "待ち時間" | "清潔さ" | "コスパ" | "その他"; confidence: number }[];
  sentiment: { label: "positive" | "negative" | "neutral"; confidence: number };
  menuMentioned: string | null;
};
```

## 集計結果（全件のReviewClassificationから計算）

```ts
type AggregatedStats = {
  totalReviews: number;
  byAspect: Record<string, { count: number; positive: number; negative: number; neutral: number }>;
  byMenu: Record<string, number>;
  sentimentBreakdown: { positive: number; negative: number; neutral: number };
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

```ts
type ClaimVerification = {
  claimText: string;
  isSupported: boolean;
  confidence: number;
  note?: string;
};
```

## 関連ドキュメント

- 全体設計: [architecture.md](./architecture.md)
- 各ステージのAPI仕様: [api-spec.md](./api-spec.md)
- DBを持たないことにした理由: [decisions/0002-no-database-single-run-analysis.md](./decisions/0002-no-database-single-run-analysis.md)
