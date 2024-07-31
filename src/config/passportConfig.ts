import passport from 'passport';
import * as bcrypt from 'bcrypt';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';

import { PrismaClient } from '../prisma/generated/client';
import { generateAccessToken, generateRefreshToken } from '../utils/jwtUtils';

const prisma = new PrismaClient();

passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
            callbackURL: '/auth/google/callback',
            passReqToCallback: true
        },
        async (req, accessToken, refreshToken, profile, done) => {
            const { id, emails, displayName, photos } = profile;

            try {
                let user = await prisma.user.findUnique({ where: { email: emails![0].value } });

                if (!user) {
                    const placeholderPassword = bcrypt.hashSync(id, 10);

                    user = await prisma.user.create({
                        data: {
                            id: id!,
                            phoneNumber: '',
                            isVerified: true,
                            fullName: displayName!,
                            email: emails![0].value,
                            imageUrl: photos![0].value,
                            password: placeholderPassword
                        }
                    });
                }

                return done(null, user);
            } catch (error) {
                return done(error);
            }
        }
    )
);

passport.serializeUser((user: any, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id: string, done) => {
    try {
        const user = await prisma.user.findUnique({ where: { id } });
        done(null, user);
    } catch (error) {
        done(error, null);
    }
});
