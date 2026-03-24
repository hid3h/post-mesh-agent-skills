#!/usr/bin/env node

// post-mesh.js — Zero-dependency CLI for the post mesh API
// Requires Node.js 18+ (uses built-in fetch)

const fs = require("fs");
const path = require("path");

const BASE_URL = "https://post-mesh.com/api/v1";
const CONFIG_DIR_NAME = ".post-mesh";
const CONFIG_FILE_NAME = "config.json";
const ENV_VAR = "POST_MESH_API_KEY";

// ─── Config ──────────────────────────────────────────────────────────────────

function getGlobalConfigPath() {
  const home = process.env.HOME || process.env.USERPROFILE || "~";
  return path.join(home, ".config", "post-mesh", CONFIG_FILE_NAME);
}

function getLocalConfigPath() {
  return path.join(process.cwd(), CONFIG_DIR_NAME, CONFIG_FILE_NAME);
}

function loadConfig() {
  // Priority: env var > local config > global config
  const envKey = process.env[ENV_VAR];
  if (envKey) return { apiKey: envKey, source: "environment variable" };

  for (const [label, configPath] of [
    ["local", getLocalConfigPath()],
    ["global", getGlobalConfigPath()],
  ]) {
    if (fs.existsSync(configPath)) {
      try {
        const config = JSON.parse(fs.readFileSync(configPath, "utf-8"));
        if (config.apiKey)
          return { apiKey: config.apiKey, source: `${label} config (${configPath})` };
      } catch {}
    }
  }

  return null;
}

function requireApiKey() {
  const config = loadConfig();
  if (!config) {
    out({
      error: "API key not found",
      message:
        "Run 'setup --key <YOUR_API_KEY>' first, or set POST_MESH_API_KEY environment variable",
      help: "Get your API key from https://post-mesh.com — go to Settings > API Keys",
    });
    process.exit(1);
  }
  return config.apiKey;
}

// ─── HTTP ────────────────────────────────────────────────────────────────────

