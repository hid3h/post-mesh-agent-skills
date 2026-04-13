# Changelog

## 2026-04-13

### SKILL.mdの安全性・信頼性を改善

- 投稿先アカウントの確認を必須化（連携アカウントが1つでも省略しない）
- `posts create`に`--data`フラグ必須を明記（stdinパイプは動作しない）
- 長文キャプションのシェルエスケープ対策（Writeツール + `$(cat ...)`方式）
- ポーリングで`sleep`を使わず`posts get`を直接再実行する方式に変更
- プラットフォーム対応表を修正（Instagram画像対応を追加、X動画を削除）
- 429レート制限時のリトライ手順を明確化

### リポジトリ構成の整備

- CHANGELOG.md、CLAUDE.md、LICENSE（MIT）、.gitignoreを追加

## 2026-03-24

### 初回リリース

- SKILL.md: マルチプラットフォームSNS投稿スキル
- scripts/post-mesh.js: CLIラッパー（Node.js 18+、ゼロ依存）
- 対応プラットフォーム: YouTube、TikTok、Instagram、X、Threads、Facebook
- テキスト、画像、動画投稿に対応
- 予約投稿、マルチプラットフォーム同時投稿に対応
