import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function resetDatabase() {
  try {
    console.log("reset db");

    // Delete all records from tables
    await prisma.inventory.deleteMany({});
    await prisma.device.deleteMany({});
    await prisma.order.deleteMany({});

  } catch (error) {
    console.error("err:", error);
  } finally {
    await prisma.$disconnect();
  }
}

resetDatabase();
