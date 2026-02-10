export function getAdminEmails(): string[] {
    const raw = process.env.ADMIN_EMAILS || "";
    return raw
        .split(",")
        .map((e) => e.trim().toLowerCase())
        .filter(Boolean);
}

export function isAdminEmail(email: string | null | undefined): boolean {
    if (!email) return false;
    const admins = getAdminEmails();
    if (admins.length === 0) {
        return process.env.NODE_ENV !== "production";
    }
    return admins.includes(email.toLowerCase());
}
