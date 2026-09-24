# API仕様（Jev / Claude）

最終更新: 2026-09-24

Jevの実際の仕様は [ADR-0003](./decisions/0003-jev-primitive-mapping.md) の通り、Choice/Score/Noulの3プリミティブに合わせて設計している。エンドポイント・SDK等の詳細は https://docs.typesafe.ai/ を参照（実装時は毎回ライブドキュメントで最新仕様を確認すること）。

## Jev API

### 呼び出し方

- エンドポイント: `POST https://api.typesafe.ai/v1/systemone`（認証は`Authorization: Bearer $TYPESAFE_API_KEY`）
- JS SDK: `@typesafe-ai/sdk`。`new TypeSafeClient()`が環境変数`TYPESAFE_API_KEY`を読む。`client.systemOne({ state, questions })`で呼び出す
- 1回のリクエストで複数の質問（Choice/Score/Noulを混在可）をまとめて送れる。分類クエリはアスペクト×5のNoul＋感情のChoice＋メニューのChoiceを1リクエストにまとめる

### ① 分類クエリ（口コミ1件ごと）

**state**

```json
{ "review_text": "スープは美味しいけど提供まで40分待った。接客も素っ気なかった" }
```

**questions**

- アスペクト（`味` / `接客` / `待ち時間` / `清潔さ` / `コスパ`の5項目）: それぞれ独立したNoul。「その他」バケツは作らず、どのアスペクトも該当しない場合は「特定のアスペクトへの言及なし」として扱う（[ADR-0003](./decisions/0003-jev-primitive-mapping.md)）
- `sentiment`: Choice（`positive` / `negative` / `neutral`）
- `menu_mentioned`: Choice（固定のメニュー名リスト + `none`。リストは `src/lib/menu.ts` で管理）

```json
{
  "state": { "review_text": "スープは美味しいけど提供まで40分待った。接客も素っ気なかった" },
  "model": "jev-latest",
  "questions": {
    "aspect_taste": { "type": "noul", "instructions": "この口コミは「味」について言及しているか" },
    "aspect_service": { "type": "noul", "instructions": "この口コミは「接客」について言及しているか" },
    "aspect_wait_time": { "type": "noul", "instructions": "この口コミは「待ち時間」について言及しているか" },
    "aspect_cleanliness": { "type": "noul", "instructions": "この口コミは「清潔さ」について言及しているか" },
    "aspect_cost_performance": { "type": "noul", "instructions": "この口コミは「コスパ」について言及しているか" },
    "sentiment": {
      "type": "choice",
      "instructions": "この口コミ全体の感情はどれに近いか",
      "criteria": { "positive": "総合的に好意的・満足", "negative": "総合的に不満・批判的", "neutral": "感情的な評価が読み取れない、または中立" }
    },
    "menu_mentioned": {
      "type": "choice",
      "instructions": "この口コミで具体的に言及されているメニューはどれか",
      "criteria": { "醤油ラーメン": null, "味噌ラーメン": null, "塩ラーメン": null, "とんこつラーメン": null, "つけ麺": null, "餃子": null, "チャーシュー丼": null, "none": "特定のメニュー名の言及なし" }
    }
  }
}
```

**出力例**

```json
{
  "model": "jev-1.13.0",
  "answers": {
    "aspect_taste": { "type": "noul", "noul": 0.91 },
    "aspect_service": { "type": "noul", "noul": 0.76 },
    "aspect_wait_time": { "type": "noul", "noul": 0.88 },
    "aspect_cleanliness": { "type": "noul", "noul": 0.05 },
    "aspect_cost_performance": { "type": "noul", "noul": 0.1 },
    "sentiment": {
      "type": "choice",
      "choice": "negative",
      "confidence": 0.72,
      "probabilities": { "positive": 0.1, "negative": 0.72, "neutral": 0.18 }
    },
    "menu_mentioned": {
      "type": "choice",
      "choice": "none",
      "confidence": 0.95,
      "probabilities": { "醤油ラーメン": 0.02, "味噌ラーメン": 0.0, "塩ラーメン": 0.0, "とんこつラーメン": 0.0, "つけ麺": 0.0, "餃子": 0.0, "チャーシュー丼": 0.03, "none": 0.95 }
    }
  }
}
```

コード側でNoul値をしきい値（例: 0.5超）で判定し、該当アスペクトの配列に変換する。

### ② 検証クエリ（LLMのインサイト文チェック）

DBを持たず1回の分析で完結する設計（[ADR-0002](./decisions/0002-no-database-single-run-analysis.md)）のため、検証対象は**今回投入されたデータの集計結果の中で完結する主張のみ**。「先月比」のような期間をまたぐ比較は行わない。

is_supportedはChoice(true/false)ではなくNoulにする（[ADR-0003](./decisions/0003-jev-primitive-mapping.md)）。

**state**

```json
{
  "claim_text": "待ち時間への不満が全体の35%を占め、最も多い",
  "aggregated_stats": { "totalReviews": 24, "byAspect": { "待ち時間": { "count": 9, "positive": 0, "negative": 8, "neutral": 1 } } }
}
```

**questions**

```json
{
  "is_supported": {
    "type": "noul",
    "instructions": "`claim_text`の主張は`aggregated_stats`の数値と整合するか"
  }
}
```

**出力例**

```json
{ "model": "jev-1.13.0", "answers": { "is_supported": { "type": "noul", "noul": 0.94 } } }
```

`noul`が0.5から離れているほど確信度が高いとみなし、0.5付近（例: 0.3〜0.7）は「要確認」として表示する。

### モック代替方針

MVP実装時点でJevの一般公開APIが利用できない場合は、同じ入出力インターフェース（state + questions → answers）を持つモック関数（ルールベースの簡易分類）で代替し、後日本物のJev APIに差し替えられる設計にしておく（[ADR-0001](./decisions/0001-jev-mock-fallback.md)）。※本プロジェクトでは実際にJev APIキーが利用可能なため、実装は実APIを既定にしつつ、キー未設定時にモックへフォールバックする。

## LLM（Claude API）仕様

呼び出しは分析実行1回につき1回のみ。入力はJevの分類結果を集計したJSON（アスペクト別件数、メニュー別言及数、感情の内訳など）。

**プロンプト方針**

- 「以下の集計データだけを根拠に、店主向けのインサイトを3〜5個、箇条書きで生成して」
- 各インサイトは「観測された事実（件数・割合）＋示唆」の2部構成にする
- 集計データにない推測（因果関係の断定など）は避け、「〜の可能性がある」と書かせる
- 過去の期間との比較（前月比・トレンド等）はデータを持っていないため書かせない。今回投入されたデータの中で完結する主張のみに限定する
- 出力はJSON配列（`{claim_text, evidence}`の配列）で構造化させ、②の検証クエリにそのまま渡せる形にする

## 関連ドキュメント

- 全体設計: [architecture.md](./architecture.md)
- 入出力に関わるデータの型: [data-model.md](./data-model.md)
- DBを持たないことにした理由: [decisions/0002-no-database-single-run-analysis.md](./decisions/0002-no-database-single-run-analysis.md)
- Jevの実プリミティブへのマッピング: [decisions/0003-jev-primitive-mapping.md](./decisions/0003-jev-primitive-mapping.md)
