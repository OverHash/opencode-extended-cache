# opencode-extended-cache

An OpenCode plugin that sets `promptCacheRetention: "24h"` through `chat.params` when `/extended-prompt-cache` is enabled globally.

## What it does

- Adds a `/extended-prompt-cache` command to OpenCode
- When enabled, sets `promptCacheRetention: "24h"` in model params
- Applies only to supported OpenAI models:
  - `gpt-5.4`
  - `gpt-5.2`
  - `gp5-5.1-codex-max`
  - `gpt-5.1-codex-max`
  - `gpt-5.1`
  - `gpt-5.1-codex`
  - `gpt-5.1-codex-mini`
  - `gpt-5.1-chat-latest`
  - `gpt-5`
  - `gpt-5-codex`
  - `gpt-4.1`
- Leaves all non-Codex requests untouched
- Persists a single global `enabled` flag in `~/.config/opencode/opencode-extended-cache.jsonc`

## Commands

```text
/extended-prompt-cache           Toggle extended prompt cache globally
/extended-prompt-cache on        Enable extended prompt cache
/extended-prompt-cache off       Disable extended prompt cache
/extended-prompt-cache status    Show current extended prompt cache state
```

## Installation

This plugin is not published to npm.

Option A (recommended): download `index.ts` from GitHub with `gh`.

```bash
mkdir -p ~/.config/opencode/plugins
gh api "repos/OverHash/opencode-extended-cache/contents/index.ts?ref=main" --jq '.content' \
  | python3 -c 'import sys,base64;sys.stdout.write(base64.b64decode(sys.stdin.read()).decode())' \
  > ~/.config/opencode/plugins/opencode-extended-cache.ts
```

Restart OpenCode. No config change is required for this option.

Option B: clone the repo and load it by file path in `opencode.json`.

```jsonc
// ~/.config/opencode/opencode.json
{
  "plugin": ["file:///Users/you/path/to/opencode-extended-cache/index.ts"]
}
```

Option C: build and copy `dist/index.js` if you prefer compiled output.
