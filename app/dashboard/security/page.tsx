import prisma from "@/lib/db";
import {
    ShieldCheck,
    ShieldAlert,
    Lock,
    AlertTriangle,
    Activity,
    Users,
    Clock,
    Server,
    Terminal,
    CheckCircle2,
    XCircle,
    ChevronRight,
    Globe,
    Key,
    FileText,
    Zap,
    Database,
    AlertCircle,
    Flag,
    Brain
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

// ============================================================
// DATA FETCHING
// ============================================================

// Define types for Prisma relations
interface ReviewWithRelations {
    id: string;
    comment: string | null;
    rating: number;
    createdAt: Date;
    User: {
        email: string;
        firstName: string | null;
    } | null;
    Product: {
        name: string;
    } | null;
}

interface LogWithUser {
    id: string;
    action: string;
    targetType: string;
    targetId: string | null;
    createdAt: Date;
    user: {
        email: string;
    } | null;
}

// Spam detection patterns
const SPAM_PATTERNS = [
    /\b(buy now|click here|free money|viagra|casino)\b/i,
    /\b(http|https|www\.)\S+/i, // URLs in reviews
    /(.)\1{4,}/i, // Repeated characters (e.g., "aaaaaaa")
    /[A-Z]{10,}/i, // All caps text
    /\b(scam|fake|fraud|terrible|worst)\b/i, // Negative spam indicators
];

async function getSecurityData() {
    const now = new Date();
    const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    // Fetch audit logs (login activity, admin actions)
    const recentAuditLogsRaw = await prisma.auditLog.findMany({
        where: {
            createdAt: { gte: last24h }
        },
        orderBy: { createdAt: "desc" },
        take: 50,
        include: { user: true }
    });
    const recentAuditLogs = recentAuditLogsRaw as unknown as LogWithUser[];

    // Fetch AI interaction logs (API usage monitoring)
    const aiLogs = await prisma.aiInteractionLog.findMany({
        where: {
            createdAt: { gte: last24h }
        },
        orderBy: { createdAt: "desc" },
        take: 30
    });

    // Calculate stats
    const totalLogins = recentAuditLogs.filter(log => log.action === "LOGIN").length;
    const failedLogins = recentAuditLogs.filter(log => log.action === "LOGIN_FAILED").length;
    const adminActions = recentAuditLogs.filter(log =>
        ["CREATE", "UPDATE", "DELETE"].some(a => log.action.includes(a))
    ).length;

    const aiRequestsTotal = aiLogs.length;
    const aiRequestsFailed = aiLogs.filter(log => !log.success).length;
    const avgResponseTime = aiLogs.length > 0
        ? Math.round(aiLogs.reduce((sum, log) => sum + log.responseTimeMs, 0) / aiLogs.length)
        : 0;

    // Determine threat level
    const threatLevel = failedLogins > 10 ? "elevated" : failedLogins > 5 ? "moderate" : "secure";

    // Get unique IPs from AI logs
    const uniqueIPs = new Set(aiLogs.map(log => log.ip).filter(Boolean));

    return {
        threatLevel,
        stats: {
            totalLogins,
            failedLogins,
            adminActions,
            aiRequestsTotal,
            aiRequestsFailed,
            avgResponseTime,
            uniqueIPs: uniqueIPs.size
        },
        recentAuditLogs: recentAuditLogs.slice(0, 15),
        aiLogs: aiLogs.slice(0, 10)
    };
}

async function getContentModerationData() {
    // Fetch recent reviews for spam analysis
    const recentReviewsRaw = await prisma.review.findMany({
        where: {
            isHidden: false
        },
        orderBy: { createdAt: "desc" },
        take: 100,
        include: {
            User: { select: { email: true, firstName: true } },
            Product: { select: { name: true } }
        }
    });
    const recentReviews = recentReviewsRaw as unknown as ReviewWithRelations[];

    // Analyze for spam/suspicious content
    const flaggedReviews = recentReviews.filter(review => {
        const content = review.comment || "";
        return SPAM_PATTERNS.some(pattern => pattern.test(content));
    }).map(review => ({
        id: review.id,
        content: review.comment,
        rating: review.rating,
        userEmail: review.User?.email || "Unknown",
        productName: review.Product?.name || "Unknown",
        createdAt: review.createdAt,
        flagReason: detectFlagReason(review.comment || "")
    }));

    // Low rating reviews (potential bad faith reviews)
    const lowRatingReviews = recentReviews.filter(r => r.rating <= 2).slice(0, 5);

    // Hidden reviews count
    const hiddenCount = await prisma.review.count({ where: { isHidden: true } });

    return {
        totalReviews: recentReviews.length,
        flaggedCount: flaggedReviews.length,
        hiddenCount,
        flaggedReviews: flaggedReviews.slice(0, 10),
        lowRatingReviews: lowRatingReviews.map(r => ({
            id: r.id,
            content: r.comment,
            rating: r.rating,
            userEmail: r.User?.email || "Unknown",
            productName: r.Product?.name || "Unknown",
            createdAt: r.createdAt
        }))
    };
}

function detectFlagReason(content: string): string {
    if (/\b(http|https|www\.)\S+/i.test(content)) return "Contains URL";
    if (/(.)\1{4,}/i.test(content)) return "Repeated characters";
    if (/[A-Z]{10,}/i.test(content)) return "Excessive caps";
    if (/\b(scam|fake|fraud)\b/i.test(content)) return "Suspicious keywords";
    if (/\b(buy now|click here|free)\b/i.test(content)) return "Spam language";
    return "Pattern match";
}

async function getDatabaseHealthData() {
    // Check for orphaned records and data integrity issues
    const issues: { type: string; severity: "warning" | "error" | "info"; message: string; count: number }[] = [];

    // 1. Orders without users
    const orphanedOrders = await prisma.order.count({
        where: { userId: null }
    });
    if (orphanedOrders > 0) {
        issues.push({
            type: "Orphaned Orders",
            severity: "warning",
            message: "Orders without associated user accounts",
            count: orphanedOrders
        });
    }

    // 2. Products without categories
    const productsWithoutCategory = await prisma.product.count({
        where: { categoryId: "" }
    });
    if (productsWithoutCategory > 0) {
        issues.push({
            type: "Uncategorized Products",
            severity: "warning",
            message: "Products missing category assignment",
            count: productsWithoutCategory
        });
    }

    // 3. Stale draft products (older than 30 days)
    const staleDraftDate = new Date();
    staleDraftDate.setDate(staleDraftDate.getDate() - 30);
    const staleDrafts = await prisma.product.count({
        where: {
            status: "draft",
            createdAt: { lt: staleDraftDate }
        }
    });
    if (staleDrafts > 0) {
        issues.push({
            type: "Stale Drafts",
            severity: "info",
            message: "Draft products older than 30 days",
            count: staleDrafts
        });
    }

    // 4. Expired discounts still active
    const expiredActiveDiscounts = await prisma.discount.count({
        where: {
            isActive: true,
            expiresAt: { lt: new Date() }
        }
    });
    if (expiredActiveDiscounts > 0) {
        issues.push({
            type: "Expired Discounts",
            severity: "error",
            message: "Discounts past expiration still marked active",
            count: expiredActiveDiscounts
        });
    }

    // 5. Unread contacts older than 7 days
    const oldUnreadDate = new Date();
    oldUnreadDate.setDate(oldUnreadDate.getDate() - 7);
    const oldUnreadContacts = await prisma.contact.count({
        where: {
            isRead: false,
            createdAt: { lt: oldUnreadDate }
        }
    });
    if (oldUnreadContacts > 0) {
        issues.push({
            type: "Old Contacts",
            severity: "warning",
            message: "Unread contact messages older than 7 days",
            count: oldUnreadContacts
        });
    }

    // 6. Pending orders older than 3 days
    const oldPendingDate = new Date();
    oldPendingDate.setDate(oldPendingDate.getDate() - 3);
    const oldPendingOrders = await prisma.order.count({
        where: {
            status: "pending",
            createdAt: { lt: oldPendingDate }
        }
    });
    if (oldPendingOrders > 0) {
        issues.push({
            type: "Stale Orders",
            severity: "error",
            message: "Pending orders older than 3 days",
            count: oldPendingOrders
        });
    }

    // Database stats
    const [totalProducts, totalOrders, totalUsers, totalReviews] = await Promise.all([
        prisma.product.count(),
        prisma.order.count(),
        prisma.user.count(),
        prisma.review.count()
    ]);

    return {
        issues,
        stats: {
            totalProducts,
            totalOrders,
            totalUsers,
            totalReviews
        },
        healthScore: issues.length === 0 ? 100 : Math.max(0, 100 - (issues.filter(i => i.severity === "error").length * 20) - (issues.filter(i => i.severity === "warning").length * 10))
    };
}

// ============================================================
// COMPONENTS
// ============================================================

function ThreatStatusBanner({ level }: { level: "secure" | "moderate" | "elevated" }) {
    const config = {
        secure: {
            icon: ShieldCheck,
            title: "System Secure",
            description: "All security protocols operational. No active threats detected.",
            bgClass: "bg-white/5",
            borderClass: "border-white/10",
            iconClass: "text-white"
        },
        moderate: {
            icon: ShieldAlert,
            title: "Elevated Activity",
            description: "Unusual login activity detected. Review recent access logs.",
            bgClass: "bg-yellow-500/5",
            borderClass: "border-yellow-500/20",
            iconClass: "text-yellow-500"
        },
        elevated: {
            icon: AlertTriangle,
            title: "Security Alert",
            description: "Multiple failed login attempts detected. Immediate review recommended.",
            bgClass: "bg-red-500/5",
            borderClass: "border-red-500/20",
            iconClass: "text-red-500"
        }
    };

    const { icon: Icon, title, description, bgClass, borderClass, iconClass } = config[level];

    return (
        <div className={`${bgClass} ${borderClass} border p-8 rounded-sm flex items-center gap-8 relative overflow-hidden`}>
            <div className={`p-6 ${bgClass} rounded-full border ${borderClass}`}>
                <Icon className={`w-12 h-12 ${iconClass}`} />
            </div>
            <div>
                <h2 className="text-xl font-bold tracking-tight text-white mb-2">{title}</h2>
                <p className="text-white/60 font-light max-w-md">{description}</p>
            </div>
            <div className="absolute top-4 right-6 text-[10px] font-mono uppercase tracking-widest text-white/30">
                Last Scan: {new Date().toLocaleTimeString()}
            </div>
        </div>
    );
}

function StatCard({ icon: Icon, label, value, subValue }: {
    icon: any;
    label: string;
    value: string | number;
    subValue?: string;
}) {
    return (
        <div className="bg-zinc-900/50 border border-white/10 p-6 rounded-sm hover:border-white/20 transition-all group">
            <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] uppercase tracking-widest text-white/40 group-hover:text-white/60 transition-colors">
                    {label}
                </span>
                <Icon className="w-4 h-4 text-white/20" />
            </div>
            <p className="text-3xl font-light text-white tracking-tight">{value}</p>
            {subValue && (
                <p className="text-xs text-white/30 mt-1 font-mono">{subValue}</p>
            )}
        </div>
    );
}

