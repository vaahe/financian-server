import * as bcrypt from 'bcrypt';
import { PrismaClient } from '../prisma/generated/client';

const prisma = new PrismaClient();

export const hashPassword = async (password: string): Promise<string> => {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
}

export const userExists = async (id: string): Promise<boolean> => {
    const user = await prisma.user.findUnique({ where: { id } });
    return Boolean(user);
}
