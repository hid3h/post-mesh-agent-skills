# post mesh — Agent Skills

AI agent skills for [post mesh](https://post-mesh.com), a multi-platform social media posting service.

Post to YouTube, TikTok, Instagram, X (Twitter), Threads, and Facebook from your AI agent.

## Install

```bash
npx skills add post-mesh-hq/agent-skills
```

Or manually clone and symlink:

```bash
git clone https://github.com/post-mesh-hq/agent-skills.git
ln -s "$(pwd)/agent-skills/skills/post-mesh" ~/.claude/skills/post-mesh
```

## Setup

1. Sign up at [post-mesh.com](https://post-mesh.com)
2. Connect your SNS accounts (Settings > Connections)
3. Generate an API key (Settings > API Keys)
4. In Claude Code, run:

```
/post-mesh setup --key YOUR_API_KEY
```

## What you can do

- **Text posts** to X, Threads, Facebook
- **Image posts** to X, Threads, Facebook
- **Video posts** to YouTube, TikTok, Instagram, Threads
- **Scheduled posts** to any platform
- **Multi-platform posts** — one command, multiple platforms

## Example

```
> Post "Hello from my AI agent!" to X and Threads
```

That's it. The skill handles connection lookup, content formatting, and posting.

## Supported platforms

| Platform  | Text | Image | Video |
|-----------|------|-------|-------|
| YouTube   |      |       | o     |
| TikTok    |      |       | o     |
| Instagram |      |       | o     |
| X         | o    | o     |       |
| Threads   | o    | o     | o     |
| Facebook  | o    | o     |       |

## Requirements

- Node.js 18+
- [Claude Code](https://claude.ai/claude-code) or any agent that supports skills

## Links

- [post mesh](https://post-mesh.com)
- [API Documentation](https://post-mesh.com/api/openapi)
