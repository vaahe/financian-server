import { Request, Response } from 'express';
import { PrismaClient } from '../prisma/generated/client';
import { TCourse } from '../types';
import path from 'path';
import fs from 'fs';

const prisma = new PrismaClient();

export const getCourses = async (req: Request, res: Response) => {
    try {
        const courses = await prisma.course.findMany({
            include: {
                videos: true,
                comments: true,
                buyers: true
            }
        });

        if (!courses.length) {
            return res.status(204).json({ message: "No courses to fetch" });
        }

        return res.status(200).json(courses);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

export const getCourseById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({ message: "Bad request. ID is missing" });
        }

        const course = await prisma.course.findUnique({
            where: { id }, include: {
                videos: true,
                comments: true,
                buyers: true
            }
        });

        if (!course) {
            return res.status(404).json({ message: "Course not found" });
        }

        return res.status(200).json(course);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

export const createCourse = async (req: Request, res: Response) => {
    try {
        const {
            title,
            description,
            price,
            rating,
            category,
            duration,
            videoCount,
            buyers,
            updatedAt,
            comments
        } = req.body;

        const files = req.files as { [fieldname: string]: Express.Multer.File[] };
        const thumbnail = files && files['thumbnail'] ? files['thumbnail'][0] : null;
        const videos = files && files['videos'] || [];
        const videoData = videos.map(video => ({ filename: video.filename }));

        const parsedComments = comments ? JSON.parse(comments) : [];
        const parsedBuyers = buyers ? JSON.parse(buyers) : [];

        const newCourse = await prisma.course.create({
            data: {
                title,
                description,
                price: parseFloat(price),
                rating: parseFloat(rating),
                category,
                thumbnail: thumbnail?.filename || "",
                duration: parseInt(duration, 10),
                videoCount: parseInt(videoCount, 10),
                videos: {
                    createMany: {
                        data: videoData
                    },
                },
                updatedAt,
                comments: {
                    create: parsedComments
                },
                buyers: {
                    create: parsedBuyers
                }
            },
            include: {
                videos: true,
            },
        });

        return res.status(201).json({ message: "Course created successfully", newCourse });
    } catch (error) {
        console.error('Error creating course:', error);
        return res.status(500).json({ error: 'Failed to create course' });
    }
};

export const updateCourse = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({ message: "Bad request. ID is missing" });
        }

        const existingCourse = await prisma.course.findUnique({ where: { id } });

        if (!existingCourse) {
            return res.status(404).json({ message: "Course not found" });
        }

        const {
            title,
            description,
            price,
            rating,
            category,
            duration,
            videoCount,
            buyers,
            updatedAt,
            comments
        } = req.body;

        const files = req.files as { [fieldname: string]: Express.Multer.File[] };
        const thumbnail = files && files['thumbnail'] ? files['thumbnail'][0] : null;
        const videos = files && files['videos'] || [];
        const videoData = videos.map(video => ({ filename: video.path }));

        const parsedComments = comments ? JSON.parse(comments) : [];
        const parsedBuyers = buyers ? JSON.parse(buyers) : [];

        const updatedCourse = await prisma.course.update({
            where: { id },
            data: {
                title: title || existingCourse.title,
                description: description || existingCourse.description,
                price: price ? parseFloat(price) : existingCourse.price,
                rating: rating ? parseFloat(rating) : existingCourse.rating,
                category: category || existingCourse.category,
                thumbnail: thumbnail ? thumbnail.filename : existingCourse.thumbnail,
                duration: duration ? parseInt(duration, 10) : existingCourse.duration,
                videoCount: videoCount ? parseInt(videoCount, 10) : existingCourse.videoCount,
                videos: {
                    deleteMany: {},
                    createMany: {
                        data: videoData
                    }
                },
                updatedAt: updatedAt || existingCourse.updatedAt,
                comments: {
                    deleteMany: {},
                    create: parsedComments
                },
                buyers: {
                    deleteMany: {},
                    create: parsedBuyers
                }
            },
            include: {
                videos: true,
            },
        });

        return res.status(200).json({ message: "Course updated successfully", updatedCourse });
    } catch (error) {
        console.error('Error updating course:', error);
        return res.status(500).json({ error: 'Failed to update course' });
    }
};

export const deleteCourse = async (req: Request, res: Response) => {
    const courseId = req.params.id;

    if (!courseId) {
        return res.status(400).json({ message: "Bad request. ID is missing" });
    }

    try {
        const course = await prisma.course.findUnique({
            where: { id: courseId },
            include: { videos: true }
        });

        if (!course) {
            return res.status(404).json({ message: "Course not found" });
        }

        await prisma.$transaction(async (tx) => {
            for (const video of course.videos) {
                const videoPath = path.join(__dirname, '..', 'uploads/videos', video.filename);
                console.log('video.filename: ', video.filename);
                console.log({ videoPath });

                try {
                    if (fs.existsSync(videoPath)) {
                        fs.unlinkSync(videoPath);
                    }
                } catch (error) {
                    console.error(`Error deleting video file: ${video.filename}`, error);
                    throw new Error(`Error deleting video file: ${video.filename}`);
                }
            }

            const thumbnailPath = path.join(__dirname, '..', 'uploads/thumbnails', course.thumbnail);
            try {
                if (fs.existsSync(thumbnailPath)) {
                    fs.unlinkSync(thumbnailPath);
                }
            } catch (error) {
                console.error(`Error deleting thumbnail file: ${course.thumbnail}`, error);
                throw new Error(`Error deleting thumbnail file: ${course.thumbnail}`);
            }

            await tx.video.deleteMany({
                where: { courseId }
            });

            await tx.comment.deleteMany({
                where: { courseId }
            });

            await tx.course.delete({
                where: { id: courseId }
            });
        });

        return res.status(200).json({ message: "Course deleted successfully" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error" });
    }
}