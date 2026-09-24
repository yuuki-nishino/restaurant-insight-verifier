export const ASPECTS = ["味", "接客", "待ち時間", "清潔さ", "コスパ", "見た目", "ニオイ"] as const;

export type Aspect = (typeof ASPECTS)[number];

export type SentimentLabel = "positive" | "negative" | "neutral" | "mixed";

const SENTIMENT_THRESHOLD = 0.5;

export function deriveSentimentLabel(positiveScore: number, negativeScore: number): SentimentLabel {
  const isPositive = positiveScore > SENTIMENT_THRESHOLD;
  const isNegative = negativeScore > SENTIMENT_THRESHOLD;
  if (isPositive && isNegative) return "mixed";
  if (isPositive) return "positive";
  if (isNegative) return "negative";
  return "neutral";
}

export type ReviewClassification = {
  reviewText: string;
  aspectScores: Record<Aspect, number>;
  // 「好意的か」「批判的か」は独立したNoulで判定し、両方高ければ賛否混在（mixed）とする（ADR-0005）
  sentiment: { label: SentimentLabel; positiveScore: number; negativeScore: number };
  // Noul。同じ口コミで両方高いこともある（例: 味は良いが接客が悪い）
  replyGuidance: { thanks: number; apology: number };
  improvementGuidance: { operations: number; menuRecipe: number };
};

export type ClaimVerification = {
  claimText: string;
  isSupportedProbability: number;
};