async function request(method, endpoint, apiKey, body = null) {
  const url = `${BASE_URL}${endpoint}`;
  const headers = {
    Authorization: `Bearer ${apiKey}`,
    "Content-Type": "application/json",
  };
  const options = { method, headers };
  if (body) options.body = JSON.stringify(body);

  const response = await fetch(url, options);
  const text = await response.text();

  let data;
  try {
    data = JSON.parse(text);
  } catch {
    data = { raw: text };
  }

  if (!response.ok) {
    return { ok: false, status: response.status, ...data };
  }
  return { ok: true, status: response.status, ...data };
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function out(obj) {
  console.log(JSON.stringify(obj, null, 2));
}

function parseFlag(args, flag) {
  const idx = args.indexOf(flag);
  return idx !== -1 && args[idx + 1] ? args[idx + 1] : null;
}

function positionalArg(args) {
  return args.find((a) => !a.startsWith("--"));
}

const MIME_MAP = {
  ".mp4": "video/mp4",
  ".mov": "video/quicktime",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
};

// ─── Commands ────────────────────────────────────────────────────────────────

async function cmdSetup(args) {
  const apiKey = parseFlag(args, "--key");
  if (!apiKey) {
    out({
      error: "Missing --key argument",
      usage: "setup --key <YOUR_API_KEY> [--global]",
      help: "Get your API key from https://post-mesh.com — go to Settings > API Keys",
    });
    process.exit(1);
  }

  const scope = args.includes("--global") ? "global" : "local";
  const configPath = scope === "global" ? getGlobalConfigPath() : getLocalConfigPath();
  const configDir = path.dirname(configPath);
  if (!fs.existsSync(configDir)) fs.mkdirSync(configDir, { recursive: true });

  // Add to .gitignore for local config
  if (scope === "local") {
    const gitignorePath = path.join(process.cwd(), ".gitignore");
    if (fs.existsSync(gitignorePath)) {
      const content = fs.readFileSync(gitignorePath, "utf-8");
      if (!content.includes(CONFIG_DIR_NAME)) {
        fs.appendFileSync(gitignorePath, `\n${CONFIG_DIR_NAME}/\n`);
      }
    }
  }

  fs.writeFileSync(configPath, JSON.stringify({ apiKey }, null, 2));

  // Verify the key
  const result = await request("GET", "/account", apiKey);
  if (result.ok) {
    out({
      success: true,
      message: `API key saved to ${scope} config`,
      config_path: configPath,
      account: result.data,
    });
  } else {
    out({
      success: true,
      message: `API key saved to ${scope} config (verification failed — key may be invalid)`,
      config_path: configPath,
      verification_error: result,
    });
  }
}

async function cmdConfigShow() {
  const config = loadConfig();
  if (!config) {
    out({ configured: false, message: "No API key configured. Run 'setup' command first." });
    return;
  }
  const masked = config.apiKey.substring(0, 11) + "..." + config.apiKey.slice(-4);
  out({ configured: true, source: config.source, api_key: masked });
}

async function cmdAccount() {
  const apiKey = requireApiKey();
  const result = await request("GET", "/account", apiKey);
  out(result);
}

async function cmdConnections(args) {
  const apiKey = requireApiKey();
  const platform = parseFlag(args, "--platform");
  const params = new URLSearchParams();
  if (platform) params.set("platform", platform);
  const query = params.toString() ? `?${params}` : "";
  const result = await request("GET", `/connections${query}`, apiKey);
  out(result);
}

async function cmdMediaUpload(args) {
  const apiKey = requireApiKey();
  const filePath = positionalArg(args);
  if (!filePath) {
    out({ error: "File path required", usage: "media upload <file-path>" });
    process.exit(1);
  }

  const resolvedPath = path.resolve(filePath);
  if (!fs.existsSync(resolvedPath)) {
    out({ error: `File not found: ${resolvedPath}` });
    process.exit(1);
  }

  const stat = fs.statSync(resolvedPath);
  const fileName = path.basename(resolvedPath);
  const ext = path.extname(resolvedPath).toLowerCase();
  const mimeType = MIME_MAP[ext];

  if (!mimeType) {
    out({
      error: `Unsupported file type: ${ext}`,
      supported: Object.keys(MIME_MAP).join(", "),
    });
    process.exit(1);
  }

  // Step 1: Get signed upload URL
  const urlResult = await request("POST", "/media/upload-url", apiKey, {
    mime_type: mimeType,
    size_bytes: stat.size,
    name: fileName,
  });

  if (!urlResult.ok) {
    out(urlResult);
    process.exit(1);
  }

  const { media_id, upload_url } = urlResult.data;

  // Step 2: Upload file to signed URL
  const fileBuffer = fs.readFileSync(resolvedPath);
  const uploadResponse = await fetch(upload_url, {
    method: "PUT",
    headers: { "Content-Type": mimeType },
    body: fileBuffer,
  });

  if (!uploadResponse.ok) {
    out({
      error: "Upload to storage failed",
      status: uploadResponse.status,
      message: await uploadResponse.text(),
    });
    process.exit(1);
  }

  out({
    ok: true,
    media_id,
    file_name: fileName,
    mime_type: mimeType,
    size_bytes: stat.size,
    message: "Upload complete. Use this media_id when creating a post.",
  });
}

async function cmdPostsCreate(args) {
  const apiKey = requireApiKey();
  const dataStr = parseFlag(args, "--data");
  if (!dataStr) {
    out({
      error: "Post data required",
      usage: `posts create --data '{"category":"text","caption":"Hello","targets":[{"connection_id":"...","caption":"Hello"}]}'`,
    });
    process.exit(1);
  }

  let body;
  try {
    body = JSON.parse(dataStr);
  } catch (e) {
    out({ error: "Invalid JSON in --data", detail: e.message });
    process.exit(1);
  }

  const result = await request("POST", "/posts", apiKey, body);
  out(result);
}

async function cmdPostsList(args) {
  const apiKey = requireApiKey();
  const params = new URLSearchParams();
  for (const flag of ["--page", "--limit", "--status", "--platform"]) {
    const value = parseFlag(args, flag);
    if (value) params.set(flag.replace("--", ""), value);
  }
  const query = params.toString() ? `?${params}` : "";
  const result = await request("GET", `/posts${query}`, apiKey);
  out(result);
}

async function cmdPostsGet(args) {
  const apiKey = requireApiKey();
  const id = positionalArg(args);
  if (!id) {
    out({ error: "Post ID required", usage: "posts get <post-id>" });
    process.exit(1);
  }
  const result = await request("GET", `/posts/${id}`, apiKey);
  out(result);
}

async function cmdPostsCancel(args) {
  const apiKey = requireApiKey();
  const id = positionalArg(args);
  if (!id) {
    out({ error: "Post ID required", usage: "posts cancel <post-id>" });
    process.exit(1);
  }
  const result = await request("DELETE", `/posts/${id}`, apiKey);
  out(result);
}

// ─── Router ──────────────────────────────────────────────────────────────────

const COMMANDS = {
  setup: cmdSetup,
  "config show": cmdConfigShow,
  account: cmdAccount,
  connections: cmdConnections,
  "media upload": cmdMediaUpload,
  "posts create": cmdPostsCreate,
  "posts list": cmdPostsList,
  "posts get": cmdPostsGet,
  "posts cancel": cmdPostsCancel,
};

async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args[0] === "help" || args[0] === "--help") {
    out({
      name: "post-mesh",
      version: "1.0.0",
      description: "CLI for post mesh — multi-platform social media posting",
      platforms: ["youtube", "tiktok", "instagram", "threads", "x", "facebook"],
      commands: Object.keys(COMMANDS),
      usage: "node post-mesh.js <command> [subcommand] [options]",
      docs: "https://post-mesh.com/api/openapi",
    });
    return;
  }

  // Match two-word commands first (e.g., "connections get"), then single-word
  let command, commandArgs;
  const twoWord = `${args[0]} ${args[1] || ""}`.trim();
  if (args.length >= 2 && COMMANDS[twoWord]) {
    command = twoWord;
    commandArgs = args.slice(2);
  } else if (COMMANDS[args[0]]) {
    command = args[0];
    commandArgs = args.slice(1);
  } else {
    out({ error: `Unknown command: ${args[0]}`, available: Object.keys(COMMANDS) });
    process.exit(1);
  }

  await COMMANDS[command](commandArgs);
}

main().catch((err) => {
  out({ error: err.message });
  process.exit(1);
});
