import { useLocalSearchParams, router } from 'expo-router';
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Image, useWindowDimensions, Platform } from 'react-native';

import vehicleModelsData from '../../utils/carDets.json';
import oneWayRoutesData from '../../utils/routeData.json';
import { vehicleImages } from '../../utils/imageMap';
import CheckoutModal from '@/components/CheckoutModal';

export default function QuoteScreen() {
    const { tripType, pickup, drop, startDate, package: localPackage } = useLocalSearchParams();
    const { width } = useWindowDimensions();
    const isMobile = width < 768;

    const [isModalVisible, setModalVisible] = useState(false);
    const [selectedVehicle, setSelectedVehicle] = useState<any>(null);
    const [durationDays, setDurationDays] = useState<number>(1);

    let displayVehicles: any[] = [];
    let routeDetails: any = null;

    if (tripType === 'one-way') {
        const routeKey = `${String(pickup).toLowerCase()}-to-${String(drop).toLowerCase().split(' ')[0]}`;
        const routeData = (oneWayRoutesData as any)[routeKey];
        if (routeData) {
            displayVehicles = routeData.vehicles;
            routeDetails = routeData.routeDetails;
        }
    } else {
        displayVehicles = vehicleModelsData;
    }

    const handleBookNow = (vehicle: any) => {
        setSelectedVehicle(vehicle);
        setModalVisible(true);
    };

    const getBreakdown = (vehicle: any) => {
        let price = '';
        let priceLabel = '';
        let included: string[] = [];
        let excluded: string[] = [];

        if (tripType === 'one-way') {
            price = `₹${vehicle.oneWayPackage}`;
            priceLabel = 'Fixed Fare';
            included = ['Base Fare', `Approx. ${routeDetails?.distanceKm || '...'} km route`, 'Tolls & State Taxes'];
            excluded = ['Parking', 'Multiple stops'];
        }
        else if (tripType === 'round-trip') {
            const calculatedPrice = (vehicle.pricing.roundTrip.extraKmRate * 300 * durationDays) + (500 * durationDays);
            price = `₹${calculatedPrice.toLocaleString('en-IN')}`;
            priceLabel = 'Est. Base + Driver Allowance';
            const totalKm = durationDays * 300;

            included = [`Base KM limit (${totalKm} km)`, 'Flexible routing', `Driver Allowance (₹${500 * durationDays})`];
            excluded = ['Tolls & Parking', `Extra KM (after ${totalKm}km ₹${vehicle.pricing.roundTrip.extraKmRate}/km)`];
        }
        else if (tripType === 'local') {
            const pkg = vehicle.pricing.local.packages.find((p: any) => p.packageId === localPackage);
            if (pkg) {
                price = `₹${pkg.baseFare}`;
                priceLabel = 'Package Fare';
                const formattedPkg = localPackage ? String(localPackage).replace('-', ' / ').replace('hrs', ' Hrs').replace('kms', ' Kms') : '';
                included = ['Base Fare', formattedPkg];
                excluded = [`Extra KM (₹${pkg.extraKmRate}/km)`, `Extra Hour (₹${pkg.extraHrRate}/hr)`, 'Tolls & Parking'];
            }
        }

        return { price, priceLabel, included, excluded };
    };

    const renderHeader = () => {
        const isLocal = tripType === 'local';
        return (
            <View style={styles.premiumHeader}>
                <View style={styles.headerContent}>
                    <Text style={[styles.headerTitle, isMobile && styles.headerTitleMobile]}>
                        {isLocal ? `Local Rental in ${pickup}` : `${pickup} ➔ ${drop}`}
                    </Text>
                    <View style={styles.headerBadge}>
                        <Text style={styles.headerBadgeText}>
                            {isLocal
                                ? `Package: ${String(localPackage).replace('-', ' / ')}`
                                : tripType === 'round-trip' ? `Round Trip • Starts ${startDate}` : 'One-Way Drop'}
                        </Text>
                    </View>
                </View>
            </View>
        );
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
            <Pressable onPress={() => router.back()} style={styles.backButton}>
                <Text style={styles.backText}>← Modify Search</Text>
            </Pressable>

            {renderHeader()}

            {tripType === 'round-trip' && (
                <View style={styles.durationCard}>
                    <View style={styles.durationInfo}>
                        <Text style={styles.durationLabel}>Trip Duration</Text>
                        <Text style={styles.durationSubtext}>Impacts driver allowance & base KM</Text>
                    </View>
                    <View style={styles.durationControls}>
                        <Pressable style={styles.durationBtn} onPress={() => setDurationDays(prev => Math.max(1, prev - 1))}>
                            <Text style={styles.durationBtnText}>−</Text>
                        </Pressable>
                        <View style={styles.durationValueContainer}>
                            <Text style={styles.durationValue}>{durationDays}</Text>
                            <Text style={styles.durationUnit}>{durationDays === 1 ? 'Day' : 'Days'}</Text>
                        </View>
                        <Pressable style={styles.durationBtn} onPress={() => setDurationDays(prev => prev + 1)}>
                            <Text style={styles.durationBtnText}>+</Text>
                        </Pressable>
                    </View>
                </View>
            )}

            {tripType === 'one-way' && displayVehicles.length === 0 && (
                <View style={styles.errorBox}>
                    <Text style={styles.errorText}>Sorry, we don't currently offer one-way routes from {pickup} to {drop}.</Text>
                </View>
            )}

            {displayVehicles.map((vehicle, index) => {
                const uniqueKey = vehicle.id || vehicle.vehicleId || index;
                const breakdown = getBreakdown(vehicle);

                return (
                    <View key={uniqueKey} style={styles.premiumCard}>

                        {/* 🚀 RESPONSIVE HEADER: Stacks on mobile, row on desktop */}
                        <View style={[styles.cardHeaderTop, isMobile && styles.cardHeaderTopMobile]}>

                            <View style={[styles.vehicleInfoArea, isMobile && styles.vehicleInfoAreaMobile]}>
                                <Text style={[styles.vehicleNameText, isMobile && styles.vehicleNameTextMobile]}>
                                    {vehicle.name || vehicle.models}
                                </Text>
                                <View style={[styles.tagsContainer, isMobile && styles.tagsContainerMobile]}>
                                    <View style={styles.tagPill}>
                                        <Text style={styles.tagText}>{vehicle.seats} Seater</Text>
                                    </View>
                                    {vehicle.fuel && (
                                        <View style={[styles.tagPill, styles.fuelPill]}>
                                            <Text style={[styles.tagText, styles.fuelText]}>{vehicle.fuel}</Text>
                                        </View>
                                    )}
                                </View>
                            </View>

                            {vehicleImages[vehicle.vehicleId] && (
                                <View style={[styles.imageContainer, isMobile && styles.imageContainerMobile]}>
                                    <Image
                                        source={vehicleImages[vehicle.vehicleId]}
                                        style={styles.vehicleImageRender}
                                        resizeMode="contain"
                                    />
                                </View>
                            )}
                        </View>

                        <View style={[styles.splitArea, isMobile && styles.splitAreaMobile]}>

                            {/* 🚀 FIXED: Dynamic flex applied only on desktop */}
                            <View style={[styles.priceShowcase, !isMobile && { flex: 1 }, isMobile && styles.priceShowcaseMobile]}>
                                <Text style={styles.priceAmountText}>{breakdown.price}</Text>
                                <Text style={styles.priceContextText}>{breakdown.priceLabel}</Text>
                            </View>

                            {/* 🚀 FIXED: Dynamic flex applied only on desktop */}
                            <View style={[styles.detailsSection, !isMobile && { flex: 1.5 }, isMobile && styles.detailsSectionMobile]}>

                                {/* Upgraded Included Box */}
                                <View style={[styles.featureBox, isMobile && styles.featureBoxMobile]}>
                                    <View style={styles.featureHeader}>
                                        <View style={[styles.iconBadge, styles.badgeGreen]}>
                                            <Text style={styles.iconGreen}>✓</Text>
                                        </View>
                                        <Text style={styles.headingDark}>What's Included</Text>
                                    </View>
                                    <View style={styles.featureList}>
                                        {breakdown.included.map((item, i) => (
                                            <View key={`inc-${i}`} style={styles.listItemRow}>
                                                <Text style={styles.bulletCheck}>✓</Text>
                                                {/* 🚀 FIXED: Rigid container for text wrapping */}
                                                <View style={styles.bulletTextContainer}>
                                                    <Text style={styles.bulletItemText}>{item}</Text>
                                                </View>
                                            </View>
                                        ))}
                                    </View>
                                </View>

                                {/* Upgraded Not Included Box */}
                                <View style={[styles.featureBox, isMobile && styles.featureBoxMobile]}>
                                    <View style={styles.featureHeader}>
                                        <View style={[styles.iconBadge, styles.badgeRed]}>
                                            <Text style={styles.iconRed}>✕</Text>
                                        </View>
                                        <Text style={styles.headingDark}>Not Included</Text>
                                    </View>
                                    <View style={styles.featureList}>
                                        {breakdown.excluded.map((item, i) => (
                                            <View key={`exc-${i}`} style={styles.listItemRow}>
                                                <Text style={styles.bulletCross}>✕</Text>
                                                {/* 🚀 FIXED: Rigid container for text wrapping */}
                                                <View style={styles.bulletTextContainer}>
                                                    <Text style={styles.bulletItemText}>{item}</Text>
                                                </View>
                                            </View>
                                        ))}
                                    </View>
                                </View>

                            </View>

                        </View>

                        <View style={styles.cardActionFooter}>
                            <Pressable style={styles.primaryBookBtn} onPress={() => handleBookNow(vehicle)}>
                                <Text style={styles.primaryBookBtnText}>Select & Proceed</Text>
                            </Pressable>
                        </View>
                    </View>
                );
            })}

            {selectedVehicle && (
                <CheckoutModal
                    visible={isModalVisible}
                    onClose={() => setModalVisible(false)}
                    tripType={tripType as string}
                    pickup={pickup as string}
                    drop={drop as string}
                    vehicleId={selectedVehicle.name || selectedVehicle.models}
                    finalPrice={
                        tripType === 'one-way' ? selectedVehicle.oneWayPackage :
                            tripType === 'round-trip' ? (selectedVehicle.pricing.roundTrip.extraKmRate * 300 * durationDays) + (500 * durationDays) :
                                selectedVehicle.pricing.local.packages.find((p: any) => p.packageId === localPackage)?.baseFare
                    }
                    duration={durationDays}
                    packageType={localPackage as string}
                    extraHrRate={
                        tripType === 'local' 
                            ? selectedVehicle?.pricing?.local?.packages?.find((p: any) => p.packageId === localPackage)?.extraHrRate || 0 
                            : 0
                    }
                    extraKmRate={
                        tripType === 'round-trip' ? selectedVehicle.pricing.roundTrip.extraKmRate :
                            tripType === 'local' ? selectedVehicle.pricing.local.packages.find((p: any) => p.packageId === localPackage)?.extraKmRate : 0
                    }
                />
            )}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    // 🚀 FIXED: Switched to space-between and removed hardcoded flex
    detailsSection: { flexDirection: 'row', justifyContent: 'space-between' },
    detailsSectionMobile: { flexDirection: 'column', gap: 16 },

    // 🚀 FIXED: Swapped flex:1 for percentages to fix the gap calculation bug
    featureBox: { width: '48.5%', backgroundColor: '#FFFFFF', padding: 20, borderRadius: 16, borderWidth: 1, borderColor: '#E2E8F0' },
    featureBoxMobile: { width: '100%' },

    // Sleek Headers with Icon Badges
    featureHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: '#F1F5F9', gap: 10 },
    iconBadge: { width: 28, height: 28, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
    badgeGreen: { backgroundColor: '#DCFCE7' },
    badgeRed: { backgroundColor: '#FEE2E2' },
    iconGreen: { color: '#16A34A', fontWeight: '900', fontSize: 14 },
    iconRed: { color: '#DC2626', fontWeight: '900', fontSize: 14 },
    headingDark: { color: '#0F172A', fontWeight: '800', fontSize: 16, letterSpacing: -0.2 },

    // Properly aligned bullet lists (prevents text wrapping under the bullet)
    featureList: { gap: 12 },
    listItemRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
    bulletCheck: { color: '#10B981', fontSize: 14, fontWeight: 'bold', marginTop: 2 },
    bulletCross: { color: '#EF4444', fontSize: 14, fontWeight: 'bold', marginTop: 2 },
    
    // 🚀 FIXED: New container handles the flex so text wraps properly
    bulletTextContainer: { flex: 1 },
    bulletItemText: { fontSize: 14, color: '#475569', lineHeight: 20, fontWeight: '500' },

    container: { flex: 1, backgroundColor: '#F0F4F8' },
    content: { padding: 20, maxWidth: 850, alignSelf: 'center', width: '100%', paddingBottom: 60 },
    backButton: { marginBottom: 16, alignSelf: 'flex-start' },
    backText: { color: '#3B82F6', fontSize: 15, fontWeight: '600' },

    premiumHeader: { backgroundColor: '#0F172A', borderRadius: 16, overflow: 'hidden', marginBottom: 24, ...Platform.select({ web: { boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)' } }) },
    headerContent: { padding: 24, alignItems: 'flex-start' },
    headerTitle: { color: '#FFFFFF', fontSize: 28, fontWeight: '800', letterSpacing: -0.5, marginBottom: 12 },
    headerTitleMobile: { fontSize: 24 }, // Slightly smaller font for mobile header
    headerBadge: { backgroundColor: 'rgba(255, 255, 255, 0.1)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.15)' },
    headerBadgeText: { color: '#E2E8F0', fontSize: 14, fontWeight: '600' },

    durationCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#FFFFFF', padding: 20, borderRadius: 16, marginBottom: 24, borderWidth: 1, borderColor: '#E2E8F0' },
    durationInfo: { flex: 1 },
    durationLabel: { fontSize: 18, fontWeight: '700', color: '#1E293B', marginBottom: 4 },
    durationSubtext: { fontSize: 13, color: '#64748B' },
    durationControls: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC', borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0', padding: 4 },
    durationBtn: { paddingHorizontal: 18, paddingVertical: 12, backgroundColor: '#FFFFFF', borderRadius: 8 },
    durationBtnText: { fontSize: 20, fontWeight: 'bold', color: '#0F172A', lineHeight: 22 },
    durationValueContainer: { alignItems: 'center', justifyContent: 'center', minWidth: 70 },
    durationValue: { fontSize: 20, fontWeight: '800', color: '#0F172A' },
    durationUnit: { fontSize: 11, color: '#64748B', fontWeight: '600', textTransform: 'uppercase' },

    errorBox: { backgroundColor: '#FEF2F2', padding: 20, borderRadius: 12, borderWidth: 1, borderColor: '#FECACA' },
    errorText: { color: '#B91C1C', textAlign: 'center', fontWeight: '600', fontSize: 15 },

    premiumCard: { backgroundColor: '#FFFFFF', borderRadius: 20, padding: 24, marginBottom: 28, borderWidth: 1, borderColor: '#E2E8F0', ...Platform.select({ web: { boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.05)' } }) },

    // 🚀 RESPONSIVE HEADER STYLES
    cardHeaderTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#F1F5F9', paddingBottom: 24, marginBottom: 20 },
    cardHeaderTopMobile: { flexDirection: 'column-reverse', gap: 16 }, // column-reverse puts the image visually ON TOP of the text

    vehicleInfoArea: { flex: 1, paddingRight: 10 },
    vehicleInfoAreaMobile: { paddingRight: 0, alignItems: 'center', width: '100%' },

    vehicleNameText: { fontSize: 22, fontWeight: '800', color: '#0F172A', marginBottom: 10, letterSpacing: -0.3 },
    vehicleNameTextMobile: { textAlign: 'center' },

    tagsContainer: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
    tagsContainerMobile: { justifyContent: 'center' },

    tagPill: { backgroundColor: '#F1F5F9', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
    tagText: { fontSize: 13, color: '#475569', fontWeight: '600' },
    fuelPill: { backgroundColor: '#ECFDF5' },
    fuelText: { color: '#059669' },

    // Desktop keeps it right-aligned, Mobile makes it centered and massive
    imageContainer: { width: 200, height: 110, justifyContent: 'center', alignItems: 'flex-end' },
    imageContainerMobile: { width: '100%', height: 140, alignItems: 'center' },
    vehicleImageRender: { width: '100%', height: '100%' },

    splitArea: { flexDirection: 'row', gap: 24 },
    splitAreaMobile: { flexDirection: 'column', gap: 20 },

    // 🚀 FIXED: Removed hardcoded flex
    priceShowcase: { justifyContent: 'center', alignItems: 'flex-start', backgroundColor: '#F8FAFC', borderRadius: 16, padding: 24, borderWidth: 1, borderColor: '#E2E8F0' },
    priceShowcaseMobile: { alignItems: 'center', padding: 20 },
    priceAmountText: { fontSize: 36, fontWeight: '900', color: '#0F172A', marginBottom: 6, letterSpacing: -1 },
    priceContextText: { fontSize: 13, color: '#64748B', fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.8 },

    // Note: removed unused inclusion/exclusion block styles from here to keep it clean

    cardActionFooter: { marginTop: 24, paddingTop: 20, borderTopWidth: 1, borderTopColor: '#F1F5F9' },
    primaryBookBtn: { backgroundColor: '#2563EB', paddingVertical: 16, borderRadius: 12, alignItems: 'center' },
    primaryBookBtnText: { color: '#FFFFFF', fontWeight: '800', fontSize: 17, letterSpacing: 0.3 },
});