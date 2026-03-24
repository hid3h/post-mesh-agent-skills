---
name: post-mesh
description: >
  Create, schedule, and manage social media posts across YouTube, TikTok, Instagram, X (Twitter),
  Threads, and Facebook via post mesh. ALWAYS use this skill when asked to post, schedule, publish,
  or manage social media content for any of these platforms. Also use when the user mentions
  "post mesh", cross-posting, multi-platform posting, simultaneous posting, or wants to manage
  SNS content from their terminal or AI agent. Covers text posts, image posts, video posts,
  media uploads, scheduled posts, and post status tracking.
last-updated: 2026-03-18
allowed-tools: Bash(./scripts/post-mesh.js:*)
---

# post mesh — Multi-Platform Social Media Posting

post mesh lets you create, schedule, and manage posts across multiple social platforms from a single API. One post, many platforms.

| Platform  | Text | Image | Video |
|-----------|------|-------|-------|
| YouTube   |      |       | o     |
| TikTok    |      |       | o     |
| Instagram |      |       | o     |
| X         | o    | o     |       |
| Threads   | o    | o     | o     |
| Facebook  | o    | o     |       |

## Keeping This Skill Updated

Check `last-updated` above. If more than 30 days old, suggest updating:

```bash
npx skills check
npx skills update
```

## Setup

You need a post mesh API key before using any commands.

1. Sign up at [post-mesh.com](https://post-mesh.com)
2. Connect your SNS accounts in the dashboard (Settings > Connections)
3. Generate an API key from Settings > API Keys
4. Run setup:

```bash
node ./scripts/post-mesh.js setup --key YOUR_API_KEY --global
```

Use `--global` to save to `~/.config/post-mesh/config.json` (recommended). Without it, the key saves to `.post-mesh/config.json` in the current directory.

You can also set the `POST_MESH_API_KEY` environment variable instead.

**If no API key is found**, do not search for it or guess. Tell the user to run the setup command with their key and wait.

### Config Priority

1. `POST_MESH_API_KEY` environment variable
2. Local project config (`.post-mesh/config.json`)
3. Global config (`~/.config/post-mesh/config.json`)

### Verify Setup

```bash
node ./scripts/post-mesh.js config show
node ./scripts/post-mesh.js account
```

## CLI Commands

All commands output JSON.

### Configuration

| Command | Description |
|---------|-------------|
| `setup --key <KEY> [--global]` | Save API key |
| `config show` | Show current config (key is masked) |
| `account` | Get account info (user ID and email) |

### Connections (SNS Accounts)

| Command | Description |
|---------|-------------|
| `connections [--platform <p>]` | List connected SNS accounts |

Platform values: `youtube`, `tiktok`, `instagram`, `threads`, `x`, `facebook`

### Media

| Command | Description |
|---------|-------------|
| `media upload <file-path>` | Upload a media file, returns `media_id` |

Supported files:
- **Video**: `.mp4`, `.mov` (max 500 MB)
- **Image**: `.jpg`, `.jpeg`, `.png`, `.webp`, `.gif` (max 20 MB)

The signed upload URL expires in 15 minutes.

### Posts

| Command | Description |
|---------|-------------|
| `posts create --data '<JSON>'` | Create a post (immediate or scheduled) |
| `posts list [--status <s>] [--platform <p>] [--page N] [--limit N]` | List posts |
| `posts get <id>` | Get post details and per-platform status |
| `posts cancel <id>` | Cancel a scheduled post |

Status values: `posted`, `scheduled`, `processing`, `failed`

## Creating Posts

### Post Data Format

```json
{
  "category": "text",
  "caption": "Your post text",
  "targets": [
    {
      "connection_id": "conn_abc",
      "caption": "Platform-specific caption",
      "youtube_title": "Required for YouTube only"
    }
  ],
  "scheduled_at": "2026-04-01T10:00:00Z",
  "media_id": "For video posts only",
  "media_ids": ["For image posts only"],
  "thumbnail_time": 5.5
}
```

### Fields

| Field | Required | Notes |
|-------|----------|-------|
| `category` | Always | `text`, `image`, or `video` |
| `caption` | Always | Default caption |
| `targets` | Always | At least one target |
| `targets[].connection_id` | Always | From `connections` command |
| `targets[].caption` | Always | Per-platform caption |
| `targets[].youtube_title` | YouTube | Required when target is YouTube |
| `scheduled_at` | No | ISO 8601 future datetime. Omit for immediate post |
| `media_id` | `video` only | From `media upload` |
| `media_ids` | `image` only | Array of IDs from `media upload` |
| `thumbnail_time` | No | Thumbnail position in seconds (video only) |

### Text Post

```bash
# 1. Find your X connection
node ./scripts/post-mesh.js connections --platform x

# 2. Post
node ./scripts/post-mesh.js posts create --data '{
  "category": "text",
  "caption": "Hello world!",
  "targets": [{"connection_id": "conn_abc", "caption": "Hello world!"}]
}'
```

### Image Post

```bash
# 1. Upload images
node ./scripts/post-mesh.js media upload ./photo1.jpg
node ./scripts/post-mesh.js media upload ./photo2.jpg

# 2. Post with media_ids
node ./scripts/post-mesh.js posts create --data '{
  "category": "image",
  "caption": "Beautiful photos",
  "media_ids": ["media_abc", "media_def"],
  "targets": [{"connection_id": "conn_x", "caption": "Beautiful photos #photography"}]
}'
```

### Video Post

```bash
# 1. Upload video
node ./scripts/post-mesh.js media upload ./video.mp4

# 2. Post with media_id (YouTube needs youtube_title)
node ./scripts/post-mesh.js posts create --data '{
  "category": "video",
  "caption": "New video!",
  "media_id": "media_abc",
  "thumbnail_time": 3.0,
  "targets": [
    {"connection_id": "conn_yt", "caption": "Check this out! #youtube", "youtube_title": "My Video"},
    {"connection_id": "conn_tt", "caption": "Check this out! #tiktok"}
  ]
}'
```

### Multi-Platform Post

Post to multiple platforms at once by adding targets. Each target can have its own caption:

```bash
node ./scripts/post-mesh.js posts create --data '{
  "category": "text",
  "caption": "Big announcement!",
  "targets": [
    {"connection_id": "conn_x", "caption": "Big announcement! #X"},
    {"connection_id": "conn_threads", "caption": "Big announcement!"},
    {"connection_id": "conn_fb", "caption": "Big announcement! Read more at..."}
  ]
}'
```

### Scheduled Post

Add `scheduled_at` with a future ISO 8601 datetime:

```bash
node ./scripts/post-mesh.js posts create --data '{
  "category": "text",
  "caption": "Good morning!",
  "targets": [{"connection_id": "conn_x", "caption": "Good morning!"}],
  "scheduled_at": "2026-04-01T09:00:00Z"
}'
```

## Checking Post Status

After an immediate post, status starts as `processing`. Poll until it changes:

```bash
node ./scripts/post-mesh.js posts get <post-id>
```

- Poll every 2 seconds, up to 30 seconds (60 seconds for video)
- Done when `platforms[].status` is `posted` or `failed`
- On success, `platforms[].external_url` has the live URL — show it to the user
- On failure, `platforms[].error_message` explains what went wrong

For scheduled posts, the status is immediately `scheduled` — no polling needed.

## Cancelling Scheduled Posts

Only posts with `can_cancel: true` can be cancelled:

```bash
node ./scripts/post-mesh.js posts cancel <post-id>
```

## Recommended Workflow

Always talk to the user first before making any API calls. Understand what they want to post and where before touching the API.

1. **Clarify intent** — ask the user what they want to post (text / image / video), to which platforms, and whether it's immediate or scheduled
2. **List connections** — `connections` to get all available accounts. Filter by the category the user chose and only show platforms that support it:
   - **text**: X, Threads, Facebook
   - **image**: X, Threads, Facebook
   - **video**: YouTube, TikTok, Instagram, X, Threads

   Present grouped by platform:
   ```
   X: @_hid3, @post_mesh
   Threads: @_hid3
   Facebook: My Page
   ```
   Do not show platforms that don't support the chosen category (e.g., don't show YouTube for image posts). Ask the user which account(s) to post to.
