import type { MenuItem } from "@/lib/menu";

export const ASPECTS = ["味", "接客", "待ち時間", "清潔さ", "コスパ"] as const;

export type Aspect = (typeof ASPECTS)[number];

export type ReviewClassification = {
  reviewText: string;
  aspectScores: Record<Aspect, number>;
  sentiment: { choice: "positive" | "negative" | "neutral"; confidence: number };
  menuMentioned: { choice: MenuItem | "none"; confidence: number };
};

export type ClaimVerification = {
  claimText: string;
  isSupportedProbability: number;
};
