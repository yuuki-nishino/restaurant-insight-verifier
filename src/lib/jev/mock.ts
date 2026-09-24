import { ASPECTS, type ClaimVerification, type ReviewClassification } from "@/lib/jev/types";

const ASPECT_KEYWORDS: Record<(typeof ASPECTS)[number], string[]> = {
  味: ["味", "スープ", "麺", "美味", "うまい", "まずい", "不味"],
  接客: ["接客", "店員", "スタッフ", "対応", "態度"],
  待ち時間: ["待ち時間", "待った", "行列", "並んだ", "提供", "遅い"],
  清潔さ: ["清潔", "汚い", "掃除", "匂い", "きれい"],
  コスパ: ["値段", "価格", "コスパ", "高い", "安い", "円"],
};

const POSITIVE_KEYWORDS = ["美味", "うまい", "満足", "良かった", "また来", "おすすめ"];
const NEGATIVE_KEYWORDS = ["不味", "まずい", "残念", "遅い", "素っ気", "汚い", "高い"];
const OPERATIONS_KEYWORDS = ["接客", "店員", "スタッフ", "対応", "態度", "待ち時間", "待った", "行列", "清潔", "汚い", "掃除"];
const RECIPE_KEYWORDS = ["味", "スープ", "麺", "薄い", "濃い", "しょっぱい", "量"];

function keywordHit(text: string, keywords: string[]): boolean {
  return keywords.some((keyword) => text.includes(keyword));
}

export function mockClassifyReview(reviewText: string): ReviewClassification {
  const aspectScores = Object.fromEntries(
    ASPECTS.map((aspect) => [aspect, keywordHit(reviewText, ASPECT_KEYWORDS[aspect]) ? 0.85 : 0.05]),
  ) as ReviewClassification["aspectScores"];

  const positiveHit = keywordHit(reviewText, POSITIVE_KEYWORDS);
  const negativeHit = keywordHit(reviewText, NEGATIVE_KEYWORDS);
  const sentimentChoice = positiveHit && !negativeHit ? "positive" : negativeHit && !positiveHit ? "negative" : "neutral";
  const sentimentProbabilities =
    sentimentChoice === "positive"
      ? { positive: 0.6, negative: 0.1, neutral: 0.3 }
      : sentimentChoice === "negative"
        ? { positive: 0.1, negative: 0.6, neutral: 0.3 }
        : { positive: 0.2, negative: 0.2, neutral: 0.6 };

  return {
    reviewText,
    aspectScores,
    sentiment: { choice: sentimentChoice, confidence: 0.6, probabilities: sentimentProbabilities },
    replyGuidance: {
      thanks: positiveHit ? 0.85 : 0.1,
      apology: negativeHit ? 0.85 : 0.1,
    },
    improvementGuidance: {
      operations: negativeHit && keywordHit(reviewText, OPERATIONS_KEYWORDS) ? 0.8 : 0.1,
      menuRecipe: negativeHit && keywordHit(reviewText, RECIPE_KEYWORDS) ? 0.8 : 0.1,
    },
  };
}

export function mockVerifyClaim(claimText: string): ClaimVerification {
  // ルールベースの簡易チェック: 集計データの数値表現（%や件）を主張が含んでいれば支持されているとみなす
  const mentionsEvidence = /\d+(\.\d+)?\s*(%|件|割)/.test(claimText);
  return {
    claimText,
    isSupportedProbability: mentionsEvidence ? 0.85 : 0.4,
  };
}
