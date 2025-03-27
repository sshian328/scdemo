import Fastify from "fastify";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";
import { verifyRoutes } from "./routes/verify";
import { orderRoutes } from "./modules/order/orderRoutes";
import { setupSwagger } from './config/swagger';

dotenv.config();

const fastify = Fastify({logger: true});
const prisma = new PrismaClient();

setupSwagger(fastify);
fastify.register(verifyRoutes);
fastify.register(orderRoutes);

fastify.get("/health", async (_,reply) => {  
    return { message: "Hello World SCDemo"};
} );

const start = async () => {
    try {
        await fastify.listen({ port : 3000 })
        console.log("Server Start");
    } catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
};

start();
