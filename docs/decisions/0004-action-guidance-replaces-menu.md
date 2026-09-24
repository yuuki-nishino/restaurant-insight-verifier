# ADR-0004: メニュー分類を廃止し、店主向けの対応ガイド分類を追加する

日付: 2026-09-24
ステータス: 承認（[ADR-0003](./0003-jev-primitive-mapping.md)のメニュー分類部分を置き換え）

## コンテキスト

ADR-0003で導入した「メニュー言及」のChoice分類（固定メニューリストからの選択）を実際に動かしたところ、実用に耐えない誤分類が目立った。また、そもそも本アプリの目的（README: 「口コミ・レビューの分析を行い、返信を提案するシステム」）に立ち返ると、店主が知りたいのは「どのメニューが言及されたか」よりも「この口コミに対して次に何をすべきか」である。

## 決定

1. **メニュー分類を廃止する。** `menu_mentioned`のChoice質問、固定メニューリスト（`src/lib/menu.ts`）、関連する型・UI表示をすべて削除する。
2. **対応ガイド分類を追加する。** 「返信」と「改善」は目的が異なる別軸として扱い、それぞれ独立に真偽が判定されうるためNoulを使う（[ADR-0003](./0003-jev-primitive-mapping.md)のNoul多ラベル方針を踏襲）。
   - 返信ガイド（reply guidance）
     - `reply_thanks`: この口コミに感謝を伝える返信をすべきか
     - `reply_apology`: この口コミに謝罪を伝える返信をすべきか
     - 同じ口コミで両方Trueになりうる（例: 「味は最高だったが接客が悪かった」）
   - 改善ガイド（improvement guidance）
     - `improvement_operations`: この口コミからオペレーション（接客・待ち時間・清潔さなど）の改善点が読み取れるか
     - `improvement_menu_recipe`: この口コミからメニュー・レシピの改善点が読み取れるか

アスペクト（味/接客/待ち時間/清潔さ/コスパ）の判定と組み合わせてルールベースで導出する案もあったが、単一の全体sentimentからは「褒めつつ改善提案もある」ような混在レビューのニュアンスが失われるため、Jevに直接判定させる。

## 理由

- メニュー分類は精度が低く、店主に誤った情報を見せるリスクの方が大きかった。
- 「次に何をすべきか」を示すことが本アプリの中核価値であり、単なる分類（アスペクト・感情）だけでは店主のアクションに繋がらない。
- 返信要否と改善要否は目的（顧客対応 vs オペレーション/商品改善）が異なるため、1つの選択肢にまとめず別軸にする。

## 影響

- `src/lib/jev/types.ts`の`ReviewClassification`から`menuMentioned`を削除し、`replyGuidance: { thanks: number; apology: number }`と`improvementGuidance: { operations: number; menuRecipe: number }`を追加する。
- `src/lib/jev/live.ts`・`mock.ts`・`src/lib/menu.ts`を更新（メニュー関連コード削除、新Noul追加）。
- `docs/api-spec.md`・`docs/data-model.md`・`docs/architecture.md`のダッシュボード説明を更新する。
- ダッシュボードでは「返信ガイド」「改善ガイド」の件数を表示し、店主が次のアクションを一目で把握できるようにする。
- 将来、返信文面の自動生成（Claude API）を追加する際は、この2軸（thanks/apology、operations/menuRecipe）を入力として使う想定。
