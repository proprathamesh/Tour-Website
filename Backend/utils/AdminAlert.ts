// utils/adminAlert.js

const notifyAdmin = async (bookingData: any) => {
    try {
        const adminNumber = process.env.ADMIN_PHONE_NUMBER;
        
        // 1. Format the raw ISO string into readable Date and Time
        const dateObj = new Date(bookingData.bookingDate);
        const formattedDate = dateObj.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
        const formattedTime = dateObj.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

        // 2. Point to the Meta API
        const WHATSAPP_PHONE_ID = process.env.WHATSAPP_PHONE_ID;
        const META_ACCESS_TOKEN = process.env.META_ACCESS_TOKEN;

        const response = await fetch(`https://graph.facebook.com/v18.0/${WHATSAPP_PHONE_ID}/messages`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${META_ACCESS_TOKEN}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                messaging_product: 'whatsapp',
                to: adminNumber,
                type: 'template',
                template: {
                    name: 'admin_alert', 
                    language: {
                        code: 'en'
                    },
                    components: [
                        {
                            type: 'body',
                            parameters: [
                                { type: 'text', text: bookingData.name },               // {{1}}
                                { type: 'text', text: bookingData.phone },              // {{2}}
                                { type: 'text', text: bookingData.pickup },             // {{3}}
                                { type: 'text', text: bookingData.drop },               // {{4}}
                                { type: 'text', text: formattedDate },                  // {{5}} The clean date
                                { type: 'text', text: formattedTime },                  // {{6}} The clean time
                                { type: 'text', text: bookingData.vehicleId },          // {{7}}
                                { type: 'text', text: String(bookingData.price) },      // {{8}} 
                                { type: 'text', text: bookingData.phone }               // {{9}} 
                            ]
                        }
                    ]
                }
            })
        });

        if (!response.ok) {
            console.error('Failed to send Admin Template Alert:', await response.text());
        } else {
            console.log('Admin template alert dispatched successfully.');
        }

    } catch (error) {
        console.error('Admin Alert System Failure:', error);
    }
};

module.exports = { notifyAdmin };

module.exports = { notifyAdmin };