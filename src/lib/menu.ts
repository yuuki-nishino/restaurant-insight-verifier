export const MENU_ITEMS = [
  "醤油ラーメン",
  "味噌ラーメン",
  "塩ラーメン",
  "とんこつラーメン",
  "つけ麺",
  "餃子",
  "チャーシュー丼",
] as const;

export type MenuItem = (typeof MENU_ITEMS)[number];

export const NO_MENU_MENTIONED = "none" as const;
