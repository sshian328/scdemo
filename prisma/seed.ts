import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    console.log("setup database")

    const createdDevice = await prisma.device.create({
        data: {
            name: "SCOS Station P1 Pro",
            price: 150,
            weight: 0.365
        }
    });

    await prisma.inventory.createMany( {
        data: [
            { location: "Los Angeles", coordinateX: 33.9425, coordinateY: -118.408056, stock: 355, deviceId: createdDevice.id },
            { location: "New York", coordinateX: 40.639722, coordinateY: -73.778889, stock: 578, deviceId: createdDevice.id },
            { location: "São Paulo", coordinateX: -23.435556, coordinateY: -46.473056, stock: 265, deviceId: createdDevice.id },
            { location: "Paris", coordinateX: 49.009722, coordinateY: 2.547778, stock: 694, deviceId: createdDevice.id },
            { location: "Warsaw", coordinateX: 52.165833, coordinateY: 20.967222, stock: 245, deviceId: createdDevice.id },
            { location: "Hong Kong", coordinateX: 22.308889, coordinateY: 113.914444, stock: 419, deviceId: createdDevice.id }
          ],
    });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
