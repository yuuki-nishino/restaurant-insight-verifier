# データモデル（Supabase / Postgres）

最終更新: 2026-09-24

| テーブル                 | 主なカラム                                                                                                                  | 用途                                          |
| ------------------------ | --------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------- |
| `reviews`                | id, raw_text, source(手動/CSV), posted_at, created_at                                                                       | 投入された口コミの原文                        |
| `review_classifications` | id, review_id(FK), aspect(味/接客/待ち時間/清潔さ/コスパ), sentiment(positive/negative/neutral), menu_mentioned, confidence | Jevの分類結果1件につき1行                     |
| `insight_reports`        | id, period(対象月), summary_text, generated_at                                                                              | LLMが生成したインサイト文                     |
| `insight_verifications`  | id, insight_report_id(FK), claim_text, is_supported(bool), confidence, note                                                 | Jevによる検証結果（インサイト文中の主張ごと） |

MVPでは店舗テーブル・ユーザーテーブルは作らず、単一店舗・単一ユーザー前提でシンプルに保つ。

## 関連ドキュメント

- 全体設計: [architecture.md](./architecture.md)
- このデータを生成/消費するAPI仕様: [api-spec.md](./api-spec.md)
