import { ASPECTS, type Aspect, type ReviewClassification } from "@/lib/jev";

const THRESHOLD = 0.5;

export type AggregatedStats = {
  totalReviews: number;
  aspectCounts: Record<Aspect, number>;
  sentimentCounts: { positive: number; negative: number; neutral: number; mixed: number };
  replyGuidanceCounts: { thanks: number; apology: number };
  improvementGuidanceCounts: { operations: number; menuRecipe: number };
};

export function aggregateReviewClassifications(results: ReviewClassification[]): AggregatedStats {
  const aspectCounts = Object.fromEntries(ASPECTS.map((aspect) => [aspect, 0])) as Record<Aspect, number>;
  const sentimentCounts = { positive: 0, negative: 0, neutral: 0, mixed: 0 };
  const replyGuidanceCounts = { thanks: 0, apology: 0 };
  const improvementGuidanceCounts = { operations: 0, menuRecipe: 0 };

  for (const result of results) {
    for (const aspect of ASPECTS) {
      if (result.aspectScores[aspect] > THRESHOLD) aspectCounts[aspect] += 1;
    }
    sentimentCounts[result.sentiment.label] += 1;
    if (result.replyGuidance.thanks > THRESHOLD) replyGuidanceCounts.thanks += 1;
    if (result.replyGuidance.apology > THRESHOLD) replyGuidanceCounts.apology += 1;
    if (result.improvementGuidance.operations > THRESHOLD) improvementGuidanceCounts.operations += 1;
    if (result.improvementGuidance.menuRecipe > THRESHOLD) improvementGuidanceCounts.menuRecipe += 1;
  }

  return {
    totalReviews: results.length,
    aspectCounts,
    sentimentCounts,
    replyGuidanceCounts,
    improvementGuidanceCounts,
  };
}
