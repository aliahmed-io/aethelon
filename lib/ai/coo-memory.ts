"use server";

import { promises as fs } from "fs";
import path from "path";

// ============================================================
// AI COO MEMORY SYSTEM
// Persistent summary + 2-day rolling conversation history
// ============================================================

const DATA_DIR = path.join(process.cwd(), "data", "ai-coo");
const SUMMARY_FILE = path.join(DATA_DIR, "coo_summary.json");
const HISTORY_FILE = path.join(DATA_DIR, "coo_history.json");

// ============================================================
// TYPES
// ============================================================

export interface COOSummary {
    lastUpdated: string;
    keyFacts: string[];
    preferences: {
        focusAreas: string[];
        alertThresholds: {
            lowStockThreshold: number;
            inactiveCustomerDays: number;
        };
    };
    sessionCount: number;
}

export interface ConversationMessage {
    role: "user" | "assistant";
    content: string;
    timestamp: string;
}

export interface ConversationDay {
    date: string;
    messages: ConversationMessage[];
}

export interface COOHistory {
    conversations: ConversationDay[];
}

// ============================================================
// DEFAULT VALUES
// ============================================================

const DEFAULT_SUMMARY: COOSummary = {
    lastUpdated: new Date().toISOString(),
    keyFacts: [],
    preferences: {
        focusAreas: ["inventory", "revenue", "customers"],
        alertThresholds: {
            lowStockThreshold: 5,
            inactiveCustomerDays: 30,
        },
    },
    sessionCount: 0,
};

const DEFAULT_HISTORY: COOHistory = {
    conversations: [],
};

// ============================================================
// FILE OPERATIONS
// ============================================================

async function ensureDataDir(): Promise<void> {
    try {
        await fs.mkdir(DATA_DIR, { recursive: true });
    } catch {
        // Directory exists
    }
}

async function readJSON<T>(filePath: string, defaultValue: T): Promise<T> {
    try {
        const content = await fs.readFile(filePath, "utf-8");
        return JSON.parse(content) as T;
    } catch {
        return defaultValue;
    }
}

async function writeJSON<T>(filePath: string, data: T): Promise<void> {
    await ensureDataDir();
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), "utf-8");
}

// ============================================================
// MEMORY FUNCTIONS
// ============================================================

/**
 * Load the persistent COO summary
 */
export async function loadSummary(): Promise<COOSummary> {
    return readJSON(SUMMARY_FILE, DEFAULT_SUMMARY);
}

/**
 * Save the COO summary (called at end of session)
 */
export async function saveSummary(summary: COOSummary): Promise<void> {
    summary.lastUpdated = new Date().toISOString();
    await writeJSON(SUMMARY_FILE, summary);
}

/**
 * Add a key fact to the summary
 */
export async function addKeyFact(fact: string): Promise<void> {
    const summary = await loadSummary();

    // Avoid duplicates
    if (!summary.keyFacts.includes(fact)) {
        summary.keyFacts.push(fact);

        // Keep max 20 facts
        if (summary.keyFacts.length > 20) {
            summary.keyFacts = summary.keyFacts.slice(-20);
        }

        await saveSummary(summary);
    }
}

/**
 * Load conversation history (auto-prunes old entries)
 */
export async function loadHistory(): Promise<COOHistory> {
    const history = await readJSON(HISTORY_FILE, DEFAULT_HISTORY);

    // Prune entries older than 2 days
    const twoDaysAgo = new Date();
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
    const cutoffDate = twoDaysAgo.toISOString().split("T")[0];

    history.conversations = history.conversations.filter(
        (conv) => conv.date >= cutoffDate
    );

    return history;
}

/**
 * Save conversation history
 */
export async function saveHistory(history: COOHistory): Promise<void> {
    await writeJSON(HISTORY_FILE, history);
}

/**
 * Add a message to today's conversation
 */
export async function addMessage(
    role: "user" | "assistant",
    content: string
): Promise<void> {
    const history = await loadHistory();
    const today = new Date().toISOString().split("T")[0];

    let todayConv = history.conversations.find((c) => c.date === today);

    if (!todayConv) {
        todayConv = { date: today, messages: [] };
        history.conversations.push(todayConv);
    }

    todayConv.messages.push({
        role,
        content,
        timestamp: new Date().toISOString(),
    });

    // Limit to 50 messages per day to avoid bloat
    if (todayConv.messages.length > 50) {
        todayConv.messages = todayConv.messages.slice(-50);
    }

    await saveHistory(history);
}

/**
 * Get formatted memory context for AI prompt
 */
export async function getMemoryContext(): Promise<string> {
    const [summary, history] = await Promise.all([loadSummary(), loadHistory()]);

    let context = "## PERSISTENT MEMORY\n";

    // Key facts
    if (summary.keyFacts.length > 0) {
        context += "### Key Business Facts:\n";
        summary.keyFacts.forEach((fact) => {
            context += `- ${fact}\n`;
        });
    }

    // Preferences
    context += `\n### Focus Areas: ${summary.preferences.focusAreas.join(", ")}\n`;
    context += `### Alert Thresholds: Low stock < ${summary.preferences.alertThresholds.lowStockThreshold}, Inactive > ${summary.preferences.alertThresholds.inactiveCustomerDays} days\n`;

    // Recent conversations
    if (history.conversations.length > 0) {
        context += "\n## RECENT CONVERSATION HISTORY\n";

        for (const conv of history.conversations) {
            context += `\n### ${conv.date}\n`;

            // Only include last 10 messages per day for context
            const recentMessages = conv.messages.slice(-10);
            for (const msg of recentMessages) {
                const roleLabel = msg.role === "user" ? "User" : "COO";
                context += `${roleLabel}: ${msg.content.slice(0, 200)}${msg.content.length > 200 ? "..." : ""}\n`;
            }
        }
    }

    return context;
}

/**
 * Start a new session (increment counter)
 */
export async function startSession(): Promise<COOSummary> {
    const summary = await loadSummary();
    summary.sessionCount += 1;
    await saveSummary(summary);
    return summary;
}

/**
 * Clear all memory (for reset)
 */
export async function clearMemory(): Promise<void> {
    await writeJSON(SUMMARY_FILE, DEFAULT_SUMMARY);
    await writeJSON(HISTORY_FILE, DEFAULT_HISTORY);
}
