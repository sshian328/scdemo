import { FastifyReply, FastifyRequest } from 'fastify';
import { placeOrder, getOrder, verifyOrder } from './orderService';

// Type for create/verify request body
interface OrderRequestBody {
    deviceCount: number;
    coordinateX: number;
    coordinateY: number;
}

export async function createOrderHandler(req: FastifyRequest<{ Body: OrderRequestBody }>, reply: FastifyReply) {
    try {
        const { deviceCount, coordinateX, coordinateY } = req.body;
        const order = await placeOrder({ deviceCount, coordinateX, coordinateY });
        return reply.status(201).send(order);
    } catch (error) {
        if (error instanceof Error) {
            return reply.status(400).send({ error: error.message });
        }
        return reply.status(400).send({ error: 'Unknown error occurred' });
    }
}

export async function getOrderHandler(req: FastifyRequest<{ Params: { orderId?: string } }>, reply: FastifyReply) {
    try {
        const orderId = req.params?.orderId;
        const order = await getOrder(orderId);
        return reply.send(order);
    } catch (error) {
        if (error instanceof Error) {
            return reply.status(404).send({ error: error.message });
        }
        return reply.status(404).send({ error: 'Unknown error occurred' });
    }
}

export async function verifyOrderHandler(req: FastifyRequest<{ Body: OrderRequestBody }>, reply: FastifyReply) {
    try {
        const { deviceCount, coordinateX, coordinateY } = req.body;
        const result = await verifyOrder({ deviceCount, coordinateX, coordinateY });
        return reply.status(200).send(result);
    } catch (error) {
        if (error instanceof Error) {
            return reply.status(400).send({ error: error.message });
        }
        return reply.status(400).send({ error: 'Unknown error occurred' });
    }
}
