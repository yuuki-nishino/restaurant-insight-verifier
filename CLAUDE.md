# CLAUDE.md

このファイルはClaude Codeがこのリポジトリで作業する際のガイドです。

@AGENTS.md

## プロジェクト概要

飲食店向けの口コミ分析アプリ。Jev API（構造化分類・事実検証）とClaude API（インサイト生成）を組み合わせ、大量の口コミテキストから店主向けの示唆を安く速く、誤りの少ない形で提示する。

詳細設計は `docs/` を参照（下記「ドキュメント構成」）。

## ドキュメント構成

設計・仕様は `docs/` 配下に目的別に分割して管理する。実装を進めて設計が変わった場合は、コードだけでなく該当ドキュメントも同じPR/コミットで更新すること。

| ファイル                          | 内容                                                     |
| --------------------------------- | -------------------------------------------------------- |
| `docs/architecture.md`            | 目的・データフロー・技術スタック・画面構成               |
| `docs/data-model.md`              | 処理ステージ間でやり取りするデータの型（DBは持たない）    |
| `docs/api-spec.md`                | Jev API / Claude API の入出力スキーマとプロンプト方針     |
| `docs/decisions/`                 | 設計判断の記録（ADR）。新しいテンプレートは `template.md` |
| `docs/plan.md`                    | 初期構想メモ（歴史的記録。最新情報は上記を優先）          |

大きな設計判断（外部APIの代替方針、アーキテクチャの変更など）をする際は `docs/decisions/` に新しいADRを追加する（`0003-`と連番）。

## タスク管理

タスクはGitHub Issuesで管理する（このリポジトリの `yuuki-nishino/restaurant-insight-verifier`）。作業を始める前にIssueを確認・作成し、完了したらクローズする。ローカルにTODOリストを別途作らない。

## 技術スタック

- フロント/API: Next.js（Vercelにデプロイ）
- 構造化分類・検証: Jev API（未提供時はモック関数。方針は `docs/decisions/0001-jev-mock-fallback.md` 参照）
- インサイト生成: Claude API
- グラフ表示: Recharts等

DBは持たない。口コミ投入から表示までを1リクエスト内で完結させる（`docs/decisions/0002-no-database-single-run-analysis.md` 参照）。詳細は `docs/architecture.md` を参照。

## 開発コマンド

- `npm run dev` — 開発サーバー起動（http://localhost:3000）
- `npm run build` — 本番ビルド
- `npm run start` — 本番ビルドの起動
- `npm run lint` — ESLint実行

## 開発方針

- MVPスコープ（`docs/plan.md` の「やること/やらないこと」）を逸脱する機能を勝手に追加しない。
- Jev/Claude APIの呼び出し部分は抽象化し、モック実装と本物のAPI呼び出しを差し替え可能にする（ADR-0001参照）。
- 単一店舗・単一ユーザー前提。認証やマルチテナント対応はMVP後のスコープ。
