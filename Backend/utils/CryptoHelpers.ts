import crypto from 'crypto';

/**
 * Generates a random 6-digit numeric string.
 */
export const generateNumericOtp = (): string => {
    return Math.floor(1000 + Math.random() * 9000).toString();
};

/**
 * Hashes a string using SHA-256 for secure database verification matching.
 */
export const hashData = (data: string): string => {
    return crypto.createHash('sha256').update(data).digest('hex');
};