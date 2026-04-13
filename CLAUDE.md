# post mesh Agent Skills — 開発ガイダンス

## リポジトリ構成

```
skills/post-mesh/
├── SKILL.md          ← スキル本体（frontmatter + 手順）
└── scripts/
    └── post-mesh.js  ← CLIラッパー（Node.js 18+、ゼロ依存）
```

## SKILL.md編集のルール

- `last-updated`を変更日に更新すること
- `allowed-tools`を変更しないこと（`Bash(./scripts/post-mesh.js:*)`のみ）
- 500行以内を維持すること
- コマンド例は実際に動作するものだけ記載すること

## scripts/post-mesh.jsのルール

- 外部依存なし（Node.js built-in fetchのみ）
- すべてのコマンドはJSONを出力すること
- APIキーをログに出力しないこと

## コミットメッセージ

日本語で記述。変更内容が明確にわかるようにする。

## テスト

SKILL.mdを変更した場合、以下の観点で動作確認すること:

- 投稿先アカウントの確認フローが正しく動くか
- コマンド例が正しい形式か
- 推奨ワークフローのステップに抜け漏れがないか
