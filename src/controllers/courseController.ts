import fs from 'fs';
import path from 'path';
import { Request, Response } from 'express';
import { PrismaClient } from '../prisma/generated/client';

const prisma = new PrismaClient();

export const getCourses = async (req: Request, res: Response) => {
    try {
        const courses = await prisma.course.findMany({
            include: {
                videos: true,
                comments: true
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

        const course = await prisma.course.findUnique({
            where: { id }, include: {
                videos: true,
                comments: true
            }
        });

        if (!course) {
            return res.status(404).json({ message: "Course not found" });
        }

        const thumbnailPath = path.join(__dirname, '..', 'uploads', 'thumbnails', course.thumbnail);
        const videoPaths = course.videos.map((video: any) => path.join(__dirname, '..', 'uploads', 'videos', video.filename));

        if (!fs.existsSync(thumbnailPath)) {
            return res.status(404).json({ message: "File not found" });
        }

        const thumbnailData = fs.readFileSync(thumbnailPath, 'base64');
        const videosData = videoPaths.map((videoPath: string) => {
            if (fs.existsSync(videoPath)) {
                return fs.readFileSync(videoPath, 'base64');
            } else {
                return null;
            }
        }).filter((videoData) => videoData !== null);

        const origin = req.headers.origin;
        let responseData;
        if (origin === 'http://localhost:3000') {
            responseData = {
                ...course,
                thumbnail: course.thumbnail,
                videos: videosData
            };

            return res.status(200).json(responseData);
        }

        return res.status(200).json({ ...course, thumbnail: { name: course.thumbnail, data: thumbnailData }, videos: videosData });
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
            orders,
            updatedAt,
            comments
        } = req.body;

        const files = req.files as { [fieldname: string]: Express.Multer.File[] };
        const thumbnail = files && files['thumbnail'] ? files['thumbnail'][0] : null;
        const videos = files && files['videos'] || [];
        const videoData = videos.map(video => ({ filename: video.filename }));

        const parsedComments = comments ? JSON.parse(comments) : [];
        const parsedBuyers = orders ? JSON.parse(orders) : [];

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
                orders: {
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
            orders,
            updatedAt,
            comments
        } = req.body;

        const files = req.files as { [fieldname: string]: Express.Multer.File[] };
        const thumbnail = files && files['thumbnail'] ? files['thumbnail'][0] : null;
        const videos = files && files['videos'] || [];
        const videoData = videos.map(video => ({ filename: video.path }));

        const parsedComments = comments ? JSON.parse(comments) : [];
        const parsedBuyers = orders ? JSON.parse(orders) : [];

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
                orders: {
                    deleteMany: {},
                    create: parsedBuyers
                }
            },
            include: {
                videos: true,
            },
        });

        console.log(updatedCourse);

        return res.status(200).json({ message: "Course updated successfully", updatedCourse });
    } catch (error) {
        console.error('Error updating course:', error);
        return res.status(500).json({ error: 'Failed to update course' });
    }
};

export const deleteCourse = async (req: Request, res: Response) => {
    const courseId = req.params.id;

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

export const getCourseByUserId = async (req: Request, res: Response) => {
    try {
        const { userId } = req.params;

        if (!userId) {
            return res.status(400).json({ message: "userId is required" });
        }

        const orders = await prisma.order.findMany({
            where: { userId },
            include: {
                course: true,
            },
        });

        const courses = orders.map(order => order.course);

        return res.status(200).json(courses);
    } catch (error) {
        console.error('Error fetching courses by user ID:', error);
        throw error;
    }
}