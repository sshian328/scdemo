import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function seedTestData() {
    await prisma.orderItem.deleteMany();
    await prisma.order.deleteMany();
    await prisma.inventory.deleteMany();
    await prisma.device.deleteMany();

    const device = await prisma.device.create({
        data: {
            name: 'Test Device',
            price: 150,
            weight: 0.365
        },
    });

    await prisma.inventory.createMany({
        data: [
            { location: "Los Angeles", coordinateX: 33.9425, coordinateY: -118.408056, stock: 500, deviceId: device.id },
            { location: "New York", coordinateX: 40.639722, coordinateY: -73.778889, stock: 500, deviceId: device.id },
            { location: "São Paulo", coordinateX: -23.435556, coordinateY: -46.473056, stock: 500, deviceId: device.id },
            { location: "Paris", coordinateX: 49.009722, coordinateY: 2.547778, stock: 500, deviceId: device.id },
        ],
    });
}
