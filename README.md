# opencodex-fast

An OpenCode plugin that adds `"service_tier": "priority"` to Codex requests when `/fast` is enabled globally.

## What it does

- Adds a `/fast` command to OpenCode
- When enabled, injects `service_tier: "priority"` into requests sent to `https://chatgpt.com/backend-api/codex/responses`
- Mirrors Codex Fast mode, which is documented as 1.5x faster at 2x credit cost
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

Add to your OpenCode config:

```jsonc
// opencode.jsonc
{
  "plugin": ["opencodex-fast@latest"],
}
```
