import { FastifyInstance } from 'fastify';
import fastifySwagger from '@fastify/swagger';
import fastifySwaggerUi from '@fastify/swagger-ui';

export async function setupSwagger(fastify: FastifyInstance) {
    await fastify.register(fastifySwagger, {
        openapi: {
            info: {
                title: 'SCDemo API Guide',
                description: 'API documentation for Device, Inventory, and Order system',
                version: '1.0.0',
            },
            servers: [{ url: 'http://localhost:3000', description: 'Local server' }],
        },
    });

    await fastify.register(fastifySwaggerUi, {
        routePrefix: '/docs',
        uiConfig: {
            docExpansion: 'list',
            deepLinking: false,
        },
    });
}
