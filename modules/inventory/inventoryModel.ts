import { PrismaClient, Prisma } from "@prisma/client";
import { Inventory } from '@prisma/client';

const prisma = new PrismaClient();

export async function findAvailableInventories(): Promise<Inventory[]> {
    return prisma.inventory.findMany({
        where: { stock: { gt: 0 } },
    });
}

export async function decrementInventoryStockTx(tx: Prisma.TransactionClient, inventoryId: string, quantity: number) {
    const result = await tx.inventory.updateMany({
        where: {
            id: inventoryId,
            stock: { gte: quantity }, // ✅ only update if enough stock
        },
        data: {
            stock: {
                decrement: quantity,
            },
        },
    });

    if (result.count !== 1) {
        throw new Error(`Insufficient stock or inventory not found (id: ${inventoryId})`);
    }
}
