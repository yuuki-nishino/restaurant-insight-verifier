"use client";

import { useActionState } from "react";
import { analyzeReviews, type AnalyzeState } from "@/app/actions";
import { Dashboard } from "@/app/components/Dashboard";
import { ReviewCard } from "@/app/components/ReviewCard";

const initialState: AnalyzeState = { results: [], stats: null, timing: null, mode: null };

function formatSeconds(ms: number): string {
  return (ms / 1000).toFixed(1);
}

export default function Home() {
  const [state, formAction, isPending] = useActionState(analyzeReviews, initialState);

  return (
    <div className="flex min-h-screen flex-col items-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex w-full max-w-3xl flex-col gap-8 px-6 py-16">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-semibold text-black dark:text-zinc-50">飲食店 口コミ分析</h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            口コミを空行2つ以上で区切って複数件貼り付け、「分析開始」を押すとJevが1件ずつアスペクト・感情・対応ガイド（返信/改善）を分類します。
            DBには保存されません（ページを離れると結果は消えます）。
          </p>
        </div>

        <form action={formAction} className="flex flex-col gap-3">
          <textarea
            name="reviews"
            rows={10}
            required
            placeholder={
              "スープは美味しいけど提供まで40分待った。接客も素っ気なかった\n\n\n（空行2つを挟んで次の口コミ）"
            }
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

        {state.timing && state.mode && (
          <div className="flex flex-wrap items-center gap-2 rounded-lg border border-zinc-200 bg-white px-4 py-2.5 text-xs text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400">
            <span
              className={`rounded-full px-2 py-0.5 font-medium ${
                state.mode === "live"
                  ? "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300"
                  : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
              }`}
            >
              {state.mode === "live" ? "Jev API（実接続）" : "モック分類（Jev未接続）"}
            </span>
            <span>
              {state.timing.reviewCount}件を{formatSeconds(state.timing.totalMs)}秒で処理（1件あたり平均
              {" "}
              {formatSeconds(state.timing.avgPerReviewMs)}秒）
            </span>
          </div>
        )}

        {state.stats && <Dashboard stats={state.stats} />}

        {state.results.length > 0 && (
          <div className="flex flex-col gap-4">
            <h2 className="text-lg font-medium text-black dark:text-zinc-50">口コミ別の分類（{state.results.length}件）</h2>
            {state.results.map((result, index) => (
              <ReviewCard key={index} result={result} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
