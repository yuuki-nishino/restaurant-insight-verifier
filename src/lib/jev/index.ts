import type { JsonValue } from "@typesafe-ai/sdk";
import { hasJevApiKey } from "@/lib/jev/client";
import { liveClassifyReview, liveVerifyClaim } from "@/lib/jev/live";
import { mockClassifyReview, mockVerifyClaim } from "@/lib/jev/mock";
import type { ClaimVerification, ReviewClassification } from "@/lib/jev/types";

export type { Aspect, ClaimVerification, ReviewClassification, SentimentChoice } from "@/lib/jev/types";
export { ASPECTS } from "@/lib/jev/types";

export type JevMode = "live" | "mock";

export function getJevMode(): JevMode {
  return hasJevApiKey() ? "live" : "mock";
}

export async function classifyReview(reviewText: string): Promise<ReviewClassification> {
  return hasJevApiKey() ? liveClassifyReview(reviewText) : mockClassifyReview(reviewText);
}

export async function verifyClaim(claimText: string, aggregatedStats: JsonValue): Promise<ClaimVerification> {
  return hasJevApiKey() ? liveVerifyClaim(claimText, aggregatedStats) : mockVerifyClaim(claimText);
}
