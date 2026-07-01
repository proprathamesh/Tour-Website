import express, { Application } from 'express';
import mongoose from 'mongoose';
import rateLimit from 'express-rate-limit';
import otpRoutes from './routes/OtpRoutes';

// Load environment variables (Ensure you have 'dotenv' installed: npm install dotenv)
import dotenv from 'dotenv';
dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 5000;

// 1. Core Middleware
app.use(express.json()); // Allows Express to parse incoming JSON payloads

// 2. Security Middleware: IP Rate Limiting for OTPs (Max 3 requests per 15 minutes)
const otpLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, 
    max: 3, 
    message: { error: 'Too many OTP requests from this IP, please try again after 15 minutes.' },
    standardHeaders: true, 
    legacyHeaders: false,
});

// 3. Mount Routes
// Apply the rate limiter strictly to the OTP routes to prevent API budget draining
app.use('/api/auth', otpLimiter, otpRoutes);

// 4. Database Connection & Server Initialization
const startServer = async () => {
    try {
        const mongoUri = process.env.MONGODB_URI;
        if (!mongoUri) {
            throw new Error('MONGODB_URI is missing in your .env file');
        }

        // Connect to MongoDB
        await mongoose.connect(mongoUri);
        console.log('✅ MongoDB securely connected.');

        // Start listening
        app.listen(PORT, () => {
            console.log(`🚀 Server is running live on http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error('❌ Failed to start the server:', error);
        process.exit(1);
    }
};

startServer();