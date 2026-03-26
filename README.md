# opencodex-fast

An OpenCode plugin that adds `"service_tier": "priority"` to Codex requests when `/fast` is enabled globally.

## What it does

- Adds a `/fast` command to OpenCode
- When enabled, injects `service_tier: "priority"` into requests sent to `https://chatgpt.com/backend-api/codex/responses`
- Leaves all non-Codex requests untouched
- Persists a single global `enabled` flag in `~/.config/opencode/opencodex-fast.jsonc`

## Commands

```text
/fast           Toggle fast mode globally
/fast on        Enable fast mode
/fast off       Disable fast mode
/fast status    Show current global fast-mode state
```

## Installation

```bash
cd ~/.config/opencode/plugin/opencodex-fast
npm install
npm run build
```

Then add it to `~/.config/opencode/opencode.jsonc`:

```json
{
  "plugin": ["./plugin/opencodex-fast"]
}
```
