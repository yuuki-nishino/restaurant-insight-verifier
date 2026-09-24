"use server";

import { classifyReview, type ReviewClassification } from "@/lib/jev";

export type AnalyzeState = {
  results: ReviewClassification[];
  error?: string;
};

function splitReviews(rawText: string): string[] {
  return rawText
    .split(/\n\s*\n/)
    .map((review) => review.trim())
    .filter((review) => review.length > 0);
}

export async function analyzeReviews(_prevState: AnalyzeState, formData: FormData): Promise<AnalyzeState> {
  const rawText = String(formData.get("reviews") ?? "");
  const reviews = splitReviews(rawText);

  if (reviews.length === 0) {
    return { results: [], error: "口コミを1件以上入力してください（空行区切りで複数件入力できます）" };
  }

  const results = await Promise.all(reviews.map((reviewText) => classifyReview(reviewText)));

  return { results };
}
