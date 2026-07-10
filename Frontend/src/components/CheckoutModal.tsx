import { router } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Modal, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Picker } from '@react-native-picker/picker';

interface CheckoutModalProps {
    visible: boolean;
    onClose: () => void;
    pickup: string;
    drop: string;
    vehicleId: string;
    price: number | string;
}

export default function CheckoutModal({ 
    visible, 
    onClose, 
    pickup, 
    drop, 
    vehicleId, 
    price 
}: CheckoutModalProps) {
    // Customer Details State
    const [name, setName] = useState('');
    const [countryCode, setCountryCode] = useState('+91');
    const [phone, setPhone] = useState('');

    // Native Date & Time State
    const [bookingDate, setBookingDate] = useState(new Date());

    // OTP & API State
    const [isOtpSent, setIsOtpSent] = useState(false);
    const [otpCode, setOtpCode] = useState('');
    const [isBookingLoading, setIsBookingLoading] = useState(false);
    const [bookingError, setBookingError] = useState('');

    // Formatter functions for the UI
    const formattedDate = bookingDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    const formattedTime = bookingDate.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

    const handleInitiateBooking = async () => {
        if (!name || !phone) {
            setBookingError('Please fill in all details.');
            return;
        }

        setIsBookingLoading(true);
        setBookingError('');

        try {
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
            const fullPhoneNumber = `${countryCode}${phone}`;

            const payload = {
                rawPhoneNumber: fullPhoneNumber,
                submittedOtp: otpCode,
                name: name,
                pickup: pickup,
                drop: drop,
                bookingDate: bookingDate.toISOString(), 
                vehicleId: vehicleId,
                price: price
            };

            const response = await fetch('https://prathameshtoursandtravels.vercel.app/api/auth/verify-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            const data = await response.json();
            if (response.ok) {
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
                            {!isOtpSent ? 'Passenger Details' : 'Verify & Confirm'}
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
                                    <View style={styles.pickerContainer}>
                                        <Picker
                                            selectedValue={countryCode}
                                            onValueChange={(itemValue) => setCountryCode(itemValue)}
                                            style={styles.picker}
                                            mode="dropdown"
                                        >
                                            <Picker.Item label="🇮🇳 +91" value="+91" />
                                            <Picker.Item label="🇺🇸 +1" value="+1" />
                                            <Picker.Item label="🇬🇧 +44" value="+44" />
                                            <Picker.Item label="🇦🇪 +971" value="+971" />
                                        </Picker>
                                    </View>
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
                                    {/* @ts-ignore */}
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
                                    {/* @ts-ignore */}
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

                            <Pressable style={styles.confirmButton} onPress={handleInitiateBooking} disabled={isBookingLoading}>
                                {isBookingLoading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.confirmButtonText}>Send OTP Verification</Text>}
                            </Pressable>
                        </View>
                    ) : (
                        <View style={styles.form}>
                            {/* 🚀 NEW: Booking Summary Block 🚀 */}
                            <View style={styles.summaryBox}>
                                <Text style={styles.summaryTitle}>Review Ride Details</Text>
                                
                                <View style={styles.summaryRow}>
                                    <Text style={styles.summaryLabel}>Passenger:</Text>
                                    <Text style={styles.summaryValue}>{name}</Text>
                                </View>
                                <View style={styles.summaryRow}>
                                    <Text style={styles.summaryLabel}>Route:</Text>
                                    <Text style={styles.summaryValue} numberOfLines={1}>{pickup} ➔ {drop}</Text>
                                </View>
                                <View style={styles.summaryRow}>
                                    <Text style={styles.summaryLabel}>Pickup:</Text>
                                    <Text style={styles.summaryValue}>{formattedDate} at {formattedTime}</Text>
                                </View>
                                <View style={styles.summaryRow}>
                                    <Text style={styles.summaryLabel}>Total Fare:</Text>
                                    <Text style={styles.summaryValue}>₹{price}</Text>
                                </View>
                            </View>

                            <Text style={styles.subtext}>
                                Please enter the verification code sent to <Text style={{ fontWeight: '700' }}>{countryCode} {phone}</Text>
                            </Text>
                            
                            <View style={styles.inputWrapper}>
                                <TextInput 
                                    style={[styles.input, styles.otpInput]} 
                                    placeholder="0 0 0 0 0 0" 
                                    keyboardType="number-pad" 
                                    maxLength={6} 
                                    value={otpCode} 
                                    onChangeText={setOtpCode} 
                                />
                            </View>

                            {/* 🚀 NEW: Dual Action Buttons (Back & Verify) 🚀 */}
                            <View style={styles.actionRow}>
                                <Pressable 
                                    style={styles.backButton} 
                                    onPress={() => setIsOtpSent(false)} 
                                    disabled={isBookingLoading}
                                >
                                    <Text style={styles.backButtonText}>Back</Text>
                                </Pressable>

                                <Pressable 
                                    style={styles.verifyButton} 
                                    onPress={handleVerifyAndBook} 
                                    disabled={isBookingLoading}
                                >
                                    {isBookingLoading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.confirmButtonText}>Verify & Book</Text>}
                                </Pressable>
                            </View>
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
    
    phoneRow: { flexDirection: 'row', gap: 10, width: '100%', alignItems: 'center' },
    pickerContainer: { width: 110, height: 50, borderWidth: 1, borderColor: '#CBD5E1', borderRadius: 8, backgroundColor: '#F8FAFC', overflow: 'hidden', justifyContent: 'center' },
    picker: { width: '100%', height: '100%', backgroundColor: 'transparent', borderWidth: 0 },
    phoneNumberInput: { flex: 1, height: 50 },
    dateTimeRow: { flexDirection: 'row', gap: 12 },
    
    // Summary Styles
    summaryBox: { backgroundColor: '#F1F5F9', borderRadius: 8, padding: 16, marginBottom: 8, borderWidth: 1, borderColor: '#E2E8F0' },
    summaryTitle: { fontSize: 13, fontWeight: '700', color: '#64748B', textTransform: 'uppercase', marginBottom: 12, letterSpacing: 0.5 },
    summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8, alignItems: 'center' },
    summaryLabel: { fontSize: 14, color: '#475569', flex: 0.35 },
    summaryValue: { fontSize: 14, color: '#1E293B', fontWeight: '600', flex: 0.65, textAlign: 'right' },

    otpInput: { letterSpacing: 12, textAlign: 'center', fontSize: 28, fontWeight: '700' },
    
    confirmButton: { backgroundColor: '#208AEF', borderRadius: 8, padding: 16, alignItems: 'center', marginTop: 10 },
    confirmButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
    
    // Dual Action Row Styles
    actionRow: { flexDirection: 'row', gap: 12, marginTop: 10 },
    backButton: { flex: 0.35, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#CBD5E1', borderRadius: 8, alignItems: 'center', justifyContent: 'center', paddingVertical: 16 },
    backButtonText: { color: '#475569', fontSize: 16, fontWeight: '700' },
    verifyButton: { flex: 0.65, backgroundColor: '#208AEF', borderRadius: 8, paddingVertical: 16, alignItems: 'center', justifyContent: 'center' },
    
    errorText: { color: '#EF4444', backgroundColor: '#FEE2E2', padding: 12, borderRadius: 8, fontSize: 14, fontWeight: '600', marginBottom: 10 }
});