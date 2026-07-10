import { Request, Response } from 'express';
import axios from 'axios';
import { sanitizeAndValidatePhone } from '../utils/PhoneValidator';
import { generateNumericOtp, hashData } from '../utils/CryptoHelpers';
import Otp from '../models/Otp';

interface OtpRequestBody {
    rawPhoneNumber: string;
    captchaScore?: number;
}

export const requestOtpController = async (
    req: Request<{}, {}, OtpRequestBody>, 
    res: Response
): Promise<Response> => {
    const { rawPhoneNumber, captchaScore } = req.body;

    if (!rawPhoneNumber) {
        return res.status(400).json({ error: 'Phone number is required' });
    }

    // 1. Validate Phone Number Formats
    const phoneDetails = sanitizeAndValidatePhone(rawPhoneNumber);
    if (!phoneDetails.isValid || !phoneDetails.formattedNumber) {
        return res.status(400).json({ error: 'Invalid phone number layout.' });
    }

    // 2. Security Thresholds
    if (phoneDetails.countryCode !== 'IN' && captchaScore !== undefined && captchaScore < 0.8) {
        return res.status(403).json({ error: 'High security risk validation failed.' });
    } else if (captchaScore !== undefined && captchaScore < 0.5) {
        return res.status(403).json({ error: 'Security validation failed.' });
    }

    const finalCleanNumber = phoneDetails.formattedNumber;
    
    // 3. Generate the 6-Digit Code
    const plainOtp = generateNumericOtp();
    const otpHash = hashData(plainOtp);

    // 2. Clear out any existing OTPs for this specific phone number
    await Otp.deleteMany({ rawPhoneNumber });

    try {
        // 4. Save to MongoDB (TTL index handles the 5-minute auto-deletion automatically)
        await Otp.create({
            phoneNumber: finalCleanNumber,
            otpHash: otpHash
        });

        // 5. Build Meta Cloud API Payload
        const WHATSAPP_PHONE_ID = process.env.WHATSAPP_PHONE_ID;
        const META_ACCESS_TOKEN = process.env.META_ACCESS_TOKEN;

        const metaUrl = `https://graph.facebook.com/v18.0/${WHATSAPP_PHONE_ID}/messages`;
        
        const payload = {
            messaging_product: 'whatsapp',
            to: finalCleanNumber,
            type: 'template',
            template: {
                name: "travels_otp", 
                language: {
                    code: "en" 
                },
                components: [
                    {
                        type: "body",
                        parameters: [
                            {
                                type: "text",
                                text: plainOtp // 👈 Fills {{1}} (Your 6-digit code)
                            }
                        ]
                    },
                    {
                        type: "button",
                        sub_type: "url",
                        index: "0",
                        parameters: [
                            {
                                type: "text",
                                text: plainOtp // 👈 Fills the Copy Code button
                            }
                        ]
                    }
                ]
            }
        };

        // 6. Dispatch to Meta
        await axios.post(metaUrl, payload, {
            headers: {
                'Authorization': `Bearer ${META_ACCESS_TOKEN}`,
                'Content-Type': 'application/json'
            }
        });

        return res.status(200).json({ 
            success: true, 
            message: 'Verification token successfully dispatched via WhatsApp.' 
        });

    } catch (error: any) {
        console.error('OTP Execution Error:', error.response?.data || error.message);
        return res.status(500).json({ error: 'Failed to complete verification request cycle.' });
    }
};

export interface VerifyOtpRequestBody {
    rawPhoneNumber: string;
    submittedOtp: string;
    // Add the booking fields your frontend is sending
    name: string;
    pickup: string;
    drop: string;
    bookingDate: string;
    vehicleId: string;
    price: number | string;
}

export const verifyOtpController = async (
    req: Request<{}, {}, VerifyOtpRequestBody>,
    res: Response
): Promise<Response> => {
    const { 
        rawPhoneNumber, 
        submittedOtp, 
        name, 
        pickup, 
        drop, 
        bookingDate, 
        vehicleId, 
        price 
    } = req.body;

    if (!rawPhoneNumber || !submittedOtp) {
        return res.status(400).json({ error: 'Missing phone number or verification code.' });
    }

    // Normalize incoming input string to match database formatting
    const phoneDetails = sanitizeAndValidatePhone(rawPhoneNumber);
    if (!phoneDetails.isValid || !phoneDetails.formattedNumber) {
        return res.status(400).json({ error: 'Invalid phone identifier format.' });
    }

    const hashedInput = hashData(submittedOtp.trim());

    try {
        // Query MongoDB for the match
        const record = await Otp.findOne({
            phoneNumber: phoneDetails.formattedNumber,
            otpHash: hashedInput
        });

        // If no match is found, it means the token was incorrect OR automatically destroyed by the 5-minute TTL!
        if (!record) {
            return res.status(400).json({ error: 'Verification code is invalid or has expired.' });
        }

        // Token matches perfectly! Instantly delete the record manually so it can never be reused.
        await Otp.deleteOne({ _id: record._id });

        // TODO: Generate and sign a JWT authentication token here for your user session management

        const confirmedBooking = {
            name,
            phone: phoneDetails.formattedNumber,
            pickup,
            drop,
            bookingDate,
            vehicleId,
            price
        };

        // 4. Fire the WhatsApp Alert
        // Note: Because you are deploying to Vercel (Serverless), we MUST use 'await' here.
        // If we don't await it, Vercel will kill the function the moment res.status(200) is sent, 
        // and the WhatsApp message might get cancelled mid-flight.
        await notifyAdmin(confirmedBooking);
        
        return res.status(200).json({
            success: true,
            message: 'Identity authenticated successfully. Driver will be assigned.'
        });

    } catch (error) {
        return res.status(500).json({ error: 'Internal server exception checking validation token.' });
    }
};

export const verifyWebhookController = (req: Request, res: Response) => {
    // This is the secret password you will type into the Meta dashboard in Step 3
    const VERIFY_TOKEN = 'prathamesh_secure_webhook_123'; 

    // Parse params from the webhook verification request
    const mode = req.query['hub.mode'] as string;
    const token = req.query['hub.verify_token'] as string;
    const challenge = req.query['hub.challenge'] as string;

    // Check if a token and mode were sent
    if (mode && token) {
        // Check the mode and token sent are correct
        if (mode === 'subscribe' && token === VERIFY_TOKEN) {
            console.log('✅ Webhook verified by Meta!');
            // Respond with 200 OK and challenge token from the request
            res.status(200).send(challenge);
        } else {
            // Responds with '403 Forbidden' if verify tokens do not match
            console.error('❌ Webhook verification failed: Token mismatch.');
            res.sendStatus(403);
        }
    } else {
        res.sendStatus(400);
    }
};