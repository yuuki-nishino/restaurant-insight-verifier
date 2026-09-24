export const ASPECTS = ["味", "接客", "待ち時間", "清潔さ", "コスパ"] as const;

export type Aspect = (typeof ASPECTS)[number];

export type SentimentChoice = "positive" | "negative" | "neutral";

export type ReviewClassification = {
  reviewText: string;
  aspectScores: Record<Aspect, number>;
  sentiment: {
    choice: SentimentChoice;
    confidence: number;
    probabilities: Record<SentimentChoice, number>;
  };
  // Noul（0〜1の確率）。同じ口コミで両方高いこともある（ADR-0004）
  replyGuidance: { thanks: number; apology: number };
  improvementGuidance: { operations: number; menuRecipe: number };
};

export type ClaimVerification = {
  claimText: string;
  isSupportedProbability: number;
};
