import * as bcrypt from 'bcrypt';

export const verifyPassword = async (inputPassword: string, storedHash: string): Promise<boolean> => {
    return bcrypt.compare(inputPassword, storedHash);
};

export const hashPassword = async (password: string): Promise<string> => {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
}