# API仕様（Jev / Claude）

最終更新: 2026-09-24

## Jev API

### ① 分類クエリ（口コミ1件ごと）

**入力（state）**

```json
{
  "review_text": "スープは美味しいけど提供まで40分待った。接客も素っ気なかった"
}
```

**分類させる質問（decision）**

- aspect: `["味", "接客", "待ち時間", "清潔さ", "コスパ", "その他"]` から言及されているものを全て
- sentiment: `["positive", "negative", "neutral"]`
- menu_mentioned: 自由記述（メニュー名が言及されていれば抽出、なければnull）

**出力例**

```json
{
  "aspect": [
    { "label": "味", "confidence": 0.91 },
    { "label": "待ち時間", "confidence": 0.88 },
    { "label": "接客", "confidence": 0.76 }
  ],
  "sentiment": { "label": "negative", "confidence": 0.72 },
  "menu_mentioned": null
}
```

### ② 検証クエリ（LLMのインサイト文チェック）

**入力（state）**

- LLMが生成したインサイト文の1主張（例：「待ち時間への不満が先月比で増加」）
- 集計済みの構造化データ（該当月・前月の aspect=待ち時間 の件数）

**分類させる質問（decision）**

- is_supported: `["true", "false"]` — この主張は集計データで裏付けられるか

**出力例**

```json
{ "is_supported": { "label": "true", "confidence": 0.94 } }
```

### モック代替方針

MVP実装時点でJevの一般公開APIが利用できない場合は、同じ入出力スキーマを持つモック関数（ルールベースの簡易分類）で代替し、後日本物のJev APIに差し替えられる設計にしておく。

## LLM（Claude API）仕様

呼び出しは分析実行1回につき1回のみ。入力はJevの分類結果を集計したJSON（アスペクト別件数、メニュー別言及数、感情の内訳など）。

**プロンプト方針**

- 「以下の集計データだけを根拠に、店主向けのインサイトを3〜5個、箇条書きで生成して」
- 各インサイトは「観測された事実（件数・割合）＋示唆」の2部構成にする
- 集計データにない推測（因果関係の断定など）は避け、「〜の可能性がある」と書かせる
- 出力はJSON配列（`{claim_text, evidence}`の配列）で構造化させ、②の検証クエリにそのまま渡せる形にする

## 関連ドキュメント

- 全体設計: [architecture.md](./architecture.md)
- 入出力に関わるテーブル定義: [data-model.md](./data-model.md)
