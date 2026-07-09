import { router } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Modal, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';

interface CheckoutModalProps {
    visible: boolean;
    onClose: () => void;
}

export default function CheckoutModal({ visible, onClose }: CheckoutModalProps) {
    // Customer Details State
    const [name, setName] = useState('');
    const [countryCode, setCountryCode] = useState('+91');
    const [phone, setPhone] = useState('');

    // Native Date & Time State
    const [bookingDate, setBookingDate] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showTimePicker, setShowTimePicker] = useState(false);

    // OTP & API State
    const [isOtpSent, setIsOtpSent] = useState(false);
    const [otpCode, setOtpCode] = useState('');
    const [isBookingLoading, setIsBookingLoading] = useState(false);
    const [bookingError, setBookingError] = useState('');

    // Formatter functions for the UI
    const formattedDate = bookingDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    const formattedTime = bookingDate.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

    // Date/Time Picker Handlers
    const onDateChange = (event: any, selectedDate?: Date) => {
        if (Platform.OS === 'android') setShowDatePicker(false);
        if (selectedDate) setBookingDate(selectedDate);
    };

    const onTimeChange = (event: any, selectedDate?: Date) => {
        if (Platform.OS === 'android') setShowTimePicker(false);
        if (selectedDate) setBookingDate(selectedDate);
    };

    const handleInitiateBooking = async () => {
        if (!name || !phone) {
            setBookingError('Please fill in all details.');
            return;
        }

        setIsBookingLoading(true);
        setBookingError('');

        try {
            // Strip the '+' sign for the Meta API payload
            const cleanCountryCode = countryCode.replace('+', '');
            const fullPhoneNumber = `${countryCode}${phone}`;
            console.log('Initiating booking for:', fullPhoneNumber);

            const response = await fetch('https://prathameshtoursandtravels.vercel.app/api/auth/request-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ rawPhoneNumber: fullPhoneNumber })
            });

            const data = await response.json();
            if (response.ok) {
                setIsOtpSent(true);
            } else {
                setBookingError(data.message || 'Failed to send OTP. Try again.');
            }
        } catch (err) {
            setBookingError('Network error. Check your connection.');
            console.log('Booking initiation error:', err);
        } finally {
            setIsBookingLoading(false);
        }
    };

    const handleVerifyAndBook = async () => {
        if (otpCode.length < 4) {
            setBookingError('Please enter a valid verification code.');
            return;
        }

        setIsBookingLoading(true);
        setBookingError('');

        try {
            const cleanCountryCode = countryCode.replace('+', '');
            const fullPhoneNumber = `${cleanCountryCode}${phone}`;

            const response = await fetch('https://prathameshtoursandtravels.vercel.app/api/auth/verify-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ rawPhoneNumber: fullPhoneNumber, submittedOtp: otpCode }),
            });

            const data = await response.json();
            if (response.ok) {
                // IMPORTANT: You now have the exact Date object to save to MongoDB
                console.log("Confirmed Booking For:", bookingDate.toISOString());

                alert('Ride Confirmed successfully!');
                resetModal();
                router.push('/');
            } else {
                setBookingError(data.message || 'Invalid OTP. Please try again.');
            }
        } catch (err) {
            setBookingError('Verification failed. Please try again.');
        } finally {
            setIsBookingLoading(false);
        }
    };

    const resetModal = () => {
        setIsOtpSent(false);
        setBookingError('');
        setOtpCode('');
        onClose();
    };

    return (
        <Modal visible={visible} transparent={true} animationType="slide" onRequestClose={resetModal}>
            <View style={styles.modalOverlay}>
                <View style={styles.modalCard}>
                    <View style={styles.modalHeaderRow}>
                        <Text style={styles.modalHeading}>
                            {!isOtpSent ? 'Passenger Details' : 'Verify Your Mobile'}
                        </Text>
                        <Pressable onPress={resetModal}>
                            <Text style={styles.closeButton}>✕</Text>
                        </Pressable>
                    </View>

                    {bookingError ? <Text style={styles.errorText}>{bookingError}</Text> : null}

                    {!isOtpSent ? (
                        <View style={styles.form}>
                            <View style={styles.inputWrapper}>
                                <Text style={styles.label}>Full Name</Text>
                                <TextInput style={styles.input} placeholder="John Doe" value={name} onChangeText={setName} />
                            </View>

                            {/* Split Phone Input */}
                            <View style={styles.inputWrapper}>
                                <Text style={styles.label}>Mobile Number</Text>
                                <View style={styles.phoneRow}>

                                    {/* Dropdown Container */}
                                    <View style={styles.pickerContainer}>
                                        <Picker
                                            selectedValue={countryCode}
                                            onValueChange={(itemValue) => setCountryCode(itemValue)}
                                            style={styles.picker}
                                            mode="dropdown" // Ensures a clean dropdown UI on Android
                                        >
                                            <Picker.Item label="🇮🇳 +91" value="+91" />
                                            <Picker.Item label="🇺🇸 +1" value="+1" />
                                            <Picker.Item label="🇬🇧 +44" value="+44" />
                                            <Picker.Item label="🇦🇪 +971" value="+971" />
                                        </Picker>
                                    </View>

                                    {/* Phone Input Container */}
                                    <TextInput
                                        style={[styles.input, styles.phoneNumberInput]}
                                        placeholder="10-digit number"
                                        keyboardType="phone-pad"
                                        value={phone}
                                        onChangeText={setPhone}
                                        maxLength={10}
                                    />
                                </View>
                            </View>

                            {/* Pure Web Date and Time Selectors */}
                            <View style={styles.dateTimeRow}>
                                {/* Pickup Date */}
                                <View style={[styles.inputWrapper, { flex: 1 }]}>
                                    <Text style={styles.label}>Pickup Date</Text>
                                    {/* @ts-ignore - Expo web allows native HTML inputs */}
                                    <input 
                                        type="date" 
                                        min={new Date().toISOString().split('T')[0]}
                                        value={bookingDate.toISOString().split('T')[0]}
                                        onChange={(e: any) => {
                                            if (e.target.value) setBookingDate(new Date(e.target.value));
                                        }}
                                        style={webPickerStyle}
                                    />
                                </View>

                                {/* Time */}
                                <View style={[styles.inputWrapper, { flex: 1 }]}>
                                    <Text style={styles.label}>Time</Text>
                                    {/* @ts-ignore - Expo web allows native HTML inputs */}
                                    <input 
                                        type="time" 
                                        value={bookingDate.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' })}
                                        onChange={(e: any) => {
                                            if (e.target.value) {
                                                const [hours, minutes] = e.target.value.split(':');
                                                const newDate = new Date(bookingDate);
                                                newDate.setHours(Number(hours), Number(minutes));
                                                setBookingDate(newDate);
                                            }
                                        }}
                                        style={webPickerStyle}
                                    />
                                </View>
                            </View>

                            {/* Conditionally render pickers based on OS logic */}
                            {showDatePicker && (
                                <DateTimePicker value={bookingDate} mode="date" display="default" minimumDate={new Date()} onChange={onDateChange} />
                            )}
                            {showTimePicker && (
                                <DateTimePicker value={bookingDate} mode="time" display="default" onChange={onTimeChange} />
                            )}

                            <Pressable style={styles.confirmButton} onPress={handleInitiateBooking} disabled={isBookingLoading}>
                                {isBookingLoading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.confirmButtonText}>Send OTP Verification</Text>}
                            </Pressable>
                        </View>
                    ) : (
                        <View style={styles.form}>
                            <Text style={styles.subtext}>
                                We sent a secure code to <Text style={{ fontWeight: '700' }}>{countryCode} {phone}</Text>
                            </Text>
                            <View style={styles.inputWrapper}>
                                <TextInput style={[styles.input, styles.otpInput]} placeholder="0 0 0 0 0 0" keyboardType="number-pad" maxLength={6} value={otpCode} onChangeText={setOtpCode} />
                            </View>
                            <Pressable style={styles.confirmButton} onPress={handleVerifyAndBook} disabled={isBookingLoading}>
                                {isBookingLoading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.confirmButtonText}>Verify & Book Ride</Text>}
                            </Pressable>
                            <Pressable style={styles.linkButton} onPress={() => setIsOtpSent(false)}>
                                <Text style={styles.linkText}>← Edit Contact Details</Text>
                            </Pressable>
                        </View>
                    )}
                </View>
            </View>
        </Modal>
    );
}
// Inline CSS for native web date/time inputs
const webPickerStyle: React.CSSProperties = {
    borderWidth: '1px',
    borderColor: '#CBD5E1',
    borderRadius: '8px',
    padding: '13px 14px',
    fontSize: '15px',
    backgroundColor: '#F8FAFC',
    width: '100%',
    color: '#1E293B',
    outline: 'none',
    fontFamily: 'inherit',
    cursor: 'pointer',
    boxSizing: 'border-box'
};

