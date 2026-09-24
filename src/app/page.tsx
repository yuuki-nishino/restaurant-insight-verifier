"use client";

import { useActionState } from "react";
import { analyzeReviews, type AnalyzeState } from "@/app/actions";
import { ASPECTS } from "@/lib/jev";

const initialState: AnalyzeState = { results: [] };

const SENTIMENT_LABEL: Record<string, string> = {
  positive: "ポジティブ",
  negative: "ネガティブ",
  neutral: "ニュートラル",
};

export default function Home() {
  const [state, formAction, isPending] = useActionState(analyzeReviews, initialState);

  return (
    <div className="flex min-h-screen flex-col items-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex w-full max-w-3xl flex-col gap-8 px-6 py-16">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-semibold text-black dark:text-zinc-50">ラーメン屋 口コミ分析</h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            口コミを空行区切りで複数件貼り付けて「分析開始」を押すと、Jevが1件ずつアスペクト・感情・言及メニューを分類します。
            DBには保存されません（ページを離れると結果は消えます）。
          </p>
        </div>

        <form action={formAction} className="flex flex-col gap-3">
          <textarea
            name="reviews"
            rows={10}
            required
            placeholder={"スープは美味しいけど提供まで40分待った。接客も素っ気なかった\n\n（空行を挟んで次の口コミ）"}
            className="w-full rounded-lg border border-zinc-300 bg-white p-4 text-sm text-black dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
          />
          <button
            type="submit"
            disabled={isPending}
            className="self-start rounded-full bg-foreground px-6 py-2.5 text-sm font-medium text-background transition-colors hover:bg-[#383838] disabled:opacity-50 dark:hover:bg-[#ccc]"
          >
            {isPending ? "分析中..." : "分析開始"}
          </button>
        </form>

        {state.error && <p className="text-sm text-red-600 dark:text-red-400">{state.error}</p>}

        {state.results.length > 0 && (
          <div className="flex flex-col gap-4">
            <h2 className="text-lg font-medium text-black dark:text-zinc-50">分類結果（{state.results.length}件）</h2>
            {state.results.map((result, index) => (
              <div
                key={index}
                className="flex flex-col gap-2 rounded-lg border border-zinc-200 bg-white p-4 text-sm dark:border-zinc-800 dark:bg-zinc-900"
              >
                <p className="text-black dark:text-zinc-50">{result.reviewText}</p>
                <div className="flex flex-wrap gap-2 text-xs">
                  {ASPECTS.filter((aspect) => result.aspectScores[aspect] > 0.5).map((aspect) => (
                    <span
                      key={aspect}
                      className="rounded-full bg-zinc-100 px-2.5 py-1 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                    >
                      {aspect} ({Math.round(result.aspectScores[aspect] * 100)}%)
                    </span>
                  ))}
                  <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                    感情: {SENTIMENT_LABEL[result.sentiment.choice]}
                  </span>
                  {result.menuMentioned.choice !== "none" && (
                    <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                      メニュー: {result.menuMentioned.choice}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
