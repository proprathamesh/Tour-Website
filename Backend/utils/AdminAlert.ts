import { Request, Response } from 'express';

// Helper function to keep controllers clean
const formatDateTime = (isoDateString: string) => {
    const dateObj = new Date(isoDateString);
    return {
        formattedDate: dateObj.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
        formattedTime: dateObj.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
    };
};

// ------------------------------------------------------------------
// 1. ONE-WAY NOTIFICATION CONTROLLER
// ------------------------------------------------------------------
export const notifyAdminOneWay = async (req: Request, res: Response): Promise<Response | void> => {
    try {
        const { name, rawPhoneNumber, pickup, drop, bookingDate, pickupTime, vehicleId, price } = req.body;
        // const { formattedDate, formattedTime } = formatDateTime(bookingDate);

        const response = await fetch(`https://graph.facebook.com/v17.0/${process.env.WHATSAPP_PHONE_ID}/messages`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.META_ACCESS_TOKEN}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                messaging_product: 'whatsapp',
                to: '918767370132',
                type: 'template',
                template: {
                    name: 'travels_customer_booking_confirmation_oneway',
                    language: { code: 'en' },
                    components: [{
                        type: 'body',
                        parameters: [
                            { type: 'text', text: `${name}, ${rawPhoneNumber}` },                  // {{1}}
                            { type: 'text', text: pickup },                // {{2}}
                            { type: 'text', text: drop },                  // {{3}}
                            { type: 'text', text: bookingDate },         // {{4}}
                            { type: 'text', text: pickupTime },         // {{5}}
                            { type: 'text', text: vehicleId },             // {{6}}
                            { type: 'text', text: String(price) }          // {{7}}
                        ]
                    }]
                }
            })
        });

        if (!response.ok) throw new Error(await response.text());

        return res.status(200).json({ success: true, message: 'OTP Verified. One-Way booking confirmed!' });
    } catch (error) {
        console.error('One-Way Notification Error:', error);
        return res.status(500).json({ success: false, message: 'Booking verified, but failed to send WhatsApp receipt.' });
    }
};

// ------------------------------------------------------------------
// 2. ROUND-TRIP NOTIFICATION CONTROLLER
// ------------------------------------------------------------------
export const notifyAdminRoundTrip = async (req: Request, res: Response): Promise<Response | void> => {
    try {
        // Includes the extra variables required for round trips
        const { name, rawPhoneNumber, pickup, drop, bookingDate, pickupTime, duration, vehicleId, kmLimit, baseFare, extraKmRate } = req.body;
        // const { formattedDate, formattedTime } = formatDateTime(bookingDate);

        const response = await fetch(`https://graph.facebook.com/v17.0/${process.env.WHATSAPP_PHONE_ID}/messages`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.META_ACCESS_TOKEN}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                messaging_product: 'whatsapp',
                to: '918767370132',
                type: 'template',
                template: {
                    name: 'travels_customer_booking_confirmation_round',
                    language: { code: 'en' },
                    components: [{
                        type: 'body',
                        parameters: [
                            { type: 'text', text: `${name}, ${rawPhoneNumber}` },                  // {{1}}
                            { type: 'text', text: pickup },                // {{2}}
                            { type: 'text', text: drop },                  // {{3}}
                            { type: 'text', text: bookingDate },         // {{4}}
                            { type: 'text', text: pickupTime },         // {{5}}
                            { type: 'text', text: String(duration) },      // {{6}}
                            { type: 'text', text: vehicleId },             // {{7}}
                            { type: 'text', text: String(kmLimit) },       // {{8}}
                            { type: 'text', text: String(baseFare) },      // {{9}}
                            { type: 'text', text: String(extraKmRate) }    // {{10}}
                        ]
                    }]
                }
            })
        });

        if (!response.ok) throw new Error(await response.text());

        return res.status(200).json({ success: true, message: 'OTP Verified. Round-Trip booking confirmed!' });
    } catch (error) {
        console.error('Round-Trip Notification Error:', error);
        return res.status(500).json({ success: false, message: 'Booking verified, but failed to send WhatsApp receipt.' });
    }
};

// ------------------------------------------------------------------
// 3. LOCAL RENTAL NOTIFICATION CONTROLLER
// ------------------------------------------------------------------
export const notifyAdminLocal = async (req: Request, res: Response): Promise<Response | void> => {
    try {
        // Includes the extra variables for local packages
        const { name, rawPhoneNumber, city, packageType, bookingDate, pickupTime, vehicleId, baseFare, extraKmRate, extraHrRate } = req.body;
        // const { formattedDate, formattedTime } = formatDateTime(bookingDate);

        const response = await fetch(`https://graph.facebook.com/v17.0/${process.env.WHATSAPP_PHONE_ID}/messages`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.META_ACCESS_TOKEN}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                messaging_product: 'whatsapp',
                to: '918767370132',
                type: 'template',
                template: {
                    name: 'travels_customer_booking_confirmation_local',
                    language: { code: 'en' },
                    components: [{
                        type: 'body',
                        parameters: [
                            { type: 'text', text: `${name}, ${rawPhoneNumber}` },                  // {{1}}
                            { type: 'text', text: city },                  // {{2}}
                            { type: 'text', text: packageType },           // {{3}}
                            { type: 'text', text: bookingDate },         // {{4}}
                            { type: 'text', text: pickupTime },         // {{5}}
                            { type: 'text', text: vehicleId },             // {{6}}
                            { type: 'text', text: String(baseFare) },      // {{7}}
                            { type: 'text', text: String(extraKmRate) },   // {{8}}
                            { type: 'text', text: String(extraHrRate) }    // {{9}}
                        ]
                    }]
                }
            })
        });

        if (!response.ok) throw new Error(await response.text());

        return res.status(200).json({ success: true, message: 'OTP Verified. Local Rental booking confirmed!' });
    } catch (error) {
        console.error('Local Notification Error:', error);
        return res.status(500).json({ success: false, message: 'Booking verified, but failed to send WhatsApp receipt.' });
    }
};