const styles = StyleSheet.create({
    modalOverlay: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.6)', justifyContent: 'center', alignItems: 'center', padding: 16 },
    modalCard: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 24, width: '100%', maxWidth: 420, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 20, elevation: 5 },
    modalHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
    modalHeading: { fontSize: 22, fontWeight: '700', color: '#1E293B' },
    closeButton: { fontSize: 20, color: '#64748B', fontWeight: 'bold', padding: 4 },
    subtext: { fontSize: 14, color: '#64748B', marginBottom: 20 },
    form: { gap: 16 },
    inputWrapper: { gap: 6 },
    label: { fontSize: 14, fontWeight: '600', color: '#475569' },
    input: { borderWidth: 1, borderColor: '#CBD5E1', borderRadius: 8, padding: 14, fontSize: 16, backgroundColor: '#F8FAFC' },

    // New Flex UI Styles
    phoneRow: {
        flexDirection: 'row',
        gap: 10,
        width: '100%', // Forces the row to respect the modal padding
        alignItems: 'center'
    },
    pickerContainer: {
        width: 110, // Locks the dropdown to a specific width
        height: 50, // Matches the height of the standard TextInput
        borderWidth: 1,
        borderColor: '#CBD5E1',
        borderRadius: 8,
        backgroundColor: '#F8FAFC',
        overflow: 'hidden', // Prevents the picker from bleeding over the rounded corners
        justifyContent: 'center'
    },
    picker: {
        width: '100%',
        height: '100%',
        backgroundColor: 'transparent',
        borderWidth: 0
    },
    countryCodeInput: { flex: 0.25, textAlign: 'center', fontWeight: '600' },
    phoneNumberInput: {
        flex: 1, // Automatically calculates the exact remaining safe space
        height: 50
    },
    dateTimeRow: { flexDirection: 'row', gap: 12 },
    pickerBox: { borderWidth: 1, borderColor: '#CBD5E1', borderRadius: 8, padding: 14, backgroundColor: '#F8FAFC', justifyContent: 'center' },
    pickerText: { fontSize: 15, color: '#1E293B', fontWeight: '500' },

    otpInput: { letterSpacing: 12, textAlign: 'center', fontSize: 28, fontWeight: '700' },
    confirmButton: { backgroundColor: '#208AEF', borderRadius: 8, padding: 16, alignItems: 'center', marginTop: 10 },
    confirmButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
    linkButton: { alignItems: 'center', marginTop: 10, paddingVertical: 8 },
    linkText: { color: '#64748B', fontSize: 14, fontWeight: '500' },
    errorText: { color: '#EF4444', backgroundColor: '#FEE2E2', padding: 12, borderRadius: 8, fontSize: 14, fontWeight: '600', marginBottom: 10 }
});