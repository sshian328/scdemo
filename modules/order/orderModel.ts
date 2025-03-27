import { PrismaClient, Prisma } from "@prisma/client";
import { Order } from '@prisma/client';

const prisma = new PrismaClient();

export function createOrderTx(tx: Prisma.TransactionClient, data: Omit<Order, 'id'>) {
    return tx.order.create({ data });
}

export function createOrderItemTx(
    tx: Prisma.TransactionClient,
    data: { orderId: string; inventoryId: string; quantity: number }
) {
    return tx.orderItem.create({ data });
}


// Retrieve an order by ID
export async function getOrderById(orderId: string) {
    return prisma.order.findUnique({
        where: { id: orderId },
        include: { orderItems: true },
    });
}

export async function getOrderByIdTx(tx: Prisma.TransactionClient, orderId: string) {
    return tx.order.findUnique({
        where: { id: orderId },
        include: { orderItems: true },
    });
}

// Retrieve all orders
export async function getAllOrders() {
    return prisma.order.findMany({
        include: { orderItems: true },
    });
}

export function createOrder(data: {
    deviceCount: number;
    coordinateX: Prisma.Decimal;
    coordinateY: Prisma.Decimal;
    price: Prisma.Decimal;
    discount: Prisma.Decimal;
    shippingCost: Prisma.Decimal;
    finalTotal: Prisma.Decimal;
    validity: boolean;
    reason?: string | null;
}) {
    return prisma.order.create({ data });
}
