import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TextInput, Pressable, ActivityIndicator, Alert, Platform, KeyboardAvoidingView, ScrollView, FlatList, Animated } from 'react-native';

interface CheckoutModalProps {
    visible: boolean;
    onClose: () => void;
    
    tripType: 'one-way' | 'round-trip' | 'local' | string;
    pickup: string;
    drop: string;
    vehicleId: string;
    finalPrice: number | string;
    
    bookingDate?: string;
    duration?: number;
    packageType?: string;
    extraKmRate?: number;
}

const countryList = [
    { name: 'India', code: '+91', flag: '🇮🇳' },
    { name: 'US / Canada', code: '+1', flag: '🇺🇸' },
    { name: 'UK', code: '+44', flag: '🇬🇧' },
    { name: 'UAE', code: '+971', flag: '🇦🇪' },
    { name: 'Australia', code: '+61', flag: '🇦🇺' },
    { name: 'Singapore', code: '+65', flag: '🇸🇬' },
    { name: 'Germany', code: '+49', flag: '🇩🇪' },
];

export default function CheckoutModal(props: CheckoutModalProps) {
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [countryCode, setCountryCode] = useState('+91');
    const [otp, setOtp] = useState('');
    const [step, setStep] = useState<'details' | 'otp' | 'success'>('details');
    const [isLoading, setIsLoading] = useState(false);
    
    const [errors, setErrors] = useState({ name: '', phone: '', otp: '', general: '' });
    
    const [isNameFocused, setIsNameFocused] = useState(false);
    const [isPhoneFocused, setIsPhoneFocused] = useState(false);
    const [showCountryPicker, setShowCountryPicker] = useState(false);
    
    const tickScale = useState(new Animated.Value(0))[0];
    const successOpacity = useState(new Animated.Value(0))[0];

    const BACKEND_IP = process.env.EXPO_PUBLIC_API_URL || 'localhost'; 

    useEffect(() => {
        if (step === 'success') {
            Animated.parallel([
                Animated.timing(successOpacity, { toValue: 1, duration: 300, useNativeDriver: true }),
                Animated.spring(tickScale, { toValue: 1, friction: 4, tension: 40, useNativeDriver: true })
            ]).start(() => {
                setTimeout(() => {
                    props.onClose();
                    setStep('details');
                    setOtp('');
                    setErrors({ name: '', phone: '', otp: '', general: '' });
                }, 2500);
            });
        }
    }, [step]);

    const handleRequestOtp = async () => {
        setErrors({ name: '', phone: '', otp: '', general: '' });
        let hasError = false;

        if (!name.trim()) {
            setErrors(prev => ({ ...prev, name: 'Passenger name is required' }));
            hasError = true;
        }
        if (phone.length < 8) {
            setErrors(prev => ({ ...prev, phone: 'Enter a valid phone number' }));
            hasError = true;
        }

        if (hasError) return;

        setIsLoading(true);
        try {
            const response = await fetch(`${BACKEND_IP}/api/auth/request-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ rawPhoneNumber: `${countryCode}${phone}` })
            });
            const data = await response.json();
            
            if (data.success) { 
                setStep('otp');
            } else {
                setErrors(prev => ({ ...prev, general: data.message || "Failed to send OTP. Please check your number." }));
            }
        } catch (error) {
            setErrors(prev => ({ ...prev, general: "Network error. Could not connect to server." }));
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyAndBook = async () => {
        setErrors(prev => ({ ...prev, otp: '', general: '' }));

        if (otp.length != 4) {
            setErrors(prev => ({ ...prev, otp: 'Please enter the 4-digit OTP' }));
            return;
        }
        setIsLoading(true);

        let endpoint = '';
        if (props.tripType === 'one-way') endpoint = '/notify-oneway';
        else if (props.tripType === 'round-trip') endpoint = '/notify-roundtrip';
        else if (props.tripType === 'local') endpoint = '/notify-local';

        const payload = {
            rawPhoneNumber: `${countryCode}${phone}`,
            submittedOtp: otp,
            name: name,
            pickup: props.pickup,
            drop: props.drop,
            bookingDate: props.bookingDate || new Date().toISOString(),
            vehicleId: props.vehicleId,
            price: props.finalPrice,
            duration: props.duration,
            city: props.pickup, 
            packageType: props.packageType,
            baseFare: props.finalPrice, 
            extraKmRate: props.extraKmRate,
            kmLimit: props.duration ? props.duration * 300 : undefined 
        };

        try { 
            const response = await fetch(`${BACKEND_IP}/api/notify${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const data = await response.json();
            
            if (data.success) {
                setStep('success'); 
            } else {
                setErrors(prev => ({ ...prev, otp: data.message || "Invalid OTP entered." }));
            }
        } catch (error) {
            setErrors(prev => ({ ...prev, general: "Network error. Could not process booking." }));
        } finally {
            setIsLoading(false);
        }
    };

    const getTripRouteString = () => {
        if (props.tripType === 'local') return `Local in ${props.pickup}`;
        return `${props.pickup} ➔ ${props.drop}`;
    };

    return (
        <Modal visible={props.visible} animationType="slide" transparent={true} onRequestClose={props.onClose}>
            <View style={styles.overlay}>
                <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.keyboardAvoidWrapper}>
                    <View style={styles.modalContent}>
                        
                        {step !== 'success' && (
                            <View style={styles.dragHandleContainer}>
                                <View style={styles.dragHandle} />
                            </View>
                        )}
                        
                        {step !== 'success' && (
                            <View style={styles.header}>
                                <Text style={styles.title}>🔒 Secure Checkout</Text>
                                <Pressable onPress={props.onClose} style={styles.closeBtnArea}>
                                    <Text style={styles.closeBtnText}>✕</Text>
                                </Pressable>
                            </View>
                        )}

                        {step === 'success' ? (
                            <Animated.View style={[styles.successContainer, { opacity: successOpacity }]}>
                                <Animated.View style={[styles.successCircle, { transform: [{ scale: tickScale }] }]}>
                                    <Text style={styles.successTickIcon}>✓</Text>
                                </Animated.View>
                                <Text style={styles.successHeading}>Booking Confirmed!</Text>
                                <Text style={styles.successSubtext}>Your digital trip itinerary and receipt parameters are flying to your WhatsApp number right now.</Text>
                            </Animated.View>
                        ) : (
                            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                                
                                <View style={styles.receiptCard}>
                                    <View style={styles.receiptRow}>
                                        <Text style={styles.receiptLabel}>Vehicle</Text>
                                        <Text style={styles.receiptValue}>{props.vehicleId}</Text>
                                    </View>
                                    <View style={styles.receiptRow}>
                                        <Text style={styles.receiptLabel}>Route</Text>
                                        <Text style={styles.receiptValue} numberOfLines={1}>{getTripRouteString()}</Text>
                                    </View>
                                    <View style={[styles.receiptRow, styles.receiptTotalRow]}>
                                        <Text style={styles.receiptTotalLabel}>Total Amount</Text>
                                        <Text style={styles.receiptTotalValue}>₹{props.finalPrice.toLocaleString()}</Text>
                                    </View>
                                </View>

                                {errors.general ? (
                                    <View style={styles.generalErrorBox}>
                                        <Text style={styles.generalErrorText}>⚠️ {errors.general}</Text>
                                    </View>
                                ) : null}

                                {step === 'details' ? (
                                    <View style={styles.formContainer}>
                                        <View style={styles.inputGroup}>
                                            <Text style={styles.label}>Passenger Name</Text>
                                            <TextInput 
                                                style={[
                                                    styles.input, 
                                                    isNameFocused && styles.inputFocused,
                                                    errors.name ? styles.inputError : null
                                                ]} 
                                                placeholder="e.g. Rahul Sharma" 
                                                placeholderTextColor="#94A3B8"
                                                value={name} 
                                                onChangeText={(text) => {
                                                    setName(text);
                                                    if(errors.name) setErrors(prev => ({ ...prev, name: '' }));
                                                }} 
                                                onFocus={() => setIsNameFocused(true)}
                                                onBlur={() => setIsNameFocused(false)}
                                            />
                                            {errors.name ? <Text style={styles.errorText}>{errors.name}</Text> : null}
                                        </View>
                                        
                                        <View style={styles.inputGroup}>
                                            <Text style={styles.label}>WhatsApp Number <Text style={styles.asterisk}>*</Text></Text>
                                            <View style={[
                                                styles.phoneInputContainer, 
                                                isPhoneFocused && styles.inputFocused,
                                                errors.phone ? styles.inputError : null
                                            ]}>
                                                <Pressable style={styles.countryCodeBadge} onPress={() => setShowCountryPicker(true)}>
                                                    <Text style={styles.countryCodeText}>{countryCode}</Text>
                                                    <Text style={styles.dropdownArrow}>▼</Text>
                                                </Pressable>
                                                <TextInput 
                                                    style={styles.phoneInput} 
                                                    placeholder="98765 43210" 
                                                    placeholderTextColor="#94A3B8"
                                                    keyboardType="number-pad"
                                                    maxLength={15}
                                                    value={phone} 
                                                    onChangeText={(text) => {
                                                        setPhone(text);
                                                        if(errors.phone) setErrors(prev => ({ ...prev, phone: '' }));
                                                    }} 
                                                    onFocus={() => setIsPhoneFocused(true)}
                                                    onBlur={() => setIsPhoneFocused(false)}
                                                />
                                            </View>
                                            {errors.phone ? <Text style={styles.errorText}>{errors.phone}</Text> : null}
                                        </View>

                                        <Pressable style={styles.primaryBtn} onPress={handleRequestOtp} disabled={isLoading}>
                                            {isLoading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.primaryBtnText}>Send OTP via WhatsApp</Text>}
                                        </Pressable>
                                    </View>
                                ) : (
                                    <View style={styles.formContainer}>
                                        
                                        {/* 🚀 UPDATED: Detailed Trip Summary instead of Name/Phone */}
                                        <View style={styles.reviewPanelCard}>
                                            <View style={styles.reviewHeaderRow}>
                                                <Text style={styles.reviewTitleText}>Final Trip Summary</Text>
                                                <Pressable onPress={props.onClose}>
                                                    <Text style={styles.reviewEditText}>Edit Search</Text>
                                                </Pressable>
                                            </View>
                                            <View style={styles.reviewContentGrid}>
                                                {props.bookingDate && (
                                                    <Text style={styles.reviewDataText} numberOfLines={1}>📅 Date: <Text style={styles.darkText}>{props.bookingDate}</Text></Text>
                                                )}
                                                <Text style={styles.reviewDataText} numberOfLines={1}>📍 Pickup: <Text style={styles.darkText}>{props.pickup}</Text></Text>
                                                {props.tripType !== 'local' && (
                                                    <Text style={styles.reviewDataText} numberOfLines={1}>🏁 Drop: <Text style={styles.darkText}>{props.drop}</Text></Text>
                                                )}
                                                {props.tripType === 'round-trip' && props.duration && (
                                                    <Text style={styles.reviewDataText}>⏳ Duration: <Text style={styles.darkText}>{props.duration} {props.duration === 1 ? 'Day' : 'Days'}</Text></Text>
                                                )}
                                                {props.tripType === 'local' && props.packageType && (
                                                    <Text style={styles.reviewDataText}>📦 Package: <Text style={styles.darkText}>{String(props.packageType).replace('-', ' / ')}</Text></Text>
                                                )}
                                            </View>
                                        </View>

                                        <View style={styles.otpIconContainer}>
                                            <Text style={styles.otpIcon}>💬</Text>
                                        </View>
                                        <Text style={styles.otpHeading}>Verify your number</Text>
                                        <Text style={styles.subLabel}>Enter the security verification pin sent to your phone</Text>
                                        
                                        <TextInput 
                                            style={[
                                                styles.otpInputBox,
                                                errors.otp ? styles.inputError : null
                                            ]} 
                                            placeholder="• • • •" 
                                            placeholderTextColor="#CBD5E1"
                                            keyboardType="number-pad"
                                            maxLength={4} 
                                            value={otp} 
                                            onChangeText={(text) => {
                                                setOtp(text);
                                                if(errors.otp) setErrors(prev => ({ ...prev, otp: '' }));
                                            }} 
                                            autoFocus
                                        />
                                        {errors.otp ? <Text style={[styles.errorText, {textAlign: 'center', marginTop: -16, marginBottom: 16}]}>{errors.otp}</Text> : null}

                                        <Pressable style={styles.primaryBtn} onPress={handleVerifyAndBook} disabled={isLoading}>
                                            {isLoading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.primaryBtnText}>Confirm Booking</Text>}
                                        </Pressable>
                                        
                                        <Pressable style={styles.secondaryBtn} onPress={() => {
                                            setStep('details');
                                            setOtp('');
                                        }} disabled={isLoading}>
                                            <Text style={styles.secondaryBtnText}>Incorrect number? Go back</Text>
                                        </Pressable>
                                    </View>
                                )}
                            </ScrollView>
                        )}
                    </View>
                </KeyboardAvoidingView>
            </View>

            <Modal visible={showCountryPicker} animationType="fade" transparent={true} onRequestClose={() => setShowCountryPicker(false)}>
                <Pressable style={styles.pickerOverlay} onPress={() => setShowCountryPicker(false)}>
                    <View style={styles.pickerContainer}>
                        <Text style={styles.pickerTitle}>Select Country Code</Text>
                        <FlatList
                            data={countryList}
                            keyExtractor={(item) => item.code}
                            renderItem={({ item }) => (
                                <Pressable 
                                    style={styles.pickerItem} 
                                    onPress={() => {
                                        setCountryCode(item.code);
                                        setShowCountryPicker(false);
                                    }}
                                >
                                    <View style={styles.pickerItemLeft}>
                                        <Text style={styles.pickerFlag}>{item.flag}</Text>
                                        <Text style={styles.pickerItemName}>{item.name}</Text>
                                    </View>
                                    <Text style={styles.pickerItemCode}>{item.code}</Text>
                                </Pressable>
                            )}
                        />
                    </View>
                </Pressable>
            </Modal>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.75)', justifyContent: 'flex-end' },
    keyboardAvoidWrapper: { flex: 1, justifyContent: 'flex-end' },
    modalContent: { 
        backgroundColor: '#FFFFFF', 
        borderTopLeftRadius: 28, 
        borderTopRightRadius: 28, 
        paddingHorizontal: 24,
        paddingBottom: Platform.OS === 'ios' ? 50 : 30,
        maxHeight: '92%'
    },
    scrollContent: { paddingBottom: 20 },
    
    dragHandleContainer: { alignItems: 'center', paddingTop: 12, paddingBottom: 16 },
    dragHandle: { width: 40, height: 5, backgroundColor: '#E2E8F0', borderRadius: 10 },
    
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    title: { fontSize: 22, fontWeight: '800', color: '#0F172A', letterSpacing: -0.5 },
    closeBtnArea: { padding: 8, backgroundColor: '#F1F5F9', borderRadius: 20 },
    closeBtnText: { fontSize: 16, color: '#64748B', fontWeight: '800', lineHeight: 18 },
    
    receiptCard: { backgroundColor: '#F8FAFC', borderRadius: 16, padding: 20, marginBottom: 20, borderWidth: 1, borderColor: '#E2E8F0', borderStyle: 'dashed' },
    receiptRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
    receiptLabel: { fontSize: 14, color: '#64748B', fontWeight: '500' },
    receiptValue: { fontSize: 14, color: '#0F172A', fontWeight: '700', maxWidth: '60%', textAlign: 'right' },
    receiptTotalRow: { marginTop: 8, paddingTop: 16, borderTopWidth: 1, borderTopColor: '#E2E8F0', marginBottom: 0 },
    receiptTotalLabel: { fontSize: 16, color: '#0F172A', fontWeight: '700' },
    receiptTotalValue: { fontSize: 20, color: '#2563EB', fontWeight: '900' },
    
    reviewPanelCard: { backgroundColor: '#F1F5F9', borderRadius: 14, padding: 16, marginBottom: 20, borderWidth: 1, borderColor: '#E2E8F0' },
    reviewHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, paddingBottom: 8, borderBottomWidth: 1, borderBottomColor: '#CBD5E1' },
    reviewTitleText: { fontSize: 14, fontWeight: '800', color: '#334155', textTransform: 'uppercase', letterSpacing: 0.5 },
    reviewEditText: { fontSize: 13, fontWeight: '700', color: '#2563EB' },
    reviewContentGrid: { gap: 6 },
    reviewDataText: { fontSize: 14, color: '#64748B', fontWeight: '500' },
    darkText: { color: '#0F172A', fontWeight: '700' },

    inputError: { borderColor: '#EF4444', backgroundColor: '#FEF2F2' },
    errorText: { color: '#EF4444', fontSize: 13, fontWeight: '600', marginTop: 4, marginLeft: 4 },
    generalErrorBox: { backgroundColor: '#FEF2F2', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#FECACA', marginBottom: 16 },
    generalErrorText: { color: '#B91C1C', fontSize: 14, fontWeight: '600', textAlign: 'center' },

    formContainer: { gap: 4 },
    inputGroup: { marginBottom: 16 },
    label: { fontSize: 14, fontWeight: '600', color: '#334155', marginBottom: 8 },
    asterisk: { color: '#EF4444' },
    
    input: { backgroundColor: '#FFFFFF', borderWidth: 1.5, borderColor: '#E2E8F0', borderRadius: 12, padding: 16, fontSize: 16, color: '#0F172A' },
    inputFocused: { borderColor: '#2563EB', backgroundColor: '#F0F9FF' },
    
    phoneInputContainer: { flexDirection: 'row', backgroundColor: '#FFFFFF', borderWidth: 1.5, borderColor: '#E2E8F0', borderRadius: 12, overflow: 'hidden' },
    countryCodeBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC', paddingHorizontal: 16, borderRightWidth: 1.5, borderRightColor: '#E2E8F0' },
    countryCodeText: { fontSize: 16, fontWeight: '700', color: '#475569' },
    dropdownArrow: { fontSize: 10, color: '#64748B', marginLeft: 6, marginTop: 2 },
    phoneInput: { flex: 1, padding: 16, fontSize: 16, color: '#0F172A', fontWeight: '600', letterSpacing: 1 },
    
    otpIconContainer: { alignSelf: 'center', backgroundColor: '#EFF6FF', width: 52, height: 52, borderRadius: 26, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
    otpIcon: { fontSize: 24 },
    otpHeading: { fontSize: 20, fontWeight: '800', color: '#0F172A', textAlign: 'center', marginBottom: 4 },
    subLabel: { fontSize: 14, color: '#64748B', textAlign: 'center', marginBottom: 16, paddingHorizontal: 10 },
    boldText: { color: '#0F172A', fontWeight: '700' },
    otpInputBox: { backgroundColor: '#F8FAFC', borderWidth: 1.5, borderColor: '#E2E8F0', borderRadius: 16, paddingVertical: 16, fontSize: 32, color: '#0F172A', letterSpacing: 16, fontWeight: '900', textAlign: 'center', marginBottom: 20 },
    
    primaryBtn: { backgroundColor: '#0F172A', paddingVertical: 18, borderRadius: 12, alignItems: 'center' },
    primaryBtnText: { color: '#FFFFFF', fontWeight: '800', fontSize: 16, letterSpacing: 0.5 },
    
    secondaryBtn: { paddingVertical: 12, alignItems: 'center', marginTop: 4 },
    secondaryBtnText: { color: '#64748B', fontWeight: '600', fontSize: 14 },

    pickerOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
    pickerContainer: { backgroundColor: '#FFFFFF', width: '80%', borderRadius: 16, padding: 20, maxHeight: '60%' },
    pickerTitle: { fontSize: 18, fontWeight: '700', color: '#0F172A', marginBottom: 16, textAlign: 'center' },
    pickerItem: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
    pickerItemLeft: { flexDirection: 'row', alignItems: 'center' },
    pickerFlag: { fontSize: 18, marginRight: 12 },
    pickerItemName: { fontSize: 16, color: '#334155', fontWeight: '500' },
    pickerItemCode: { fontSize: 16, color: '#0F172A', fontWeight: '700' },

    successContainer: { paddingVertical: 40, alignItems: 'center', justifyContent: 'center' },
    successCircle: { width: 90, height: 90, borderRadius: 45, backgroundColor: '#10B981', alignItems: 'center', justifyContent: 'center', marginBottom: 24, shadowColor: '#10B981', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 6 },
    successTickIcon: { color: '#FFFFFF', fontSize: 44, fontWeight: 'bold', lineHeight: 48 },
    successHeading: { fontSize: 24, fontWeight: '900', color: '#0F172A', marginBottom: 12, letterSpacing: -0.3 },
    successSubtext: { fontSize: 14, color: '#64748B', textAlign: 'center', lineHeight: 22, paddingHorizontal: 16 }
});