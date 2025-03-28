import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import Fastify from 'fastify';
import { orderRoutes } from '../modules/order/orderRoutes';
import { startTestDb, stopTestDb } from './setupTestDb';
import { seedTestData } from './testSeed';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
let app: ReturnType<typeof Fastify>;

beforeAll(async () => {
  await startTestDb();
  await seedTestData();

  app = Fastify();
  await app.register(orderRoutes);
  await app.ready();
});

afterAll(async () => {
  await app.close();
  await stopTestDb();
  await prisma.$disconnect();
});

describe('POST /orders/verify', () => {
  it('should return a valid response for a valid request', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/orders/verify',
      payload: {
        deviceCount: 100,
        coordinateX: 40,
        coordinateY: -73,
      },
    });

    expect(response.statusCode).toBe(200);
    const body = response.json();
    console.log('Response body:', body);
    expect(body.validity).toBe(true);
    expect(body.deviceCount).toBe(100);
    expect(body.orderItems.length).toBeGreaterThan(0);

    // Check inventory is unchanged
    const inventories = await prisma.inventory.findMany();

    inventories.forEach((inv) => {
      expect(inv.stock).toBe(500);
    });
  });

  it('should return invalid result if stock is insufficient', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/orders/verify',
      payload: {
        deviceCount: 999999, // Exceeds inventory
        coordinateX: -87.6298,
        coordinateY: 41.8781,
      },
    });

    expect(response.statusCode).toBe(200);
    const body = response.json();
    console.log('Response body:', body);
    expect(body.validity).toBe(false);
    expect(body.reason).toMatch("Not enough inventory to fulfill the order");

    const inventories = await prisma.inventory.findMany();

    inventories.forEach((inv) => {
      expect(inv.stock).toBe(500);
    });
  });

  it('ship to Taipei, should return invalid result if shipping cost exceed threshold', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/orders/verify',
      payload: {
        deviceCount: 10,
        coordinateX: 25.0330, // Taipei
        coordinateY: 121.5654,
      },
    });

    expect(response.statusCode).toBe(200);
    const body = response.json();
    console.log('Response body:', body);
    expect(body.validity).toBe(false);
    expect(body.reason).toMatch("Shipping cost exceeds threshold");

    const inventories = await prisma.inventory.findMany();

    inventories.forEach((inv) => {
      expect(inv.stock).toBe(500);
    });
  });
});

describe('POST /orders', () => {
  it('Order 1000 units to Chicago and ship from LA and NY', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/orders',
      payload: {
        deviceCount: 1000,
        coordinateX: 41.8781, // Chicago
        coordinateY: -87.6298,
      },
    });

    expect(response.statusCode).toBe(201);
    const order = response.json();
    console.log('Response body:', order);
    expect(order.validity).toBe(true);
    expect(order.deviceCount).toBe(1000);

    const inventories = await prisma.inventory.findMany({
      where: {
        location: { in: ['Los Angeles', 'New York'] },
      },
    });

    inventories.forEach((inv) => {
      expect(inv.stock).toBe(0); // stock should be depleted
    });
  });
});
