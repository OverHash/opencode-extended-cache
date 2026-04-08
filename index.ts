import {
    existsSync,
    mkdirSync,
    readFileSync,
    renameSync,
    writeFileSync,
} from "node:fs";
import { homedir } from "node:os";
import { dirname, join } from "node:path";
import type { Plugin } from "@opencode-ai/plugin";

const EXTENDED_ON_MESSAGE = "Extended prompt cache is now ON (24h for supported models).";
const EXTENDED_OFF_MESSAGE = "Extended prompt cache is now OFF.";
const EXTENDED_HANDLED_ERROR = "__EXTENDED_PROMPT_CACHE_HANDLED__";
const STATE_PATH = join(
    process.env.XDG_CONFIG_HOME || join(homedir(), ".config"),
    "opencode",
    "opencode-extended-cache.jsonc",
);
const SUPPORTED_MODELS = new Set([
    "gpt-5.4",
    "gpt-5.2",
    "gp5-5.1-codex-max",
    "gpt-5.1-codex-max",
    "gpt-5.1",
    "gpt-5.1-codex",
    "gpt-5.1-codex-mini",
    "gpt-5.1-chat-latest",
    "gpt-5",
    "gpt-5-codex",
    "gpt-4.1",
]);

let enabled = false;

function ensureStateDir(): void {
    mkdirSync(dirname(STATE_PATH), { recursive: true });
}

function getModel(input: unknown): string | undefined {
    if (!input || typeof input !== "object") return;
    const row = input as Record<string, unknown>;
    if (typeof row.modelID === "string") return row.modelID;
    if (typeof row.model === "string") return row.model;
    if (!row.api || typeof row.api !== "object") return;
    const api = row.api as Record<string, unknown>;
    if (typeof api.id === "string") return api.id;
}

function isModelSupported(input: unknown): boolean {
    const id = getModel(input);
    if (!id) return false;
    return SUPPORTED_MODELS.has(id);
}

function writeState(next: boolean): void {
    ensureStateDir();
    const tempPath = `${STATE_PATH}.tmp`;
    const content = `${JSON.stringify({ enabled: next }, null, 2)}\n`;
    writeFileSync(tempPath, content, "utf8");
    renameSync(tempPath, STATE_PATH);
}

function readState(): boolean {
    try {
        if (!existsSync(STATE_PATH)) {
            writeState(false);
            return false;
        }

        const raw = readFileSync(STATE_PATH, "utf8");
        const parsed = JSON.parse(raw) as { enabled?: unknown };
        return parsed.enabled === true;
    } catch {
        return false;
    }
}

async function sendIgnoredMessage(
    client: any,
    sessionID: string,
    text: string,
): Promise<void> {
    await client.session.prompt({
        path: { id: sessionID },
        body: {
            noReply: true,
            parts: [
                {
                    type: "text",
                    text,
                    ignored: true,
                },
            ],
        },
    });
}

function getMessage(modeArg?: string): string {
    const mode = modeArg?.toLowerCase();

    if (mode === "on") {
        enabled = true;
        writeState(true);
        return EXTENDED_ON_MESSAGE;
    }

    if (mode === "off") {
        enabled = false;
        writeState(false);
        return EXTENDED_OFF_MESSAGE;
    }

    if (mode === "status") {
        return enabled ? EXTENDED_ON_MESSAGE : EXTENDED_OFF_MESSAGE;
    }

    if (enabled) {
        enabled = false;
        writeState(false);
        return EXTENDED_OFF_MESSAGE;
    }

    enabled = true;
    writeState(true);
    return EXTENDED_ON_MESSAGE;
}

const plugin: Plugin = async (ctx) => {
    enabled = readState();

    return {
        config: async (opencodeConfig) => {
            opencodeConfig.command ??= {};
            opencodeConfig.command["extended-prompt-cache"] = {
                template: "[on|off|status]",
                description: "Toggle promptCacheRetention=24h for supported OpenAI models",
            };
        },
        "chat.params": async (input, output) => {
            if (!enabled) return;
            if (input.model.providerID !== "openai") return;
            if (!isModelSupported(input.model)) return;
            output.options.promptCacheRetention = "24h";
        },
        "command.execute.before": async (
            input: { command: string; sessionID: string; arguments: string },
            _output: { parts: any[] },
        ) => {
            if (input.command !== "extended-prompt-cache") {
                return;
            }

            const message = getMessage(input.arguments.trim() || undefined);
            await sendIgnoredMessage(ctx.client, input.sessionID, message);
            throw new Error(EXTENDED_HANDLED_ERROR);
        },
    };
};

export default plugin;
