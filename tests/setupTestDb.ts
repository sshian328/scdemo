import { PostgreSqlContainer } from '@testcontainers/postgresql';
import { PrismaClient } from '@prisma/client';
import { execSync } from 'child_process';

let container: Awaited<ReturnType<PostgreSqlContainer['start']>>;
let prisma: PrismaClient;

export async function startTestDb() {
    container = await new PostgreSqlContainer()
        .withDatabase('testdb')
        .withUsername('test')
        .withPassword('test')
        .start();

    process.env.DATABASE_URL = container.getConnectionUri();

    // Apply schema
    execSync('npx prisma migrate deploy', { stdio: 'inherit' });

    prisma = new PrismaClient();
    await prisma.$connect();

    return { prisma };
}

export async function stopTestDb() {
    await prisma?.$disconnect();
    await container?.stop();
}
