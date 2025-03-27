import { FastifyInstance } from 'fastify';
import { createOrderHandler, getOrderHandler, verifyOrderHandler } from './orderController';

const orderRequestBody = {
    type: 'object',
    required: ['deviceCount', 'coordinateX', 'coordinateY'],
    properties: {
        deviceCount: { type: 'integer', minimum: 1, description: 'Number of devices to order' },
        coordinateX: { type: 'number', description: 'Delivery location X coordinate' },
        coordinateY: { type: 'number', description: 'Delivery location Y coordinate' },
    },
    additionalProperties: false,
};

const orderRequestSchema = {
    schema: {
        body: orderRequestBody,
        response: {
            201: {
                description: 'Order created successfully',
                type: 'object',
                properties: {
                    id: { type: 'string' },
                    deviceCount: { type: 'integer' },
                    coordinateX: { type: 'number' },
                    coordinateY: { type: 'number' },
                    price: { type: 'number' },
                    discount: { type: 'number' },
                    shippingCost: { type: 'number' },
                    finalTotal: { type: 'number' },
                    validity: { type: 'boolean' },
                    reason: { type: 'string', nullable: true },
                    orderItems: {
                        type: 'array',
                        items: {
                            type: 'object',
                            properties: {
                                inventoryId: { type: 'string' },
                                quantity: { type: 'integer' },
                            },
                        },
                    },
                },
            },
            400: {
                description: 'Bad request, validation failed',
                type: 'object',
                properties: {
                    error: { type: 'string' },
                    message: { type: 'string' },
                },
            },
        },
    },
};

const verifySchema = {
    schema: {
        body: orderRequestBody,
        response: {
            200: {
                description: 'Order verification result',
                type: 'object',
                properties: {
                    deviceCount: { type: 'integer' },
                    coordinateX: { type: 'number' },
                    coordinateY: { type: 'number' },
                    price: { type: 'number' },
                    discount: { type: 'number' },
                    shippingCost: { type: 'number' },
                    finalTotal: { type: 'number' },
                    validity: { type: 'boolean' },
                    reason: {
                        type: 'string',
                        nullable: true,
                        description: 'Explanation if the order is invalid',
                    },
                    orderItems: {
                        type: 'array',
                        items: {
                            type: 'object',
                            properties: {
                                inventoryId: { type: 'string' },
                                quantity: { type: 'integer' },
                                distance: { type: 'number' },
                                shippingCost: { type: 'number' },
                            },
                        },
                    },
                },
            },
        },
    },
};

export async function orderRoutes(fastify: FastifyInstance) {
    fastify.post('/orders', orderRequestSchema, createOrderHandler);
    fastify.get('/orders/:orderId?', { schema: { description: 'Get order details' } }, getOrderHandler);
    fastify.post('/orders/verify', verifySchema, verifyOrderHandler);
}
