---
name: post-mesh
description: >
  post mesh を使って YouTube、TikTok、Instagram、X (Twitter)、Threads、Facebook への
  投稿を作成・予約・管理する。SNSへの投稿、予約投稿、マルチプラットフォーム同時投稿、
  「post mesh」、クロスポスト、同時投稿などのキーワードが含まれる場合にこのスキルを使用する。
  テキスト投稿、画像投稿、動画投稿、メディアアップロード、予約投稿、投稿ステータス確認に対応。
last-updated: 2026-07-30
allowed-tools: Bash(./scripts/post-mesh.js:*)
---

# post mesh — マルチプラットフォームSNS投稿

post mesh は複数のSNSプラットフォームへの投稿を一括で作成・予約・管理できるサービスです。

| プラットフォーム | テキスト | 画像 | 動画 |
|------------------|----------|------|------|
| YouTube          |          |      | o    |
| TikTok           |          | o    | o    |
| Instagram        |          | o    | o    |
| X                | o        | o    | o    |
| Threads          | o        | o    | o    |
| Facebook         | o        | o    |      |

## 「下書き」という依頼の扱い

post meshは投稿を下書きとして保存できる。ボディに `draft: true` を指定すると、SNSへは配信されず、post mesh内に下書きとして保存される（「下書きの作成」の節を参照）。

ただし「下書き」という言葉が指しうる機能は3つあり、どれも意味が違う。**ユーザーが「下書き」「下書き投稿」「draft」と言ったとき、どれを指すか曖昧なら、勝手にマッピングせず次の選択肢を提示して確認する**:

1. **post meshに下書き保存**（`draft: true`）— SNSには出ない。post meshに保存され、後でWebアプリから公開する
2. **TikTokアプリの受信箱への下書き送信**（`tiktok_draft`、TikTokのみ）— post mesh内ではなくTikTokアプリ側に届く（「TikTokへの下書き送信」の節を参照）
3. **予約投稿**（`scheduled_at`）— 下書きではなく、指定時刻に**自動公開される**

