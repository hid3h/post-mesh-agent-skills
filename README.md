# post mesh — Agent Skills

AIエージェントから YouTube、TikTok、Instagram、X、Threads、Facebook に投稿できる [post mesh](https://post-mesh.com) のスキルです。

## インストール

```bash
npx skills add post-mesh-hq/agent-skills
```

手動でインストールする場合:

```bash
git clone https://github.com/post-mesh-hq/agent-skills.git
ln -s "$(pwd)/agent-skills/skills/post-mesh" ~/.claude/skills/post-mesh
```

## セットアップ

1. [post-mesh.com](https://post-mesh.com) でアカウントを作成
2. SNSアカウントを連携（設定 > 連携）
3. APIキーを発行（設定 > APIキー）
4. Claude Code で以下を実行:

```
/post-mesh setup --key YOUR_API_KEY
```

## できること

- **テキスト投稿** — X、Threads、Facebook
- **画像投稿** — X、Threads、Facebook
- **動画投稿** — YouTube、TikTok、Instagram、Threads
- **予約投稿** — 全プラットフォーム対応
- **マルチプラットフォーム同時投稿** — 1回の指示で複数のSNSに投稿

## 使い方

```
> XとThreadsに「AIエージェントから投稿しています！」と投稿して
```

これだけです。スキルがアカウントの確認、投稿の作成、ステータスの確認まですべて行います。

## 対応プラットフォーム

| プラットフォーム | テキスト | 画像 | 動画 |
|------------------|----------|------|------|
| YouTube          |          |      | o    |
| TikTok           |          |      | o    |
| Instagram        |          |      | o    |
| X                | o        | o    |      |
| Threads          | o        | o    | o    |
| Facebook         | o        | o    |      |

## 必要なもの

- Node.js 18以上
- [Claude Code](https://claude.ai/claude-code)

## リンク

- [post mesh](https://post-mesh.com)
- [APIドキュメント](https://post-mesh.com/api/openapi)
