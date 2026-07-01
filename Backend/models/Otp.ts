import { Schema, model, Document } from 'mongoose';

// 1. Define an interface representing the document structure in MongoDB
export interface IOtp extends Document {
    phoneNumber: string;
    otpHash: string;
    createdAt: Date;
}

// 2. Create the Schema corresponding to the document interface
const otpSchema = new Schema<IOtp>({
    phoneNumber: {
        type: String,
        required: true,
        trim: true
    },
    otpHash: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 300 // 300 seconds = 5 minutes. MongoDB handles auto-deletion in the background!
    }
});

// 3. Optimize lookup performance by indexing the phoneNumber field
otpSchema.index({ phoneNumber: 1 });

// 4. Create and export the strongly-typed Mongoose model
const Otp = model<IOtp>('Otp', otpSchema);

export default Otp;