3. **Prepare content** — draft captions with the user, respecting platform character limits. For images/videos, confirm the file path
4. **Confirm with user** — show the final plan (content, target accounts with platform, schedule) and get explicit approval
5. **Upload media** (if needed) — `media upload <file>` to get a `media_id`
6. **Create post** — `posts create --data '...'`
7. **Verify result** — `posts get <id>` to confirm success and get live URLs

## Important Rules

- **Always confirm before posting.** Unless the user explicitly says "post now" or "publish immediately", show them the content and targets first. Immediate posts are irreversible once published.
- **Keep captions consistent.** Use the same text in `caption` and `targets[].caption` unless the user wants platform-specific text.
- **YouTube needs a title.** Always include `youtube_title` in targets for YouTube connections.
- **Convert timezones.** When the user says "tomorrow at 9am", convert to ISO 8601 in their timezone.
- **No duplicate content.** Don't post the same content twice to the same account.
- **Respect rate limits.** If you get a 429 response, back off before retrying.
- **Subscription required.** Media upload and post creation require an active subscription. If you get a 403 `SUBSCRIPTION_REQUIRED` error, tell the user they need an active subscription at post-mesh.com.

## Automation Guidelines

When used in automated workflows:
- No duplicate or near-duplicate content across runs
- No automated replies or engagement farming
- Always include human review before publishing
- Respect each platform's terms of service
