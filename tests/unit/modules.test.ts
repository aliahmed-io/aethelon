import { describe, it, expect, vi, beforeEach } from 'vitest';
import { InventoryService } from '../../modules/inventory/inventory.service';
import { OrderService } from '../../modules/orders/orders.service';
import { InventoryError, ValidationError } from '../../lib/errors';
import prisma from '../../lib/db';

// Mock Prisma
vi.mock('../../lib/db', () => ({
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
        }
    }
}));

// Mock Logger to avoid noise
vi.mock('../../lib/logger', () => ({
    default: {
        info: vi.fn(),
        warn: vi.fn(),
        error: vi.fn(),
    }
}));

describe('InventoryService', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('restock should increment stock and create ledger entry', async () => {
        await InventoryService.restock('prod-1', 10, 'Restock', 'admin-1');

        expect(prisma.product.update).toHaveBeenCalledWith({
            where: { id: 'prod-1' },
            data: { stockQuantity: { increment: 10 } }
        });

        expect(prisma.inventoryTransaction.create).toHaveBeenCalled();
    });

    it('restock should throw InventoryError for negative quantity', async () => {
        await expect(InventoryService.restock('prod-1', -5, 'Fail', 'admin-1'))
            .rejects.toThrow(InventoryError);
    });
});

describe('OrderService', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('transitionStatus should throw ValidationError on invalid transition', async () => {
        (prisma.order.findUnique as any).mockResolvedValue({ id: 'order-1', status: 'CREATED' });

        // CREATED -> SHIPPED is invalid
        await expect(OrderService.transitionStatus('order-1', 'SHIPPED'))
            .rejects.toThrow(ValidationError);
    });

    it('transitionStatus should allow valid transition', async () => {
        (prisma.order.findUnique as any).mockResolvedValue({ id: 'order-1', status: 'CREATED' });
        (prisma.order.update as any).mockResolvedValue({ id: 'order-1', status: 'PAID' });

        await OrderService.transitionStatus('order-1', 'PAID');

        expect(prisma.order.update).toHaveBeenCalledWith({
            where: { id: 'order-1' },
            data: { status: 'PAID' }
        });
    });
});
