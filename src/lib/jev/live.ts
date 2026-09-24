import { choice, noul, type JsonValue } from "@typesafe-ai/sdk";
import { MENU_ITEMS, NO_MENU_MENTIONED, type MenuItem } from "@/lib/menu";
import { getJevClient } from "@/lib/jev/client";
import type { ClaimVerification, ReviewClassification } from "@/lib/jev/types";

type MenuCriteria = Record<MenuItem, null> & Record<typeof NO_MENU_MENTIONED, string>;

export async function liveClassifyReview(reviewText: string): Promise<ReviewClassification> {
  const client = getJevClient();

  const menuCriteria = {
    ...(Object.fromEntries(MENU_ITEMS.map((item) => [item, null])) as Record<MenuItem, null>),
    [NO_MENU_MENTIONED]: "特定のメニュー名の言及なし",
  } satisfies MenuCriteria;

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
      menu_mentioned: choice("この口コミで具体的に言及されているメニューはどれか", menuCriteria),
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
    menuMentioned: {
      choice: response.answers.menu_mentioned.choice,
      confidence: response.answers.menu_mentioned.confidence,
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
