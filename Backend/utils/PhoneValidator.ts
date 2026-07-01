import { PhoneNumberUtil, PhoneNumberFormat, PhoneNumber } from 'google-libphonenumber';

const phoneUtil = PhoneNumberUtil.getInstance();

interface ValidationResult {
    isValid: boolean;
    formattedNumber: string | null;
    countryCode: string | null;
}

/**
 * Validates and normalizes an incoming phone number string.
 * Handles missing country codes gracefully by defaulting to India (+91) if appropriate.
 */
export const sanitizeAndValidatePhone = (rawNumber: string): ValidationResult => {
    try {
        let inputNumber: string = rawNumber.trim();
        
        if (!inputNumber.startsWith('+')) {
            if (inputNumber.length === 10) {
                inputNumber = '+91' + inputNumber;
            } else if (inputNumber.length === 12 && inputNumber.startsWith('91')) {
                inputNumber = '+' + inputNumber;
            } else {
                inputNumber = '+' + inputNumber;
            }
        }

        const numberProto: PhoneNumber = phoneUtil.parseAndKeepRawInput(inputNumber);
        const isValid: boolean = phoneUtil.isValidNumber(numberProto);
        const countryCode: string | null = phoneUtil.getRegionCodeForNumber(numberProto) || null;
        
        // Format to E.164 standard required by Meta API (e.g., +919876543210)
        const formattedNumber: string = phoneUtil.format(numberProto, PhoneNumberFormat.E164);

        return {
            isValid,
            // Strip the '+' sign since the Meta Graph API natively expects raw numerical strings
            formattedNumber: formattedNumber.replace('+', ''),
            countryCode
        };
    } catch (error) {
        return { isValid: false, formattedNumber: null, countryCode: null };
    }
};