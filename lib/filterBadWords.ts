export const badWords = [
    "sexual", "pedo", "pedophile", "nigro", "nigger", "nigga", "bitch", "fuck", "shit", "ass", "asshole", "cunt", "dick", "pussy", "whore", "slut", "bastard", "damn", "cock", "suck"
];

function getConfiguredBadWords(): string[] {
    const raw = process.env.BAD_WORDS;
    if (!raw) return badWords;

    const parsed = raw
        .split(",")
        .map((w) => w.trim().toLowerCase())
        .filter(Boolean)
        .map((w) => w.replace(/[^a-z0-9]/g, ""))
        .filter(Boolean);

    return parsed.length > 0 ? parsed : badWords;
}

function normalizeLeetspeak(text: string): string {
    return text
        .toLowerCase()
        .replace(/[\u2018\u2019]/g, "'")
        .replace(/[\u201C\u201D]/g, '"')
        .replace(/[@]/g, "a")
        .replace(/[4]/g, "a")
        .replace(/[3]/g, "e")
        .replace(/[1!|]/g, "i")
        .replace(/[0]/g, "o")
        .replace(/[$5]/g, "s")
        .replace(/[7+]/g, "t");
}

function buildSeparatedWordRegex(word: string): RegExp {
    const cleaned = word.replace(/[^a-z0-9]/g, "");
    const letters = cleaned.split("").filter(Boolean);
    const core = letters.join("[^a-z0-9]*");
    return new RegExp(`(?:^|[^a-z0-9])${core}(?:$|[^a-z0-9])`, "i");
}

export function containsBadLanguage(text: string): boolean {
    const lowerText = text.toLowerCase();
    const normalized = normalizeLeetspeak(text);
    const configuredBadWords = getConfiguredBadWords();

    return configuredBadWords.some((word) => {
        // strict word boundary check to avoid false positives (e.g. "ass" in "class")
        const exact = new RegExp(`\\b${word}\\b`, "i");
        if (exact.test(lowerText)) return true;

        // Harder-to-bypass variant (handles spacing/punctuation between letters).
        // Only apply to longer words to reduce false positives.
        if (word.length < 4) return false;
        const separated = buildSeparatedWordRegex(word);
        return separated.test(normalized);
    });
}
