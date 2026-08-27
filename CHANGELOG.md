# Changelog

## 2026-08-27

### `account` コマンドを削除し、APIキー検証を `connections` に変更

- アカウント情報の取得はスキルの投稿フローに必須ではないため、APIの `GET /api/v1/account` 廃止に合わせて依存を外した
- `account` コマンドを削除（`scripts/post-mesh.js`、SKILL.md。README.mdには元から記載なし）
- `setup` のAPIキー有効性検証を `GET /account` から `GET /connections` に変更。成功時の出力は `account` から `connections` になる
- 「セットアップの確認」の実行例から `account` を削除し、`config show` のみに変更

## 2026-08-10

### TikTokの公開範囲とコメント・デュエット・ステッチの指定に対応

- `targets[].tiktok_privacy_level` を記載（この投稿を見せる相手。省略すると全員に公開。`tiktok_draft` との併用は400）
- 「TikTokの公開範囲」節を追加。post meshが扱うのは `PUBLIC_TO_EVERYONE` と `SELF_ONLY` の2つで、非公開アカウントでは前者を選べないことを明記
- 選べない値を指定すると投稿は作成されず `TIKTOK_PRIVACY_LEVEL_UNAVAILABLE` で400になること、エラーメッセージに選べる値が含まれるので選び直して再送できることを記載
- エラーが返ったときは勝手に値を選ばず、選べる値を示してユーザーに確認する手順を追加
- `targets[].tiktok_allow_comment` / `tiktok_allow_duet` / `tiktok_allow_stitch` を記載（`false`で禁止。デュエットとステッチは動画のみで、画像投稿での指定は400。アカウント側で無効な場合は`true`でも無効のまま投稿される）

## 2026-07-30

### 下書き保存（`draft: true`）を正式記載し「下書き」依頼の振り分けを更新

- `draft` フィールドを記載（`true` でSNSへ配信せずpost mesh内に下書き保存。`scheduled_at` との併用は400）
- 「下書きの作成」の投稿例を追加。下書きから公開への昇格はWebアプリの編集画面でのみ可能で、APIからはできないことを明記
- 「「下書き」という依頼の扱い」節を、post meshの下書き保存 / TikTokアプリの受信箱への下書き送信（`tiktok_draft`） / 予約投稿の3択を確認する内容に書き換え
- `posts list` のステータス値に `draft` を追加、`posts cancel` が下書きも対象であることを追記
- `targets[].caption` と `targets[].youtube_title` は下書きでのみ省略可、公開時は必須であることを明記（キャプションは1文字以上で空文字は400）

## 2026-07-29

### Xへの動画投稿に対応

- プラットフォーム対応表にXの動画投稿を追加（README.md、SKILL.md）
- 対応投稿タイプの動画投稿の一覧にXを追加（README.md）
- 推奨ワークフローの動画の投稿先にXを追加
- 投稿先ごとの動画の制約（長さ・ファイルサイズ）を表で追記。X（0.5〜140秒・512MB）、TikTok（180秒以内・ファイルサイズ制限なし）、Instagram（3〜900秒・300MB）、Threads（300秒以内・1GB・映像ビットレート100Mbps以内）、YouTube（長さ・サイズとも制限なし）。アップロード自体の上限は動画1GB
- 動画投稿の例にX宛のtargetを追加
- 対応画像形式から.gifを削除（実装のアップロードAPIがimage/gifを受け付けないため）

## 2026-07-10

### TikTokの画像投稿・下書き・おすすめ音楽の記載を追加

- プラットフォーム対応表にTikTokの画像投稿を追加（README.md、SKILL.md）
- `targets[].tiktok_draft` を記載（公開せずTikTokアプリの受信箱へ下書き送信。動画・画像対応、24時間あたり5件まで）
- `targets[].tiktok_auto_add_music` を記載（TikTokへの画像投稿でおすすめ音楽を自動追加。`image` 以外や `tiktok_draft` との併用は400）
- 未記載だった `targets[].is_ai_generated`（TikTokのAI生成ラベル）を記載
- SKILL.mdに `tiktok_draft` と `tiktok_auto_add_music` の投稿例を追加
- 投稿例からAPIが読まないトップレベル `caption` を削除、`media_ids` の枚数上限（投稿先のうち最も厳しいプラットフォームの上限）を明記

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
