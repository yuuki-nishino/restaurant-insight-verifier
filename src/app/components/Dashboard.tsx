import type { AggregatedStats } from "@/lib/aggregate";
import { ASPECTS, type Aspect } from "@/lib/jev";

const ASPECT_COLOR_VAR: Record<Aspect, string> = {
  味: "var(--series-1)",
  接客: "var(--series-2)",
  待ち時間: "var(--series-3)",
  清潔さ: "var(--series-4)",
  コスパ: "var(--series-5)",
  見た目: "var(--series-6)",
  ニオイ: "var(--series-7)",
};

const SENTIMENT_LABEL = {
  positive: "ポジティブ",
  neutral: "ニュートラル",
  mixed: "賛否混在",
  negative: "ネガティブ",
} as const;

export function Dashboard({ stats }: { stats: AggregatedStats }) {
  const { totalReviews } = stats;
  const maxAspectCount = Math.max(1, ...ASPECTS.map((aspect) => stats.aspectCounts[aspect]));

  return (
    <div className="viz-root flex flex-col gap-8 rounded-lg border border-[var(--gridline)] bg-[var(--surface-1)] p-5">
      <style>{`
        .viz-root {
          --surface-1: #fcfcfb;
          --text-primary: #0b0b0b;
          --text-secondary: #52514e;
          --text-muted: #898781;
          --gridline: #e1e0d9;
          --series-1: #2a78d6;
          --series-2: #eb6834;
          --series-3: #1baf7a;
          --series-4: #eda100;
          --series-5: #e87ba4;
          --series-6: #008300;
          --series-7: #4a3aa7;
          --status-good: #0ca30c;
          --status-warning: #fab219;
          --status-serious: #ec835a;
          --status-critical: #d03b3b;
        }
        @media (prefers-color-scheme: dark) {
          .viz-root {
            --surface-1: #1a1a19;
            --text-primary: #ffffff;
            --text-secondary: #c3c2b7;
            --text-muted: #898781;
            --gridline: #2c2c2a;
            --series-1: #3987e5;
            --series-2: #d95926;
            --series-3: #199e70;
            --series-4: #c98500;
            --series-5: #d55181;
            --series-6: #008300;
            --series-7: #9085e9;
          }
        }
      `}</style>

      <section className="flex flex-col gap-3">
        <h3 className="text-sm font-medium text-[var(--text-primary)]">アスペクト別件数（{totalReviews}件中）</h3>
        <div className="flex flex-col gap-2">
          {ASPECTS.map((aspect) => {
            const count = stats.aspectCounts[aspect];
            const pct = totalReviews === 0 ? 0 : Math.round((count / totalReviews) * 100);
            const widthPct = Math.round((count / maxAspectCount) * 100);
            return (
              <div key={aspect} className="flex items-center gap-3" title={`${aspect}: ${count}件（${pct}%）`}>
                <span className="w-16 shrink-0 text-xs text-[var(--text-secondary)]">{aspect}</span>
                <div className="h-3 flex-1 rounded-full bg-[var(--gridline)]">
                  <div
                    className="h-3 rounded-full transition-[width]"
                    style={{ width: `${widthPct}%`, backgroundColor: ASPECT_COLOR_VAR[aspect] }}
                  />
                </div>
                <span className="w-20 shrink-0 text-right text-xs tabular-nums text-[var(--text-muted)]">
                  {count}件（{pct}%）
                </span>
              </div>
            );
          })}
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h3 className="text-sm font-medium text-[var(--text-primary)]">感情の内訳</h3>
        <div className="flex h-4 w-full overflow-hidden rounded-full bg-[var(--gridline)]">
          {(
            [
              ["positive", stats.sentimentCounts.positive, "var(--status-good)"],
              ["mixed", stats.sentimentCounts.mixed, "var(--status-warning)"],
              ["neutral", stats.sentimentCounts.neutral, "var(--text-muted)"],
              ["negative", stats.sentimentCounts.negative, "var(--status-critical)"],
            ] as const
          ).map(([key, count, color]) =>
            count === 0 ? null : (
              <div
                key={key}
                style={{ width: `${(count / totalReviews) * 100}%`, backgroundColor: color }}
                title={`${SENTIMENT_LABEL[key]}: ${count}件`}
              />
            ),
          )}
        </div>
        <div className="flex flex-wrap gap-4 text-xs text-[var(--text-secondary)]">
          <LegendDot color="var(--status-good)" label={`ポジティブ ${stats.sentimentCounts.positive}件`} />
          <LegendDot color="var(--status-warning)" label={`賛否混在 ${stats.sentimentCounts.mixed}件`} />
          <LegendDot color="var(--text-muted)" label={`ニュートラル ${stats.sentimentCounts.neutral}件`} />
          <LegendDot color="var(--status-critical)" label={`ネガティブ ${stats.sentimentCounts.negative}件`} />
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h3 className="text-sm font-medium text-[var(--text-primary)]">次のアクション</h3>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatTile label="お礼推奨" count={stats.replyGuidanceCounts.thanks} color="var(--status-good)" />
          <StatTile label="謝罪推奨" count={stats.replyGuidanceCounts.apology} color="var(--status-critical)" />
          <StatTile
            label="オペレーション改善"
            count={stats.improvementGuidanceCounts.operations}
            color="var(--status-warning)"
          />
          <StatTile
            label="メニュー・レシピ改善"
            count={stats.improvementGuidanceCounts.menuRecipe}
            color="var(--status-serious)"
          />
        </div>
      </section>
    </div>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
      {label}
    </span>
  );
}

function StatTile({ label, count, color }: { label: string; count: number; color: string }) {
  return (
    <div className="flex flex-col gap-1 rounded-lg border border-[var(--gridline)] p-3">
      <span className="block h-1 w-6 rounded-full" style={{ backgroundColor: color }} />
      <span className="text-2xl font-semibold tabular-nums text-[var(--text-primary)]">{count}</span>
      <span className="text-xs text-[var(--text-secondary)]">{label}</span>
    </div>
  );
}
