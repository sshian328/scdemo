import { FastifyInstance } from "fastify";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function verifyRoutes(fastify: FastifyInstance) {
    fastify.get("/verify", async(_,reply) => {
        return reply.send( {message: "this is a valid order"});
    });
}