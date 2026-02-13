import { describe, it, expect, vi, beforeEach } from 'vitest';
import { InventoryService } from '@/modules/inventory/inventory.service';
import { OrderService } from '@/modules/orders/orders.service';
import { PaymentService } from '@/modules/payments/payments.service';
import { InventoryError, ValidationError } from '@/lib/errors';
import prisma from '@/lib/db';
import { stripe } from '@/lib/stripe';

// Mock Prisma
vi.mock('@/lib/db', () => ({
    default: {
        $transaction: vi.fn((callback) => callback(prisma)),
        product: {
            update: vi.fn(),
            findUnique: vi.fn(),
        },
        inventoryTransaction: {
            create: vi.fn(),
        },
        order: {
            findUnique: vi.fn(),
            update: vi.fn(),
            create: vi.fn(),
        },
        returnRequest: {
            create: vi.fn(),
        }
    }
}));

// Mock Logger
vi.mock('@/lib/logger', () => ({
    default: {
        info: vi.fn(),
        warn: vi.fn(),
        error: vi.fn(),
    }
}));

// Mock Stripe
vi.mock('@/lib/stripe', () => ({
    stripe: {
        checkout: {
            sessions: {
                create: vi.fn()
            }
        },
        refunds: {
            create: vi.fn()
        }
    }
}));

describe('InventoryService', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('restock() should increment stock and create ledger entry', async () => {
        await InventoryService.restock('prod-1', 10, 'Restock', 'admin-1');

        expect(prisma.product.update).toHaveBeenCalledWith({
            where: { id: 'prod-1' },
            data: { stockQuantity: { increment: 10 } }
        });

        expect(prisma.inventoryTransaction.create).toHaveBeenCalledWith(expect.objectContaining({
            data: expect.objectContaining({
                type: 'RESTOCK',
                quantity: 10,
                productId: 'prod-1'
            })
        }));
    });

    it('restock() should throw InventoryError for negative quantity', async () => {
        await expect(InventoryService.restock('prod-1', -5, 'Fail', 'admin-1'))
            .rejects.toThrow(InventoryError);
    });

    it('reserveStock() should decrement available stock if sufficient', async () => {
        // Mock product finding
        (prisma.product.findUnique as any).mockResolvedValue({
            id: 'prod-1',
            stockQuantity: 10,
            reservedStock: 2
        });

        await InventoryService.reserveStock('order-1', [{ productId: 'prod-1', quantity: 5 }]);

        expect(prisma.product.update).toHaveBeenCalledWith({
            where: { id: 'prod-1' },
            data: { reservedStock: { increment: 5 } }
        });
    });

    it('reserveStock() should throw if insufficient stock', async () => {
        // Mock product finding (10 total, 8 reserved, 2 available. Request 5)
        (prisma.product.findUnique as any).mockResolvedValue({
            id: 'prod-1',
            stockQuantity: 10,
            reservedStock: 8
        });

        await expect(InventoryService.reserveStock('order-1', [{ productId: 'prod-1', quantity: 5 }]))
            .rejects.toThrow(InventoryError);
    });
});

describe('OrderService', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('transitionStatus() should allow valid transition (CREATED -> PAID)', async () => {
        (prisma.order.findUnique as any).mockResolvedValue({ id: 'order-1', status: 'CREATED' });
        (prisma.order.update as any).mockResolvedValue({ id: 'order-1', status: 'PAID' });

        await OrderService.transitionStatus('order-1', 'PAID');

        expect(prisma.order.update).toHaveBeenCalledWith({
            where: { id: 'order-1' },
            data: { status: 'PAID' }
        });
    });

    it('transitionStatus() should throw ValidationError on illegal transition (CREATED -> SHIPPED)', async () => {
        (prisma.order.findUnique as any).mockResolvedValue({ id: 'order-1', status: 'CREATED' });

        await expect(OrderService.transitionStatus('order-1', 'SHIPPED'))
            .rejects.toThrow(ValidationError);
    });
});

describe('PaymentService', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('refund() should call Stripe API', async () => {
        (stripe.refunds.create as any).mockResolvedValue({ id: 're_123', status: 'succeeded' });

        await PaymentService.refund('pi_123');

        expect(stripe.refunds.create).toHaveBeenCalledWith({
            payment_intent: 'pi_123',
            reason: 'requested_by_customer'
        });
    });
});
