/**
 * Explicit Prisma payload types for queries using `include`.
 *
 * When the PrismaClient is extended (e.g. with Accelerate), TypeScript
 * can no longer infer the full return type from `include` args.
 * We define the payload types here using Prisma.XGetPayload<> and
 * re-export them for use across the app.
 */

import { Prisma } from "@prisma/client";

// ──────────────────────────────────────────────
// Campaign / Collection with nested products
// ──────────────────────────────────────────────

const campaignWithProductsInclude = {
    products: {
        include: { product: true },
    },
} satisfies Prisma.CampaignInclude;

export type CampaignWithProducts = Prisma.CampaignGetPayload<{
    include: typeof campaignWithProductsInclude;
}>;

export { campaignWithProductsInclude };

// ──────────────────────────────────────────────
// Order with order items
// ──────────────────────────────────────────────

const orderWithItemsInclude = {
    orderItems: true,
} satisfies Prisma.OrderInclude;

export type OrderWithItems = Prisma.OrderGetPayload<{
    include: typeof orderWithItemsInclude;
}>;

export { orderWithItemsInclude };

// ──────────────────────────────────────────────
// Order with items + user (for admin export)
// ──────────────────────────────────────────────

const orderWithItemsAndUserInclude = {
    User: {
        select: { email: true, firstName: true, lastName: true },
    },
    orderItems: true,
} satisfies Prisma.OrderInclude;

export type OrderWithItemsAndUser = Prisma.OrderGetPayload<{
    include: typeof orderWithItemsAndUserInclude;
}>;

export { orderWithItemsAndUserInclude };

// ──────────────────────────────────────────────
// Order with items + shipments (for tracking)
// ──────────────────────────────────────────────

const orderWithItemsAndShipmentsInclude = {
    orderItems: true,
    shipments: true,
} satisfies Prisma.OrderInclude;

export type OrderWithItemsAndShipments = Prisma.OrderGetPayload<{
    include: typeof orderWithItemsAndShipmentsInclude;
}>;

export { orderWithItemsAndShipmentsInclude };
