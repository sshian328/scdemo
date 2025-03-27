import { Device } from '@prisma/client';
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function getDeviceById(deviceId: string): Promise<Device | null> {
    return prisma.device.findUnique({
        where: { id: deviceId },
    });
}
