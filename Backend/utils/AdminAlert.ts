// utils/adminAlert.js

const notifyAdmin = async (bookingData: any) => {
    try {
        const adminNumber = process.env.ADMIN_PHONE_NUMBER;
        
        // 1. Format a clean, highly readable WhatsApp message
        const messageBody = 
            `🚨 *NEW RIDE ENQUIRY* 🚨\n\n` +
            `👤 *Customer:* ${bookingData.name}\n` +
            `📞 *Phone:* +${bookingData.phone}\n` +
            `🛣️ *Route:* ${bookingData.pickup} ➔ ${bookingData.drop}\n` +
            `📅 *Date:* ${bookingData.bookingDate}\n` +
            `🚘 *Vehicle:* ${bookingData.vehicleId}\n` +
            `💸 *Quoted Fare:* ₹${bookingData.price}\n\n` +
            `👉 *Tap to Call:* wa.me/${bookingData.phone}`;

        // 2. Fire the request to your WhatsApp Provider (e.g., Meta API)
        // Replace this URL and headers with the exact ones you used in your OTP route
        const WHATSAPP_PHONE_ID = process.env.WHATSAPP_PHONE_ID;
        const response = await fetch(`https://graph.facebook.com/v18.0/${WHATSAPP_PHONE_ID}/messages`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.WHATSAPP_API_TOKEN}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                messaging_product: 'whatsapp',
                to: adminNumber,
                type: 'text',
                text: { 
                    body: messageBody 
                }
            })
        });

        if (!response.ok) {
            console.error('Failed to send Admin Alert:', await response.text());
        } else {
            console.log('Admin alert dispatched successfully.');
        }

    } catch (error) {
        // We log the error but DO NOT crash the app. 
        // The customer should still see "Success" even if the admin alert fails.
        console.error('Admin Alert System Failure:', error);
    }
};

module.exports = { notifyAdmin };