import { createOrderTx, createOrderItemTx, getOrderById, getAllOrders, getOrderByIdTx, createOrder } from './orderModel';
import { Order } from '@prisma/client';
import { findAvailableInventories, decrementInventoryStockTx } from '../inventory/inventoryModel';
import { getDeviceById } from '../device/deviceModel';
import { SHIPPING_RATE, SHIPPING_THRESHOLD, DISCOUNT_TIERS } from '../../config/constants';
import { PrismaClient, Prisma } from "@prisma/client";

const prisma = new PrismaClient();

interface CreateOrderInput {
    deviceCount: number;
    coordinateX: number;
    coordinateY: number;
}

interface OrderItemPreview {
    inventoryId: string;
    quantity: number;
    distance: number;
    shippingCost: number;
}

interface VerifiedOrder {
    deviceCount: number;
    coordinateX: number;
    coordinateY: number;
    price: number;
    discount: number;
    shippingCost: number;
    finalTotal: number;
    validity: boolean;
    reason?: string;
    orderItems: OrderItemPreview[];
}

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    //Haversine Formula
    const R = 6371; //Earth's radius in km

    const dLat = toRadians(lat2 - lat1);
    const dLon = toRadians(lon2 - lon1);

    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
        Math.sin(dLon / 2) ** 2;

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
}

export function calculateDiscount(quantity: number, totalPrice: number): number {
    for (const tier of DISCOUNT_TIERS) {
        if (quantity >= tier.minQuantity) {
            return totalPrice * tier.discountRate;
        }
    }
    return 0;
}

function toRadians(deg: number): number {
    return deg * (Math.PI / 180);
}


export async function verifyOrder(input: CreateOrderInput): Promise<VerifiedOrder> {
    const { deviceCount, coordinateX, coordinateY } = input;

    const inventories = await findAvailableInventories();

    if (!inventories.length) {
        return {
            deviceCount,
            coordinateX,
            coordinateY,
            price: 0,
            discount: 0,
            shippingCost: 0,
            finalTotal: 0,
            validity: false,
            reason: 'No inventory available',
            orderItems: [],
        };
    }

    // Sort by distance from input location
    const sortedInventories = inventories
        .map((inv) => ({
            ...inv,
            distance: calculateDistance(coordinateX, coordinateY, Number(inv.coordinateX), Number(inv.coordinateY)),
        }))
        .sort((a, b) => a.distance - b.distance);

    sortedInventories.forEach((inv) => {
        console.log(
            `Location="${inv.location}", Stock=${inv.stock}, Distance=${inv.distance.toFixed(2)} km`
        );
    });

    let remaining = deviceCount;
    let shippingCost = 0;
    let totalBeforeDiscount = 0;
    const orderItems: OrderItemPreview[] = [];

    for (const inv of sortedInventories) {
        if (remaining <= 0) break;

        const quantity = Math.min(remaining, inv.stock);
        const device = await getDeviceById(inv.deviceId);
        if (!device) throw new Error(`Device not found for inventory: ${inv.id}`);

        const unitPrice = Number(device.price);
        const weight = Number(device.weight);
        const shipping = inv.distance * quantity * weight * SHIPPING_RATE;
        const order = quantity * unitPrice;

        shippingCost += shipping;
        totalBeforeDiscount += order
        orderItems.push({
            inventoryId: inv.id,
            quantity,
            distance: inv.distance,
            shippingCost: shipping,
        });

        remaining -= quantity;
    }

    if (remaining > 0) {
        return {
            deviceCount,
            coordinateX,
            coordinateY,
            price: totalBeforeDiscount,
            discount: 0,
            shippingCost,
            finalTotal: totalBeforeDiscount + shippingCost,
            validity: false,
            reason: 'Not enough inventory to fulfill the order',
            orderItems,
        };
    }

    const discount = calculateDiscount(deviceCount, totalBeforeDiscount);
    const validity = shippingCost <= (totalBeforeDiscount - discount) * SHIPPING_THRESHOLD;
    const finalTotal = Number((totalBeforeDiscount - discount + shippingCost).toFixed(2));

    return {
        deviceCount,
        coordinateX,
        coordinateY,
        price: totalBeforeDiscount,
        discount,
        shippingCost,
        finalTotal,
        validity,
        reason: validity ? undefined : 'Shipping cost exceeds threshold',
        orderItems,
    };
}

export async function getOrder(orderId?: string): Promise<Order | Order[]> {
    if (orderId) {
        const order = await getOrderById(orderId);
        if (!order) {
            throw new Error('Order not found');
        }
        return order;
    }
    return await getAllOrders();
}

export async function placeOrder(data: CreateOrderInput): Promise<Order> {
    // 1. Verify the order
    const verified = await verifyOrder(data);

    // 2. Reject if invalid
    if (!verified.validity) {
        const order = await createOrder({
            deviceCount: verified.deviceCount,
            coordinateX: new Prisma.Decimal(verified.coordinateX),
            coordinateY: new Prisma.Decimal(verified.coordinateY),
            price: new Prisma.Decimal(verified.price.toFixed(2)),
            discount: new Prisma.Decimal(verified.discount.toFixed(2)),
            shippingCost: new Prisma.Decimal(verified.shippingCost.toFixed(2)),
            finalTotal: new Prisma.Decimal(verified.finalTotal.toFixed(2)),
            validity: false,
            reason: verified.reason || 'Order is invalid',
        });

        return order;
    }

    // 3. Run transaction: decrement stock, insert order, insert order items
    try {
        return await prisma.$transaction(async (tx) => {
            // Decrement inventory stock
            for (const item of verified.orderItems) {
                await decrementInventoryStockTx(tx, item.inventoryId, item.quantity);
            }

            // Create the order
            const order = await createOrderTx(tx, {
                deviceCount: verified.deviceCount,
                coordinateX: new Prisma.Decimal(verified.coordinateX),
                coordinateY: new Prisma.Decimal(verified.coordinateY),
                price: new Prisma.Decimal(verified.price.toFixed(2)),
                discount: new Prisma.Decimal(verified.discount.toFixed(2)),
                shippingCost: new Prisma.Decimal(verified.shippingCost.toFixed(2)),
                finalTotal: new Prisma.Decimal(verified.finalTotal.toFixed(2)),
                validity: true,
                reason: null,
            });

            // Create associated order items
            for (const item of verified.orderItems) {
                await createOrderItemTx(tx, {
                    orderId: order.id,
                    inventoryId: item.inventoryId,
                    quantity: item.quantity,
                });
            }

            const result = await getOrderByIdTx(tx, order.id);
            if (!result) throw new Error('Transaction failed: could not retrieve order');

            return result;
        });
    } catch (error) {
        // fallback commit
        const fallbackOrder = await createOrder({
            deviceCount: verified.deviceCount,
            coordinateX: new Prisma.Decimal(verified.coordinateX),
            coordinateY: new Prisma.Decimal(verified.coordinateY),
            price: new Prisma.Decimal(verified.price.toFixed(2)),
            discount: new Prisma.Decimal(verified.discount.toFixed(2)),
            shippingCost: new Prisma.Decimal(verified.shippingCost.toFixed(2)),
            finalTotal: new Prisma.Decimal(verified.finalTotal.toFixed(2)),
            validity: false,
            reason: (error as Error).message || 'Order failed',
        });

        return fallbackOrder;
    }

}
