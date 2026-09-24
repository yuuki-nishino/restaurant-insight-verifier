import { ASPECTS, type ReviewClassification, type SentimentLabel } from "@/lib/jev";

const SENTIMENT_LABEL: Record<SentimentLabel, string> = {
  positive: "ポジティブ",
  negative: "ネガティブ",
  neutral: "ニュートラル",
  mixed: "賛否混在",
};

type Tone = "neutral" | "info" | "good" | "critical" | "warning" | "serious";

const TONE_CLASSES: Record<Tone, string> = {
  neutral: "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
  info: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300",
  good: "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300",
  critical: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300",
  warning: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
  serious: "bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300",
};

function PercentChip({ label, value, tone, highlighted }: { label: string; value: number; tone: Tone; highlighted: boolean }) {
  const pct = Math.round(value * 100);
  const className = highlighted ? TONE_CLASSES[tone] : "bg-zinc-50 text-zinc-400 dark:bg-zinc-900 dark:text-zinc-600";
  return (
    <span className={`rounded-full px-2.5 py-1 tabular-nums ${className}`}>
      {label} {pct}%
    </span>
  );
}

export function ReviewCard({ result }: { result: ReviewClassification }) {
  return (
    <div className="flex flex-col gap-3 rounded-lg border border-zinc-200 bg-white p-4 text-sm dark:border-zinc-800 dark:bg-zinc-900">
      <p className="text-black dark:text-zinc-50">{result.reviewText}</p>

      <div className="flex flex-col gap-1.5">
        <span className="text-[11px] font-medium uppercase tracking-wide text-zinc-400 dark:text-zinc-500">
          アスペクト（Jev / Noul）
        </span>
        <div className="flex flex-wrap gap-1.5 text-xs">
          {ASPECTS.map((aspect) => (
            <PercentChip
              key={aspect}
              label={aspect}
              value={result.aspectScores[aspect]}
              tone="info"
              highlighted={result.aspectScores[aspect] > 0.5}
            />
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <span className="text-[11px] font-medium uppercase tracking-wide text-zinc-400 dark:text-zinc-500">
          感情（Jev / Noul ×2 → {SENTIMENT_LABEL[result.sentiment.label]}）
        </span>
        <div className="flex flex-wrap gap-1.5 text-xs">
          <PercentChip
            label="好意的"
            value={result.sentiment.positiveScore}
            tone="good"
            highlighted={result.sentiment.positiveScore > 0.5}
          />
          <PercentChip
            label="批判的"
            value={result.sentiment.negativeScore}
            tone="critical"
            highlighted={result.sentiment.negativeScore > 0.5}
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <span className="text-[11px] font-medium uppercase tracking-wide text-zinc-400 dark:text-zinc-500">
          対応ガイド（Jev / Noul）
        </span>
        <div className="flex flex-wrap gap-1.5 text-xs">
          <PercentChip label="お礼推奨" value={result.replyGuidance.thanks} tone="good" highlighted={result.replyGuidance.thanks > 0.5} />
          <PercentChip
            label="謝罪推奨"
            value={result.replyGuidance.apology}
            tone="critical"
            highlighted={result.replyGuidance.apology > 0.5}
          />
          <PercentChip
            label="オペレーション改善"
            value={result.improvementGuidance.operations}
            tone="warning"
            highlighted={result.improvementGuidance.operations > 0.5}
          />
          <PercentChip
            label="メニュー・レシピ改善"
            value={result.improvementGuidance.menuRecipe}
            tone="serious"
            highlighted={result.improvementGuidance.menuRecipe > 0.5}
          />
        </div>
      </div>
    </div>
  );
}
