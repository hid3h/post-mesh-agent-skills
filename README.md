# post mesh — Agent Skills

AIエージェントから YouTube、TikTok、Instagram、X、Threads、Facebook に投稿できる [post mesh](https://post-mesh.com) のスキルです。Claude Code はあくまで一例で、Codex・openclaw・Hermes Agent など、シェルコマンドを実行できるAIエージェントなら同様に使えます。

## インストール

このスキルは手順書（`SKILL.md`）とゼロ依存のNode CLI（`scripts/post-mesh.js`）でできています。スキル形式に対応したエージェントは手順書ごと読み込め、未対応でも CLI を直接呼び出せます。

多くのAIエージェントに対応した `skills` CLI（agentskills.io 標準）でインストールします。インストール済みのエージェントを検出し、それぞれのディレクトリ（`.claude/skills/` など）へ自動で入れてくれます:

```bash
npx skills add hid3h/post-mesh-agent-skills
```

特定のエージェントにだけ入れたいときは `-a` で指定します（例: `npx skills add hid3h/post-mesh-agent-skills -a claude-code`）。

### 手動インストール

リポジトリを取得し、エージェントに手順書とCLIを参照させます（例: `skills/post-mesh/SKILL.md` を読ませ、`skills/post-mesh/scripts/post-mesh.js` を実行させる）:

```bash
git clone https://github.com/hid3h/post-mesh-agent-skills.git
```

スキル形式のディレクトリ（`.claude/skills/` など）へ手動で入れるならシンボリックリンクを張ります:

```bash
ln -s "$(pwd)/post-mesh-agent-skills/skills/post-mesh" ~/.claude/skills/post-mesh
```

## セットアップ

1. [post-mesh.com](https://post-mesh.com) でアカウントを作成
2. SNSアカウントを連携（設定 > 連携）
3. APIキーを発行（設定 > APIキー）
4. APIキーを設定します。使っているエージェント（Claude Code、Codex、openclaw、Hermes Agent など）に「post mesh のAPIキーを設定して: YOUR_API_KEY」と頼むか、CLI を直接実行します:

```bash
./scripts/post-mesh.js setup --key YOUR_API_KEY --global
```

キーは `~/.config/post-mesh/config.json` に保存されます。無効なキーの場合はエラーを返すので、設定 > APIキー で正しいキーを確認してください。

## できること

- **テキスト投稿** — X、Threads、Facebook
- **画像投稿** — Instagram、TikTok、X、Threads、Facebook
- **動画投稿** — YouTube、TikTok、Instagram、Threads
- **予約投稿** — 全プラットフォーム対応
- **マルチプラットフォーム同時投稿** — 1回の指示で複数のSNSに投稿

## 使い方

使っているAIエージェント（Claude Code、Codex、openclaw、Hermes Agent など）に、ふだんの言葉で頼むだけです:

```
> XとThreadsに「AIエージェントから投稿しています！」と投稿して
```

これだけです。スキルがアカウントの確認、投稿の作成、ステータスの確認まですべて行います。

## 対応プラットフォーム

| プラットフォーム | テキスト | 画像 | 動画 |
|------------------|----------|------|------|
| YouTube          |          |      | o    |
| TikTok           |          | o    | o    |
| Instagram        |          | o    | o    |
| X                | o        | o    |      |
| Threads          | o        | o    | o    |
| Facebook         | o        | o    |      |

## 必要なもの

- Node.js 18以上
- シェルコマンドを実行できるAIエージェント（[Claude Code](https://claude.ai/claude-code)、Codex、openclaw、Hermes Agent など）。スキル形式に未対応のエージェントでも `scripts/post-mesh.js` を直接呼び出せます。

## リンク

- [post mesh](https://post-mesh.com)
- [APIドキュメント](https://post-mesh.com/api/openapi)
