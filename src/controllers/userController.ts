import * as bcrypt from 'bcrypt';
import { Request, Response } from "express";

import { PrismaClient } from "../src/prisma/generated/client";
import { TUser } from "../src/types";

const prisma: PrismaClient = new PrismaClient();

const hashPassword = async (password: string) => {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
}

export const createUser = async (req: Request, res: Response) => {
    try {
        const { fullName, email, password, phoneNumber, imageUrl } = req.body;

        const hashedPassword = await hashPassword(password);

        const newUser: TUser = await prisma.user.create({
            data: {
                fullName, email, password: hashedPassword, phoneNumber, imageUrl
            }
        });

        console.log({ newUser });

        return res.status(200).json({ user: newUser });
    } catch (error) {
        console.error('Error while creating user: ', error);
        return
    }
}