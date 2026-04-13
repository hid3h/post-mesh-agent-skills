---
name: post-mesh
description: >
  post mesh を使って YouTube、TikTok、Instagram、X (Twitter)、Threads、Facebook への
  投稿を作成・予約・管理する。SNSへの投稿、予約投稿、マルチプラットフォーム同時投稿、
  「post mesh」、クロスポスト、同時投稿などのキーワードが含まれる場合にこのスキルを使用する。
  テキスト投稿、画像投稿、動画投稿、メディアアップロード、予約投稿、投稿ステータス確認に対応。
last-updated: 2026-04-13
allowed-tools: Bash(./scripts/post-mesh.js:*)
---

# post mesh — マルチプラットフォームSNS投稿

post mesh は複数のSNSプラットフォームへの投稿を一括で作成・予約・管理できるサービスです。

| プラットフォーム | テキスト | 画像 | 動画 |
|------------------|----------|------|------|
| YouTube          |          |      | o    |
| TikTok           |          |      | o    |
| Instagram        |          | o    | o    |
| X                | o        | o    |      |
| Threads          | o        | o    | o    |
| Facebook         | o        | o    |      |

## スキルの更新確認

上記の `last-updated` を確認し、30日以上前であれば更新を提案する:

```bash
npx skills check
npx skills update
```

## セットアップ

コマンドを使用する前に post mesh の APIキーが必要です。