// ============================================================
// PAGE
// ============================================================

export default async function SecurityPage() {
    const [securityData, contentData, dbHealth] = await Promise.all([
        getSecurityData(),
        getContentModerationData(),
        getDatabaseHealthData()
    ]);

    return (
        <div className="space-y-8 max-w-[1600px] mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-6">
                <div>
                    <h1 className="text-2xl font-bold uppercase tracking-tighter text-white">Security Center</h1>
                    <p className="text-white/40 text-xs tracking-wide mt-1">Threat detection, content moderation, and data integrity</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] uppercase tracking-widest text-white/40">Live Monitoring</span>
                </div>
            </div>

            {/* Threat Status Banner */}
            <ThreatStatusBanner level={securityData.threatLevel as "secure" | "moderate" | "elevated"} />

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                <StatCard
                    icon={Users}
                    label="Logins (24h)"
                    value={securityData.stats.totalLogins}
                />
                <StatCard
                    icon={XCircle}
                    label="Failed Logins"
                    value={securityData.stats.failedLogins}
                    subValue={securityData.stats.failedLogins > 0 ? "Review Required" : "All Clear"}
                />
                <StatCard
                    icon={Terminal}
                    label="Admin Actions"
                    value={securityData.stats.adminActions}
                />
                <StatCard
                    icon={Zap}
                    label="AI Requests"
                    value={securityData.stats.aiRequestsTotal}
                />
                <StatCard
                    icon={Clock}
                    label="Avg Response"
                    value={`${securityData.stats.avgResponseTime}ms`}
                />
                <StatCard
                    icon={Globe}
                    label="Unique IPs"
                    value={securityData.stats.uniqueIPs}
                />
            </div>

            {/* Content Moderation & Database Health */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* AI Content Moderation */}
                <div className="bg-zinc-900/30 border border-white/10 rounded-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-white/10 bg-white/[0.02] flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Brain className="w-4 h-4 text-white/50" />
                            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-white">AI Content Moderation</h3>
                        </div>
                        <div className="flex items-center gap-4">
                            <span className="text-[10px] text-white/30 font-mono">{contentData.totalReviews} SCANNED</span>
                            {contentData.flaggedCount > 0 && (
                                <span className="text-[10px] px-2 py-1 bg-red-500/20 text-red-400 rounded-sm uppercase tracking-widest">
                                    {contentData.flaggedCount} Flagged
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="divide-y divide-white/5 max-h-[400px] overflow-y-auto">
                        {contentData.flaggedReviews.length === 0 ? (
                            <div className="p-12 flex flex-col items-center justify-center text-center">
                                <CheckCircle2 className="w-10 h-10 text-white/10 mb-4" />
                                <p className="text-sm text-white/30">No suspicious content detected</p>
                                <p className="text-[10px] text-white/20 mt-1">All reviews passed moderation</p>
                            </div>
                        ) : (
                            contentData.flaggedReviews.map((review) => (
                                <div key={review.id} className="px-6 py-4 hover:bg-white/[0.02] transition-colors">
                                    <div className="flex items-start justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            <Flag className="w-3 h-3 text-red-400" />
                                            <span className="text-xs text-red-400 uppercase tracking-widest">{review.flagReason}</span>
                                        </div>
                                        <span className="text-[10px] text-white/30 font-mono">
                                            {formatDistanceToNow(new Date(review.createdAt), { addSuffix: true })}
                                        </span>
                                    </div>
                                    <p className="text-sm text-white/70 line-clamp-2 mb-2">&quot;{review.content}&quot;</p>
                                    <div className="flex items-center justify-between text-[10px] text-white/30">
                                        <span>{review.userEmail}</span>
                                        <span>{review.productName}</span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {contentData.hiddenCount > 0 && (
                        <div className="px-6 py-3 border-t border-white/5 bg-white/[0.01] flex items-center justify-between">
                            <span className="text-[10px] text-white/30">{contentData.hiddenCount} reviews currently hidden</span>
                            <button className="text-[10px] text-white/50 hover:text-white transition-colors flex items-center gap-1">
                                View All <ChevronRight className="w-3 h-3" />
                            </button>
                        </div>
                    )}
                </div>

                {/* Database Health */}
                <div className="bg-zinc-900/30 border border-white/10 rounded-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-white/10 bg-white/[0.02] flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Database className="w-4 h-4 text-white/50" />
                            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-white">Database Health</h3>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className={`text-xl font-light ${dbHealth.healthScore >= 80 ? "text-white" : dbHealth.healthScore >= 50 ? "text-yellow-500" : "text-red-500"}`}>
                                {dbHealth.healthScore}%
                            </span>
                        </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="grid grid-cols-4 divide-x divide-white/5 border-b border-white/5">
                        <div className="p-4 text-center">
                            <p className="text-lg font-light text-white">{dbHealth.stats.totalProducts}</p>
                            <p className="text-[10px] text-white/30 uppercase tracking-widest">Products</p>
                        </div>
                        <div className="p-4 text-center">
                            <p className="text-lg font-light text-white">{dbHealth.stats.totalOrders}</p>
                            <p className="text-[10px] text-white/30 uppercase tracking-widest">Orders</p>
                        </div>
                        <div className="p-4 text-center">
                            <p className="text-lg font-light text-white">{dbHealth.stats.totalUsers}</p>
                            <p className="text-[10px] text-white/30 uppercase tracking-widest">Users</p>
                        </div>
                        <div className="p-4 text-center">
                            <p className="text-lg font-light text-white">{dbHealth.stats.totalReviews}</p>
                            <p className="text-[10px] text-white/30 uppercase tracking-widest">Reviews</p>
                        </div>
                    </div>

                    <div className="divide-y divide-white/5 max-h-[280px] overflow-y-auto">
                        {dbHealth.issues.length === 0 ? (
                            <div className="p-12 flex flex-col items-center justify-center text-center">
                                <CheckCircle2 className="w-10 h-10 text-white/10 mb-4" />
                                <p className="text-sm text-white/30">Database is healthy</p>
                                <p className="text-[10px] text-white/20 mt-1">No integrity issues detected</p>
                            </div>
                        ) : (
                            dbHealth.issues.map((issue, i) => (
                                <div key={i} className="px-6 py-4 hover:bg-white/[0.02] transition-colors flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <AlertCircle className={`w-4 h-4 ${issue.severity === "error" ? "text-red-400" : issue.severity === "warning" ? "text-yellow-500" : "text-white/30"}`} />
                                        <div>
                                            <p className="text-sm text-white font-medium">{issue.type}</p>
                                            <p className="text-xs text-white/40">{issue.message}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className={`text-xl font-light ${issue.severity === "error" ? "text-red-400" : issue.severity === "warning" ? "text-yellow-500" : "text-white/50"}`}>
                                            {issue.count}
                                        </span>
                                        <button className="p-2 hover:bg-white/10 rounded-sm transition-colors">
                                            <ChevronRight className="w-4 h-4 text-white/30" />
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Main Content Grid - Audit & AI Logs */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Audit Log */}
                <div className="lg:col-span-7 bg-zinc-900/30 border border-white/10 rounded-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-white/10 bg-white/[0.02] flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4 text-white/50" />
                            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-white">Audit Log</h3>
                        </div>
                        <span className="text-[10px] text-white/30 font-mono">LAST 24 HOURS</span>
                    </div>

                    <div className="divide-y divide-white/5 max-h-[400px] overflow-y-auto">
                        {securityData.recentAuditLogs.length === 0 ? (
                            <div className="p-12 flex flex-col items-center justify-center text-center">
                                <Lock className="w-10 h-10 text-white/10 mb-4" />
                                <p className="text-sm text-white/30">No activity recorded</p>
                            </div>
                        ) : (
                            securityData.recentAuditLogs.map((log) => (
                                <div key={log.id} className="px-6 py-4 hover:bg-white/[0.02] transition-colors group">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-start gap-4">
                                            <div className={`mt-1 w-2 h-2 rounded-full ${log.action.includes("DELETE") ? "bg-red-500" :
                                                log.action.includes("CREATE") ? "bg-emerald-500" :
                                                    log.action.includes("UPDATE") ? "bg-blue-500" :
                                                        "bg-white/30"
                                                }`} />
                                            <div>
                                                <p className="text-sm text-white font-medium group-hover:text-white transition-colors">
                                                    {log.action.replace(/_/g, " ")}
                                                </p>
                                                <p className="text-xs text-white/40 mt-1">
                                                    {log.targetType} {log.targetId ? `• ${log.targetId.slice(0, 8)}...` : ""}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs text-white/50">{log.user?.email || "System"}</p>
                                            <p className="text-[10px] text-white/30 font-mono mt-1">
                                                {formatDistanceToNow(new Date(log.createdAt), { addSuffix: true })}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* AI Activity Monitor */}
                <div className="lg:col-span-5 bg-zinc-900/30 border border-white/10 rounded-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-white/10 bg-white/[0.02] flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Activity className="w-4 h-4 text-white/50" />
                            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-white">AI Activity</h3>
                        </div>
                        <span className="text-[10px] text-white/30 font-mono">API MONITOR</span>
                    </div>

                    <div className="divide-y divide-white/5 max-h-[400px] overflow-y-auto">
                        {securityData.aiLogs.length === 0 ? (
                            <div className="p-12 flex flex-col items-center justify-center text-center">
                                <Server className="w-10 h-10 text-white/10 mb-4" />
                                <p className="text-sm text-white/30">No AI requests logged</p>
                            </div>
                        ) : (
                            securityData.aiLogs.map((log) => (
                                <div key={log.id} className="px-6 py-4 hover:bg-white/[0.02] transition-colors">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-3">
                                            {log.success ? (
                                                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                            ) : (
                                                <XCircle className="w-4 h-4 text-red-500" />
                                            )}
                                            <span className="text-sm text-white font-mono">{log.route}</span>
                                        </div>
                                        <span className="text-xs text-white/40">{log.responseTimeMs}ms</span>
                                    </div>
                                    <div className="flex items-center justify-between text-[10px] text-white/30">
                                        <span className="font-mono">{log.ip || "Internal"}</span>
                                        <span>{formatDistanceToNow(new Date(log.createdAt), { addSuffix: true })}</span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Security Configuration */}
            <div className="bg-zinc-900/30 border border-white/10 rounded-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-white/10 bg-white/[0.02] flex items-center gap-2">
                    <Key className="w-4 h-4 text-white/50" />
                    <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-white">Security Configuration</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-white/5">
                    <SecurityConfigItem
                        title="Two-Factor Auth"
                        status="Recommended"
                        description="Add 2FA for admin accounts"
                        statusType="warning"
                    />
                    <SecurityConfigItem
                        title="Session Timeout"
                        status="Active"
                        description="Sessions expire after 24h"
                        statusType="active"
                    />
                    <SecurityConfigItem
                        title="API Rate Limiting"
                        status="Active"
                        description="100 requests/min per IP"
                        statusType="active"
                    />
                    <SecurityConfigItem
                        title="Audit Logging"
                        status="Active"
                        description="All admin actions logged"
                        statusType="active"
                    />
                </div>
            </div>
        </div>
    );
}

function SecurityConfigItem({ title, status, description, statusType }: {
    title: string;
    status: string;
    description: string;
    statusType: "active" | "warning" | "inactive";
}) {
    return (
        <div className="p-6 hover:bg-white/[0.02] transition-colors group cursor-pointer">
            <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-medium text-white">{title}</h4>
                <span className={`text-[10px] px-2 py-1 rounded-sm uppercase tracking-widest ${statusType === "active" ? "bg-white/10 text-white" :
                    statusType === "warning" ? "bg-yellow-500/10 text-yellow-500" :
                        "bg-red-500/10 text-red-500"
                    }`}>
                    {status}
                </span>
            </div>
            <p className="text-xs text-white/40">{description}</p>
            <div className="mt-4 flex items-center gap-1 text-[10px] text-white/30 group-hover:text-white/50 transition-colors">
                Configure <ChevronRight className="w-3 h-3" />
            </div>
        </div>
    );
}
