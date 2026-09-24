import { choice, noul, type JsonValue } from "@typesafe-ai/sdk";
import { getJevClient } from "@/lib/jev/client";
import type { ClaimVerification, ReviewClassification } from "@/lib/jev/types";

export async function liveClassifyReview(reviewText: string): Promise<ReviewClassification> {
  const client = getJevClient();

  const response = await client.systemOne({
    state: { review_text: reviewText },
    questions: {
      aspect_taste: noul("この口コミは「味」について言及しているか"),
      aspect_service: noul("この口コミは「接客」について言及しているか"),
      aspect_wait_time: noul("この口コミは「待ち時間」について言及しているか"),
      aspect_cleanliness: noul("この口コミは「清潔さ」について言及しているか"),
      aspect_cost_performance: noul("この口コミは「コスパ」について言及しているか"),
      sentiment: choice("この口コミ全体の感情はどれに近いか", {
        positive: "総合的に好意的・満足",
        negative: "総合的に不満・批判的",
        neutral: "感情的な評価が読み取れない、または中立",
      }),
      reply_thanks: noul("この口コミの内容に対して、店側は感謝を伝える返信をすべきか"),
      reply_apology: noul("この口コミの内容に対して、店側は謝罪を伝える返信をすべきか"),
      improvement_operations: noul(
        "この口コミから、接客・待ち時間・清潔さなど店舗オペレーションの改善点が読み取れるか",
      ),
      improvement_menu_recipe: noul("この口コミから、メニューやレシピ（味・内容）の改善点が読み取れるか"),
    },
  });

  return {
    reviewText,
    aspectScores: {
      味: response.answers.aspect_taste.noul,
      接客: response.answers.aspect_service.noul,
      待ち時間: response.answers.aspect_wait_time.noul,
      清潔さ: response.answers.aspect_cleanliness.noul,
      コスパ: response.answers.aspect_cost_performance.noul,
    },
    sentiment: {
      choice: response.answers.sentiment.choice,
      confidence: response.answers.sentiment.confidence,
    },
    replyGuidance: {
      thanks: response.answers.reply_thanks.noul,
      apology: response.answers.reply_apology.noul,
    },
    improvementGuidance: {
      operations: response.answers.improvement_operations.noul,
      menuRecipe: response.answers.improvement_menu_recipe.noul,
    },
  };
}

export async function liveVerifyClaim(claimText: string, aggregatedStats: JsonValue): Promise<ClaimVerification> {
  const client = getJevClient();

  const response = await client.systemOne({
    state: { claim_text: claimText, aggregated_stats: aggregatedStats },
    questions: {
      is_supported: noul("`claim_text`の主張は`aggregated_stats`の数値と整合するか"),
    },
  });

  return {
    claimText,
    isSupportedProbability: response.answers.is_supported.noul,
  };
}