1. [post-mesh.com](https://post-mesh.com) でアカウントを作成
2. ダッシュボードでSNSアカウントを連携（設定 > 連携）
3. 設定 > APIキー からAPIキーを発行
4. セットアップを実行:

```bash
./scripts/post-mesh.js setup --key YOUR_API_KEY --global
```

`--global` を指定すると `~/.config/post-mesh/config.json` に保存されます（推奨）。指定しない場合はカレントディレクトリの `.post-mesh/config.json` に保存されます。

環境変数 `POST_MESH_API_KEY` でも設定できます。

**APIキーが見つからない場合**、勝手に探したり推測してはいけません。ユーザーにセットアップコマンドの実行を案内して待ってください。

### 設定の優先順位

1. 環境変数 `POST_MESH_API_KEY`
2. ローカル設定（`.post-mesh/config.json`）
3. グローバル設定（`~/.config/post-mesh/config.json`）

### セットアップの確認

```bash
./scripts/post-mesh.js config show
./scripts/post-mesh.js account
```

## CLIコマンド

すべてのコマンドはJSONを出力します。

### 設定

| コマンド | 説明 |
|----------|------|
| `setup --key <KEY> [--global]` | APIキーを保存 |
| `config show` | 現在の設定を表示（キーはマスクされる） |
| `account` | アカウント情報を取得（ユーザーIDとメールアドレス） |

### 連携アカウント

| コマンド | 説明 |
|----------|------|
| `connections [--platform <p>]` | 連携済みSNSアカウントを一覧表示 |

プラットフォーム値: `youtube`, `tiktok`, `instagram`, `threads`, `x`, `facebook`

### メディア

| コマンド | 説明 |
|----------|------|
| `media upload <file-path>` | メディアファイルをアップロードし `media_id` を返す |

対応ファイル:
- **動画**: `.mp4`, `.mov`（最大500MB）
- **画像**: `.jpg`, `.jpeg`, `.png`, `.webp`, `.gif`（最大20MB）

署名付きアップロードURLの有効期限は15分です。

### 投稿

| コマンド | 説明 |
|----------|------|
| `posts create --data '<JSON>'` | 投稿を作成（即時または予約） |
| `posts list [--status <s>] [--platform <p>] [--page N] [--limit N]` | 投稿を一覧表示 |
| `posts get <id>` | 投稿の詳細とプラットフォームごとのステータスを取得 |
| `posts cancel <id>` | 予約投稿をキャンセル |

ステータス値: `posted`, `scheduled`, `processing`, `failed`

**`posts create`には必ず`--data`フラグでJSONを渡すこと。** stdinパイプ（`cat | node ... posts create`）は動作しない。

キャプションが長い・改行を含む場合、シェルのクォートでJSONが壊れやすい。安全な方法:

1. Writeツールで `/tmp/post-data.json` にJSONを書き出す
2. `--data` にファイルの中身を渡す:

```bash
./scripts/post-mesh.js posts create --data "$(cat /tmp/post-data.json)"
```

`allowed-tools` の制約上、`cat > /tmp/...` 等のBashコマンドでファイルを作成できない。必ずWriteツールを使うこと。

## 投稿の作成

### 投稿データ形式

```json
{
  "category": "text",
  "caption": "投稿テキスト",
  "targets": [
    {
      "connection_id": "conn_abc",
      "caption": "プラットフォーム別のキャプション",
      "youtube_title": "YouTube専用のタイトル"
    }
  ],
  "scheduled_at": "2026-04-01T10:00:00Z",
  "media_id": "動画投稿のみ",
  "media_ids": ["画像投稿のみ"],
  "thumbnail_time": 5.5
}
```

### フィールド

| フィールド | 必須 | 備考 |
|------------|------|------|
| `category` | 常に | `text`, `image`, `video` のいずれか |
| `caption` | 常に | デフォルトのキャプション |
| `targets` | 常に | 1つ以上のターゲット |
| `targets[].connection_id` | 常に | `connections` コマンドで取得 |
| `targets[].caption` | 常に | プラットフォームごとのキャプション |
| `targets[].youtube_title` | YouTube | YouTubeの場合は必須 |
| `scheduled_at` | いいえ | ISO 8601形式の未来の日時。省略で即時投稿 |
| `media_id` | `video` のみ | `media upload` で取得 |
| `media_ids` | `image` のみ | `media upload` で取得したIDの配列 |
| `thumbnail_time` | いいえ | サムネイル位置（秒）。動画のみ |

### テキスト投稿

```bash
# 1. Xの連携アカウントを確認
./scripts/post-mesh.js connections --platform x

# 2. 投稿
./scripts/post-mesh.js posts create --data '{
  "category": "text",
  "caption": "こんにちは！",
  "targets": [{"connection_id": "conn_abc", "caption": "こんにちは！"}]
}'
```

### 画像投稿

```bash
# 1. 画像をアップロード
./scripts/post-mesh.js media upload ./photo1.jpg
./scripts/post-mesh.js media upload ./photo2.jpg

# 2. media_ids を指定して投稿
./scripts/post-mesh.js posts create --data '{
  "category": "image",
  "caption": "写真です",
  "media_ids": ["media_abc", "media_def"],
  "targets": [{"connection_id": "conn_x", "caption": "写真です #photography"}]
}'
```

### 動画投稿

```bash
# 1. 動画をアップロード
./scripts/post-mesh.js media upload ./video.mp4

# 2. media_id を指定して投稿（YouTubeは youtube_title が必須）
./scripts/post-mesh.js posts create --data '{
  "category": "video",
  "caption": "新しい動画です！",
  "media_id": "media_abc",
  "thumbnail_time": 3.0,
  "targets": [
    {"connection_id": "conn_yt", "caption": "ぜひ見てください！ #youtube", "youtube_title": "動画タイトル"},
    {"connection_id": "conn_tt", "caption": "ぜひ見てください！ #tiktok"}
  ]
}'
```

### マルチプラットフォーム投稿

ターゲットを追加するだけで複数プラットフォームに同時投稿できます。各ターゲットに個別のキャプションを設定可能:

```bash
./scripts/post-mesh.js posts create --data '{
  "category": "text",
  "caption": "お知らせです！",
  "targets": [
    {"connection_id": "conn_x", "caption": "お知らせです！ #X"},
    {"connection_id": "conn_threads", "caption": "お知らせです！"},
    {"connection_id": "conn_fb", "caption": "お知らせです！ 詳細はこちら..."}
  ]
}'
```

### 予約投稿

`scheduled_at` にISO 8601形式の未来の日時を指定:

```bash
./scripts/post-mesh.js posts create --data '{
  "category": "text",
  "caption": "おはようございます！",
  "targets": [{"connection_id": "conn_x", "caption": "おはようございます！"}],
  "scheduled_at": "2026-04-01T09:00:00Z"
}'
```

## 投稿ステータスの確認

即時投稿の場合、ステータスは最初 `processing` になります。完了するまで確認してください:

```bash
./scripts/post-mesh.js posts get <post-id>
```

- `platforms[].status` が `posted` または `failed` になったら完了
- まだ `processing` なら `posts get` を再実行する（ツール呼び出し間の自然な間隔で十分。`sleep`は使わない）
- テキスト・画像は最大30秒、動画は最大60秒で完了する
- 成功時は `platforms[].external_url` にライブURLが入る — ユーザーに表示する
- 失敗時は `platforms[].error_message` にエラー内容が入る

予約投稿の場合、ステータスは即座に `scheduled` になるためポーリング不要。

## 予約投稿のキャンセル

`can_cancel: true` の投稿のみキャンセル可能:

```bash
./scripts/post-mesh.js posts cancel <post-id>
```

## 推奨ワークフロー

APIを呼び出す前に、まずユーザーと会話してください。何を投稿したいのか、どこに投稿するのかを理解してからAPIを使います。

1. **意図を確認** — ユーザーに何を投稿したいか（テキスト/画像/動画）、どのプラットフォームに投稿するか、即時か予約かを聞く
2. **連携アカウントを確認し、ユーザーに選んでもらう** — `connections` で利用可能なアカウントを取得。ユーザーが選んだカテゴリに対応するプラットフォームのみ表示:
   - **テキスト**: X, Threads, Facebook
   - **画像**: Instagram, X, Threads, Facebook
   - **動画**: YouTube, TikTok, Instagram, Threads

   プラットフォームごとにグループ化して表示:
   ```
   X: @_hid3, @post_mesh
   Threads: @_hid3
   Facebook: My Page
   ```
   選択したカテゴリに対応しないプラットフォームは表示しない（例: 画像投稿にYouTubeを表示しない）。

   **ここで必ずユーザーにどのアカウントに投稿するか聞くこと。** 連携アカウントが1つしかなくても省略せず確認する。アカウントが1つの場合は「〇〇に投稿しますか？」と確認するだけでよい。ユーザーの明示的な回答を得るまで先に進まない。
3. **コンテンツを準備** — ユーザーとキャプションを作成。プラットフォームの文字数制限を考慮する。画像/動画の場合はファイルパスを確認
4. **ユーザーに確認** — 最終プラン（コンテンツ、投稿先アカウントとプラットフォーム、スケジュール）を表示し、明示的な承認を得る
5. **メディアをアップロード**（必要な場合） — `media upload <file>` で `media_id` を取得
6. **投稿を作成** — `posts create --data '...'`
7. **結果を確認** — `posts get <id>` で成功を確認しライブURLを取得

## 重要なルール

- **投稿前に必ず確認する。** ユーザーが「今すぐ投稿して」「すぐに公開して」と明示しない限り、コンテンツとターゲットを先に表示する。即時投稿は公開後に取り消せない。
- **投稿先アカウントを必ずユーザーに確認する。** 連携アカウントが1つしかなくても勝手に選ばない。「Threads @hide_carryに投稿しますか？」のように確認し、ユーザーの回答を待つ。これは投稿が取り消せない操作だから重要。
- **キャプションを統一する。** ユーザーがプラットフォーム別のテキストを望まない限り、`caption` と `targets[].caption` は同じテキストを使う。
- **YouTubeにはタイトルが必須。** YouTubeの連携アカウントには必ず `youtube_title` を含める。
- **タイムゾーンを変換する。** ユーザーが「明日の9時」と言ったら、ユーザーのタイムゾーンでISO 8601に変換する。
- **重複投稿をしない。** 同じアカウントに同じコンテンツを2回投稿しない。
- **レート制限を守る。** 429レスポンスを受け取ったら、すぐにリトライせずユーザーに状況を伝えてから再試行する。
- **サブスクリプションが必要。** メディアアップロードと投稿作成にはアクティブなサブスクリプションが必要。403 `SUBSCRIPTION_REQUIRED` エラーが出た場合、post-mesh.com でサブスクリプションが必要であることをユーザーに伝える。

## 自動化のガイドライン

自動化ワークフローで使用する場合:
- 実行をまたいで重複・類似コンテンツを投稿しない
- 自動返信やエンゲージメント稼ぎをしない
- 公開前に必ず人間のレビューを含める
- 各プラットフォームの利用規約を遵守する
