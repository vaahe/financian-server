import bcrypt from 'bcrypt';
import { PrismaClient } from './generated/client';

const prisma = new PrismaClient();

const main = async () => {
    try {
        console.log("Deleting existing records...");
        await prisma.comment.deleteMany();
        await prisma.course.deleteMany();
        await prisma.video.deleteMany();
        await prisma.order.deleteMany();
        await prisma.user.deleteMany();

        console.log("Creating a new user...");
        const hashedPassword = await bcrypt.hash('vahevahe', 10);

        const user = await prisma.user.create({
            data: {
                email: 'vaheebarseghyan@gmail.com',
                password: hashedPassword,
                fullName: 'Vahe Barseghyan',
                imageUrl: '',
                phoneNumber: ''
            },
        });

        console.log("User created:", user);
    } catch (error) {
        console.error("An error occurred during seeding:", error);
    } finally {
        await prisma.$disconnect();
    }
};

main();
