import prisma from '../db/client.js';

export async function getSession(id) {
    return prisma.session.findUnique({ where: { id } });
}