「まず下書きにしておいて、後で公開して」と言われた場合、下書きの作成まではAPIでできるが、**下書きから公開（即時・予約）への昇格はpost meshのWebアプリの編集画面でしかできない**。APIに投稿の更新エンドポイントが無いため、このスキルからは昇格できない。下書きを作った時点でその旨を伝え、公開はWebアプリ（[post-mesh.com](https://post-mesh.com)）で行ってもらう。

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

すべてのコマンドはJSONを出力します。レスポンスは `{ "ok": true, "status": 200, "data": ... }` の形で、実データは `data` の中にあります（`connections` は `data` が配列、`account` は `data.user`、`posts get`/`posts create` は `data.platforms[]`）。

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
- **動画**: `.mp4`, `.mov`（最大1GB）
- **画像**: `.jpg`, `.jpeg`, `.png`, `.webp`（最大20MB）

署名付きアップロードURLの有効期限は15分です。

投稿先ごとの動画の制約（超えると投稿作成時に400エラーになる）:

| 投稿先 | 長さ | ファイルサイズ | その他 |
|--------|------|----------------|--------|
| X | 0.5〜140秒 | 512MB | |
| TikTok | 180秒以内 | 制限なし | |
| Instagram | 3〜900秒 | 300MB | |
| Threads | 300秒以内 | 1GB | 映像ビットレート100Mbps以内 |
| YouTube | 制限なし | 制限なし | |

いずれの投稿先でも、アップロード自体の上限は1GB。長い動画を複数の投稿先へ同時に出すときは、いちばん厳しい投稿先に合わせる。

### 投稿

| コマンド | 説明 |
|----------|------|
| `posts create --data '<JSON>'` | 投稿を作成（即時・予約・下書き） |
| `posts list [--status <s>] [--platform <p>] [--page N] [--limit N]` | 投稿を一覧表示 |
| `posts get <id>` | 投稿の詳細とプラットフォームごとのステータスを取得 |
| `posts cancel <id>` | 予約投稿・下書きをキャンセル |

ステータス値: `posted`, `scheduled`, `processing`, `failed`, `draft`

下書きだけを見るには `posts list --status draft`。不要になった下書きは `posts cancel <id>` で取り消せる。

**`posts create`には必ず`--data`フラグでJSONを渡すこと。** stdinパイプ（`cat | node ... posts create`）は動作しない。

キャプションが長い・改行を含む場合、シェルのクォートでJSONが壊れやすい。安全な方法:

1. Writeツールで `/tmp/post-data.json` にJSONを書き出す
2. `--data` にファイルの中身を渡す:

```bash
./scripts/post-mesh.js posts create --data "$(cat /tmp/post-data.json)"
```

`allowed-tools` の制約上、`cat > /tmp/...` 等のBashコマンドでファイルを作成できない。必ずWriteツールを使うこと。

## 投稿の作成

### posts create の直前条件（承認ゲート）

`posts create` を実行してよいのは、**直前のユーザーメッセージが、あなたが提示した最終プランへの明示的な承認であるとき**だけ。最終プランとは「投稿内容（キャプション・タイトル・メディア）+ 投稿先アカウント名 + スケジュール」を**1つのメッセージにまとめた提示**のこと。

次のものは承認では**ない**（これらの直後に `posts create` を実行してはいけない）:

- プラットフォーム名だけの指示（「TikTokとYouTubeに投稿して」）— アカウント名の承認がまだ
- 別の質問への回答（「2で」「それで」「うん」）— 答えたのはその質問だけ
- 過去のターンでの内容合意（キャプションを一緒に作った等）— 投稿先とセットの最終承認がまだ

会話が長く続いていても、投稿の直前に必ず一度、最終プランを1メッセージで提示して返答を待つ。確認は理想的にはこの1回で済ませる（アカウント選択・スケジュール・内容確認を小分けに何度も聞かない）。

**唯一の例外**: ユーザーが投稿内容と投稿先**アカウント名**（プラットフォーム名ではなく）の両方を特定した上で「今すぐ投稿して」「確認不要」と明示した場合は、最終プラン提示を省略してよい。その場合でも `connections` で指定アカウントが実在することを照合してから投稿する（一覧に無い名前なら投稿せず報告する）。

### 投稿データ形式

```json
{
  "category": "text",
  "targets": [
    {
      "connection_id": "conn_abc",
      "caption": "プラットフォーム別のキャプション",
      "youtube_title": "YouTube専用のタイトル"
    }
  ],
  "scheduled_at": "2026-04-01T10:00:00Z",
  "draft": false,
  "media_id": "動画投稿のみ",
  "media_ids": ["画像投稿のみ"],
  "thumbnail_time": 5.5
}
```

### フィールド

| フィールド | 必須 | 備考 |
|------------|------|------|
| `category` | 常に | `text`, `image`, `video` のいずれか |
| `targets` | 常に | 1つ以上のターゲット |
| `targets[].connection_id` | 常に | `connections` コマンドで取得 |
| `targets[].caption` | 下書き以外では常に | プラットフォームごとのキャプション。1文字以上（空文字はAPIが400で拒否）。`draft: true` のときだけ省略できる。公開する投稿でユーザーがキャプションを「後で」と保留しているときは、空文字や仮テキストで勝手に埋めず、確定してから投稿を作成する（保留のまま形にしたいなら下書きにする） |
| `targets[].youtube_title` | 下書き以外のYouTube | YouTubeの場合は必須。`draft: true` のときだけ省略できる |
| `targets[].is_ai_generated` | いいえ | TikTokのみ有効。`true`でTikTok上に「AI generated」ラベルを表示 |
| `targets[].tiktok_draft` | いいえ | TikTokのみ有効（動画・画像）。`true`で公開せずTikTokアプリの受信箱へ下書きを送る。TikTok以外のターゲットでは無視される |
| `targets[].tiktok_auto_add_music` | いいえ | TikTokへの画像投稿のみ有効。`true`でTikTokのおすすめ音楽を自動で付ける |
| `targets[].tiktok_privacy_level` | いいえ | TikTokのみ有効。この投稿を見せる相手。省略すると全員に公開。選べる値はアカウントによって変わる（「TikTokの公開範囲」の節を参照）。`tiktok_draft` との同時指定は400 |
| `targets[].tiktok_allow_comment` | いいえ | TikTokのみ有効。`false`でコメントを禁止。省略すると許可 |
| `targets[].tiktok_allow_duet` | いいえ | TikTokへの動画投稿のみ有効。`false`でデュエットを禁止。省略すると許可 |
| `targets[].tiktok_allow_stitch` | いいえ | TikTokへの動画投稿のみ有効。`false`でステッチを禁止。省略すると許可 |
| `scheduled_at` | いいえ | ISO 8601形式の未来の日時。省略で即時投稿 |
| `draft` | いいえ | `true` でSNSへ配信せず下書きとして保存。`scheduled_at` との併用は400（`draft cannot be used with scheduled_at`） |
| `media_id` | `video` のみ | `media upload` で取得 |
| `media_ids` | `image` のみ | `media upload` で取得したIDの配列。1件以上。上限は投稿先のうち最も厳しいプラットフォームの枚数上限（X 4枚、Instagram・Facebook 10枚、Threads 20枚、TikTok 35枚） |
| `thumbnail_time` | いいえ | サムネイル位置（秒）。動画のみ |

### テキスト投稿

```bash
# 1. Xの連携アカウントを確認
./scripts/post-mesh.js connections --platform x

# 2. 投稿
./scripts/post-mesh.js posts create --data '{
  "category": "text",
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
  "media_id": "media_abc",
  "thumbnail_time": 3.0,
  "targets": [
    {"connection_id": "conn_yt", "caption": "ぜひ見てください！ #youtube", "youtube_title": "動画タイトル"},
    {"connection_id": "conn_tt", "caption": "ぜひ見てください！ #tiktok"},
    {"connection_id": "conn_x", "caption": "ぜひ見てください！"}
  ]
}'
```

### 下書きの作成

`draft` に `true` を指定すると、SNSへは配信せずpost mesh内に下書きとして保存されます:

```bash
./scripts/post-mesh.js posts create --data '{
  "category": "text",
  "draft": true,
  "targets": [{"connection_id": "conn_x", "caption": "あとで見直す下書きです"}]
}'
```

- レスポンスの `data.status` は `draft` になる。SNSには何も投稿されない
- `scheduled_at` との併用は400エラー（`draft cannot be used with scheduled_at`）
- 下書きでは `targets[].caption` と `targets[].youtube_title` を省略できる（内容が固まっていなくてもよい）。公開する投稿では必須
- 一覧は `posts list --status draft`、取り消しは `posts cancel <id>`
- **下書きから公開（即時・予約）への昇格はWebアプリの編集画面でのみ可能。** APIからは昇格できないので、下書きを作ったらその旨をユーザーに伝える

### TikTokへの下書き送信

`targets[].tiktok_draft` に `true` を指定すると、公開せずTikTokアプリの受信箱へ下書きとして送れます。動画・画像のどちらでも使えます:

```bash
./scripts/post-mesh.js posts create --data '{
  "category": "video",
  "media_id": "media_abc",
  "targets": [{"connection_id": "conn_tt", "caption": "下書きを送ります", "tiktok_draft": true}]
}'
```

- post mesh内の下書き（`draft: true`）とは別機能。送り先はTikTokアプリで、post meshには下書きが残らない
- 動画の下書きにはキャプションが送られない（TikTokアプリ側で入力する）
- 保留中の下書きは24時間あたり5件まで
- `tiktok_auto_add_music: true` との同時指定は400エラー（`tiktok_auto_add_music cannot be used with tiktok_draft`）
- `tiktok_privacy_level` との同時指定も400エラー。下書きの公開範囲はユーザーがTikTokアプリで決める

### TikTokの公開範囲

`targets[].tiktok_privacy_level` でこの投稿を見せる相手を指定します。指定できる値は4つです。

| 値 | 意味 |
|----|------|
| `PUBLIC_TO_EVERYONE` | 全員 |
| `FOLLOWER_OF_CREATOR` | フォロワー |
| `MUTUAL_FOLLOW_FRIENDS` | 相互フォロー中の友達 |
| `SELF_ONLY` | 自分のみ |

ただし1つのアカウントが実際に選べるのは常に3つで、アカウントの公開設定によって入れ替わります。

- 公開アカウント: `PUBLIC_TO_EVERYONE` / `MUTUAL_FOLLOW_FRIENDS` / `SELF_ONLY`
- 非公開アカウント: `FOLLOWER_OF_CREATOR` / `MUTUAL_FOLLOW_FRIENDS` / `SELF_ONLY`

つまり非公開アカウントは全員への公開ができません。

```bash
./scripts/post-mesh.js posts create --data '{
  "category": "video",
  "media_id": "media_abc",
  "targets": [{"connection_id": "conn_tt", "caption": "フォロワー限定です", "tiktok_privacy_level": "FOLLOWER_OF_CREATOR"}]
}'
```

**選べない値を指定した場合**、投稿は作成されず400エラーになります。エラーコードは `TIKTOK_PRIVACY_LEVEL_UNAVAILABLE` で、メッセージにそのアカウントで選べる値が含まれます。

```
このTikTokアカウントでは公開範囲に「全員」を選べません。「フォロワー」「相互フォロー中の友達」「自分のみ」から選んでください。
```

投稿は1件も作られていないので、選び直して同じリクエストを送り直せます。

**ユーザーへの確認**

- 省略すると全員に公開されます。ユーザーが公開範囲を指示していない場合、通常はそのまま省略して構いません
- ただし上記のエラーが返ってきたときは、勝手に値を選ばずユーザーに確認してください。「フォロワー限定と自分のみが選べますが、どちらにしますか」のように、選べる値を示して聞きます
- 「限定公開で」「こっそり出したい」のような曖昧な指示があった場合も、どの範囲かを確認してから指定します

### TikTokのコメント・デュエット・ステッチ

`targets[].tiktok_allow_comment` / `tiktok_allow_duet` / `tiktok_allow_stitch` に `false` を指定すると、その操作を禁止できます。省略するとすべて許可です。

- デュエットとステッチは動画投稿のみ。画像投稿で指定すると400エラー
- TikTokアカウント側でこれらが無効になっている場合、`true` を指定しても無効のまま投稿されます。エラーにはなりません

### TikTokへの画像投稿とおすすめ音楽

`targets[].tiktok_auto_add_music` に `true` を指定すると、画像をそのまま公開するときにTikTokのおすすめ音楽が自動で付きます:

```bash
./scripts/post-mesh.js posts create --data '{
  "category": "image",
  "media_ids": ["media_abc", "media_def"],
  "targets": [{"connection_id": "conn_tt", "caption": "写真です #tiktok", "tiktok_auto_add_music": true}]
}'
```

- `image` 以外のカテゴリで指定すると400エラー
- 下書き（`tiktok_draft: true`）には音楽を付けられない

### マルチプラットフォーム投稿

ターゲットを追加するだけで複数プラットフォームに同時投稿できます。各ターゲットに個別のキャプションを設定可能:

```bash
./scripts/post-mesh.js posts create --data '{
  "category": "text",
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
  "targets": [{"connection_id": "conn_x", "caption": "おはようございます！"}],
  "scheduled_at": "2026-04-01T09:00:00Z"
}'
```

## 投稿ステータスの確認

即時投稿の場合、ステータスは最初 `processing` になります。完了するまで確認してください:

```bash
./scripts/post-mesh.js posts get <post-id>
```

- `data.platforms[].status` が `posted` または `failed` になったら完了
- まだ `processing` なら `posts get` を再実行する（ツール呼び出し間の自然な間隔で十分。`sleep`は使わない）
- テキスト・画像は最大30秒、動画は最大60秒で完了する
- 成功時は `data.platforms[].external_url` にライブURLが入る — ユーザーに表示する
- 失敗時は `data.platforms[].error_message` にエラー内容が入る

予約投稿の場合、ステータスは即座に `scheduled` になるためポーリング不要。

## 予約投稿・下書きのキャンセル

`can_cancel: true` の投稿のみキャンセル可能（予約中の投稿と下書きが対象）:

```bash
./scripts/post-mesh.js posts cancel <post-id>
```

## 推奨ワークフロー

APIを呼び出す前に、まずユーザーと会話してください。何を投稿したいのか、どこに投稿するのかを理解してからAPIを使います。

1. **意図を確認** — ユーザーに何を投稿したいか（テキスト/画像/動画）、どのプラットフォームに投稿するか、即時か予約か下書きかを聞く
2. **連携アカウントを確認し、ユーザーに選んでもらう** — `connections` で利用可能なアカウントを取得。ユーザーが選んだカテゴリに対応するプラットフォームのみ表示:
   - **テキスト**: X, Threads, Facebook
   - **画像**: Instagram, TikTok, X, Threads, Facebook
   - **動画**: YouTube, TikTok, Instagram, X, Threads

   プラットフォームごとにグループ化して表示:
   ```
   X: @_hid3, @post_mesh
   Threads: @_hid3
   Facebook: My Page
   ```
   選択したカテゴリに対応しないプラットフォームは表示しない（例: 画像投稿にYouTubeを表示しない）。

   **ここで必ずユーザーにどのアカウントに投稿するか聞くこと。** 連携アカウントが1つしかなくても省略せず確認する。アカウントが1つの場合は「〇〇に投稿しますか？」と確認するだけでよい。ユーザーの明示的な回答を得るまで先に進まない。
3. **コンテンツを準備** — ユーザーとキャプションを作成。プラットフォームの文字数制限を考慮する。画像/動画の場合はファイルパスを確認
4. **ユーザーに確認** — 最終プラン（コンテンツ、投稿先アカウントとプラットフォーム、スケジュール）を1つのメッセージにまとめて表示し、明示的な承認を得る（詳細は「posts create の直前条件（承認ゲート）」）。ステップ2のアカウント選択とこの最終確認は、可能なら1回の確認に統合してよい
5. **メディアをアップロード**（必要な場合） — `media upload <file>` で `media_id` を取得
6. **投稿を作成** — `posts create --data '...'`
7. **結果を確認** — `posts get <id>` で成功を確認しライブURLを取得

## 重要なルール

- **投稿前に必ず承認ゲートを通す。** 「posts create の直前条件（承認ゲート）」の節に従う。即時投稿は公開後に取り消せない。
- **投稿先アカウントを必ずユーザーに確認する。** 連携アカウントが1つしかなくても勝手に選ばない。「Threads @hide_carryに投稿しますか？」のように最終プランの中で確認し、ユーザーの回答を待つ。ユーザーが指定した名前が `connections` の一覧に無いときは、似た名前を推測で選ばず、実在する一覧を提示して確認する。
- **キャプションを統一する。** ユーザーがプラットフォーム別のテキストを望まない限り、すべての `targets[].caption` に同じテキストを使う。キャプションは `targets[].caption` だけで指定する（ボディ直下の `caption` はAPIが読まない）。
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
