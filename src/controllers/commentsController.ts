import { Request, Response } from "express";
import { PrismaClient } from "../prisma/generated/client";

const prisma = new PrismaClient();

export const createComment = async (req: Request, res: Response) => {
    try {
        const { content, courseId, authorId } = req.body;

        const course = await prisma.course.findUnique({ where: { id: courseId } });
        const author = await prisma.user.findUnique({ where: { id: authorId } });

        if (!course || !author) {
            return res.status(404).json({ message: "Course or User not found" });
        }

        await prisma.comment.create({
            data: {
                content, courseId, authorId
            }
        });

        return res.status(200).json({ message: "Comment created successfully" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

export const updateComment = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { content } = req.body;

        const updatedComment = await prisma.comment.update({
            where: { id },
            data: { content },
        });

        return res.status(200).json({ message: "Comment updated successfully", comment: updatedComment });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

export const deleteComment = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        await prisma.comment.delete({
            where: { id },
        });

        return res.status(200).json({ message: "Comment deleted successfully" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error" });
    }
}
