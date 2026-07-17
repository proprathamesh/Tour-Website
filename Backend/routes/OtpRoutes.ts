import { Router } from 'express';
import { requestOtpController, verifyOtpController, verifyWebhookController } from '../controllers/OtpController';

const router = Router();

// POST route to generate and send the WhatsApp OTP
router.post('/request-otp', requestOtpController);

// POST route to verify the submitted OTP
// router.post('/verify-otp', verifyOtpController);

// GET route for Meta's initial webhook verification handshake
router.get('/webhook', verifyWebhookController);

export default router;