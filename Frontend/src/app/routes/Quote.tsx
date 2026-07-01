import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { getQuoteData } from '../../utils/RouteParser';

export default function QuotePage() {
    const { pickup, drop, tripType } = useLocalSearchParams();

    const [routeDetails, setRouteDetails] = useState<any>(null);
    const [vehicles, setVehicles] = useState<any[]>([]);
    const [selectedVehicle, setSelectedVehicle] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const VEHICLE_IMAGES: Record<string, any> = {
        'hatchback': require('../../../assets/images/hatchback.png'),
        'sedan': require('../../../assets/images/sedan.png'),
        'suv': require('../../../assets/images/suv.png'),
        'comfort-suv': require('../../../assets/images/carens.png'),
        'premium-suv': require('../../../assets/images/crysta.jpg'),
    };

    useEffect(() => {
        if (!pickup || !drop) return;

        const result = getQuoteData(pickup as string, drop as string);

        if (!result.success || !result.data) {
            setError(result.error || "Route not currently serviced");
            return;
        }

        setRouteDetails(result.data.routeDetails);
        setVehicles(result.data.vehicles);

        if (result.data.vehicles.length > 0) {
            setSelectedVehicle(result.data.vehicles[0].id);
        }
    }, [pickup, drop]);

    if (!routeDetails && !error) {
        return (
            <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color="#208AEF" />
                <Text style={{ marginTop: 12, fontWeight: '500', color: '#64748B' }}>Calculating best routes...</Text>
            </View>
        );
    }

    if (error) {
        return (
            <View style={[styles.container, { justifyContent: 'center', alignItems: 'center', padding: 24 }]}>
                <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#EF4444', marginBottom: 16 }}>{error}</Text>
                <Pressable style={styles.bookButton} onPress={() => router.back()}>
                    <Text style={styles.bookButtonText}>← Go Back and Try Again</Text>
                </Pressable>
            </View>
        );
    }

    const activeVehicle = vehicles.find(v => v.id === selectedVehicle);

    return (
        <ScrollView style={styles.container}>
            {/* Route Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Your Private Ride Details</Text>
                <View style={styles.routePill}>
                    <Text style={styles.routeText}>{tripType?.toString().toUpperCase()}: {pickup} → {drop}</Text>
                </View>
                <Text style={styles.estimatedTime}>
                    Approx. {routeDetails.distanceKm} km | {routeDetails.estimatedTimeHours} Hours via Expressway
                </Text>
            </View>

            <View style={styles.contentLayout}>
                {/* Left Column: Vehicle Cards */}
                <View style={styles.vehicleList}>
                    <Text style={styles.sectionTitle}>Select Your Vehicle</Text>

                    {vehicles.map((vehicle) => {
                        const isSelected = selectedVehicle === vehicle.id;
                        return (
                            <Pressable
                                key={vehicle.id}
                                style={[styles.vehicleCard, isSelected && styles.activeVehicleCard]}
                                onPress={() => setSelectedVehicle(vehicle.id)}
                            >
                                {/* Left Selection Accent Bar */}
                                {isSelected && <View style={styles.activeAccentBar} />}

                                {/* Image Frame Container to perfectly isolate vehicle backdrop */}
                                <View style={styles.imageFrame}>
                                    <Image
                                        source={VEHICLE_IMAGES[vehicle.id]}
                                        style={styles.carIcon}
                                        resizeMode="contain"
                                    />
                                </View>

                                {/* Vehicle Info Details */}
                                <View style={styles.vehicleDetails}>
                                    <Text style={styles.vehicleName}>{vehicle.name}</Text>
                                    <Text style={styles.vehicleModels} numberOfLines={1}>{vehicle.models}</Text>
                                    <View style={styles.metaRow}>
                                        <Text style={styles.capacityText}>👨‍👩‍👧‍👦 {vehicle.seats} Seats</Text>
                                        <Text style={styles.bulletDivider}>•</Text>
                                        <Text style={styles.baggageText}>💼 Max Bags</Text>
                                    </View>
                                </View>

                                {/* Pricing Section */}
                                <View style={[styles.priceContainer, isSelected && styles.activePriceContainer]}>
                                    <Text style={[styles.startingPrice, isSelected && styles.activePriceText]}>₹{vehicle.oneWayPackage}</Text>
                                    <Text style={styles.baseLabel}>All-Inclusive</Text>
                                </View>
                            </Pressable>
                        );
                    })}
                </View>

                {/* Right Column: The Receipt */}
                <View style={styles.summaryPanel}>
                    <Text style={styles.sectionTitle}>Fare Summary</Text>
                    <View style={styles.breakdownCard}>
                        <Text style={styles.packageTotalLabel}>Total Package Price</Text>
                        <Text style={styles.packageTotalValue}>₹{activeVehicle?.oneWayPackage}</Text>

                        <View style={styles.divider} />

                        <Text style={styles.listHeadingText}>📦 What's Included:</Text>
                        <Text style={styles.listItem}>✓ Fuel Charges & Driver Night Bata</Text>
                        <Text style={styles.listItem}>✓ All Expressway & State Toll Taxes</Text>
                        <Text style={styles.listItem}>✓ Drop straight to your exact address</Text>

                        <Text style={[styles.listHeadingText, { marginTop: 16 }]}>❌ What's Not Included:</Text>
                        <Text style={styles.listItem}>• Multiple drops or deviations</Text>

                        <View style={styles.guaranteeBox}>
                            <Text style={styles.guaranteeText}>✅ Locked Fares. No End-of-Trip Surprises.</Text>
                        </View>

                        <Pressable style={styles.bookButton} onPress={() => console.log('Proceeding with vehicle:', activeVehicle)}>
                            <Text style={styles.bookButtonText}>Confirm & Book Ride</Text>
                        </Pressable>
                    </View>
                </View>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8FAFC' },
    header: { padding: 32, backgroundColor: '#FFFFFF', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
    headerTitle: { fontSize: 28, fontWeight: '700', color: '#1E293B', marginBottom: 12 },
    routePill: { backgroundColor: '#EFF6FF', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, marginBottom: 8 },
    routeText: { color: '#2563EB', fontWeight: '600', fontSize: 14 },
    estimatedTime: { color: '#64748B', fontSize: 14 },

    contentLayout: { flexDirection: 'row', flexWrap: 'wrap', padding: 24, gap: 24, maxWidth: 1200, alignSelf: 'center', width: '100%' },

    vehicleList: { flex: 2, minWidth: 350 },
    sectionTitle: { fontSize: 20, fontWeight: '600', color: '#1E293B', marginBottom: 16 },
    
    // Kept background white across states to perfectly camouflage image boxes
    vehicleCard: { 
        flexDirection: 'row', 
        backgroundColor: '#FFFFFF', 
        borderRadius: 14, 
        paddingVertical: 12,
        paddingHorizontal: 16,
        marginBottom: 16, 
        borderWidth: 1, 
        borderColor: '#E2E8F0', 
        position: 'relative',
        overflow: 'hidden',
        alignItems: 'center',
        shadowColor: '#0F172A', 
        shadowOffset: { width: 0, height: 2 }, 
        shadowOpacity: 0.04, 
        shadowRadius: 6, 
        elevation: 1 
    },
    activeVehicleCard: { 
        borderColor: '#208AEF',
        borderWidth: 2,
        shadowOpacity: 0.08,
        shadowRadius: 12,
    },
    activeAccentBar: {
        position: 'absolute',
        left: 0,
        top: 0,
        bottom: 0,
        width: 5,
        backgroundColor: '#208AEF'
    },
    
    // Dedicated display container for the image
    imageFrame: {
        width: 150,
        height: 90,
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    carIcon: { 
        width: '100%', 
        height: '100%',
    },
    
    vehicleDetails: { flex: 1, justifyContent: 'center', paddingRight: 8 },
    vehicleName: { fontSize: 18, fontWeight: '700', color: '#0F172A', marginBottom: 2 },
    vehicleModels: { fontSize: 13, color: '#64748B', marginBottom: 6 },
    metaRow: { flexDirection: 'row', alignItems: 'center' },
    capacityText: { fontSize: 12, color: '#475569', fontWeight: '600' },
    bulletDivider: { marginHorizontal: 6, color: '#94A3B8', fontSize: 12 },
    baggageText: { fontSize: 12, color: '#64748B' },
    
    priceContainer: { 
        justifyContent: 'center', 
        alignItems: 'flex-end', 
        paddingLeft: 12,
        borderLeftWidth: 1,
        borderLeftColor: '#F1F5F9',
        height: '70%'
    },
    activePriceContainer: {
        borderLeftColor: '#E0F2FE'
    },
    startingPrice: { fontSize: 22, fontWeight: '800', color: '#334155' },
    activePriceText: { color: '#208AEF' },
    baseLabel: { fontSize: 11, color: '#94A3B8', marginTop: 2, textTransform: 'uppercase', letterSpacing: 0.5 },

    summaryPanel: { flex: 1, minWidth: 300 },
    breakdownCard: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
    divider: { height: 1, backgroundColor: '#E2E8F0', marginVertical: 16 },

    packageTotalLabel: { color: '#64748B', fontSize: 14, fontWeight: '600' },
    packageTotalValue: { color: '#1E293B', fontSize: 32, fontWeight: '800', marginVertical: 4 },
    listHeadingText: { fontSize: 15, fontWeight: '700', color: '#1E293B', marginBottom: 8 },
    listItem: { fontSize: 14, color: '#475569', marginBottom: 6, paddingLeft: 4 },

    guaranteeBox: { backgroundColor: '#DCFCE7', padding: 12, borderRadius: 6, marginTop: 20, alignItems: 'center' },
    guaranteeText: { color: '#166534', fontWeight: '600', fontSize: 13 },
    bookButton: { backgroundColor: '#208AEF', paddingVertical: 16, borderRadius: 8, marginTop: 20, alignItems: 'center' },
    bookButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
});