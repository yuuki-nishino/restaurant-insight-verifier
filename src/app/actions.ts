"use server";

import { aggregateReviewClassifications, type AggregatedStats } from "@/lib/aggregate";
import { classifyReview, getJevMode, type JevMode, type ReviewClassification } from "@/lib/jev";

export type ProcessingTiming = {
  reviewCount: number;
  totalMs: number;
  avgPerReviewMs: number;
};

export type AnalyzeState = {
  results: ReviewClassification[];
  stats: AggregatedStats | null;
  timing: ProcessingTiming | null;
  mode: JevMode | null;
  error?: string;
};

const initialState: AnalyzeState = { results: [], stats: null, timing: null, mode: null };

// 口コミ同士は空行2つ以上（=改行3つ以上）で区切る。取得元データに紛れ込む
// 意図しない単一の空行は、口コミ本文の一部として扱われる。
function splitReviews(rawText: string): string[] {
  // ブラウザはtextareaの値をFormData経由で送信する際に改行を\r\nへ正規化するため、
  // 先に\nへ揃えてから空行2つ以上（改行3つ以上）で分割する
  return rawText
    .replace(/\r\n/g, "\n")
    .split(/\n[ \t]*\n[ \t]*\n+/)
    .map((review) => review.trim())
    .filter((review) => review.length > 0);
}

export async function analyzeReviews(_prevState: AnalyzeState, formData: FormData): Promise<AnalyzeState> {
  const rawText = String(formData.get("reviews") ?? "");
  const reviews = splitReviews(rawText);

  if (reviews.length === 0) {
    return { ...initialState, error: "口コミを1件以上入力してください（口コミ同士は空行2つで区切ってください）" };
  }

  const batchStart = Date.now();
  const timedResults = await Promise.all(
    reviews.map(async (reviewText) => {
      const callStart = Date.now();
      const classification = await classifyReview(reviewText);
      return { classification, durationMs: Date.now() - callStart };
    }),
  );
  const totalMs = Date.now() - batchStart;

  const results = timedResults.map((r) => r.classification);
  const avgPerReviewMs = timedResults.reduce((sum, r) => sum + r.durationMs, 0) / timedResults.length;

  return {
    results,
    stats: aggregateReviewClassifications(results),
    timing: { reviewCount: results.length, totalMs, avgPerReviewMs },
    mode: getJevMode(),
  };
}
