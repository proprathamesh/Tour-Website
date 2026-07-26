import Head from 'expo-router/head';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View, ScrollView } from 'react-native';

type TripType = 'one-way' | 'round-trip' | 'local';

export default function HomeScreen() {
  const [tripType, setTripType] = useState<TripType>('one-way');
  
  // Shared State
  const [pickup, setPickup] = useState('Pune');
  const [drop, setDrop] = useState('Mumbai');
  
  // 🚀 NEW: Start Date State (Defaults to today)
  const [startDate, setStartDate] = useState(
    new Date().toISOString().split('T')[0] 
  );

  // Local State
  const [localPackage, setLocalPackage] = useState('8hrs-80kms');

  const locations = ["Pune", "Mumbai", "Nashik"];
  const localPackages = [
    { label: '8 Hrs / 80 Kms', value: '8hrs-80kms' },
    { label: '10 Hrs / 100 Kms', value: '10hrs-100kms' },
    { label: '12 Hrs / 120 Kms', value: '12hrs-120kms' }
  ];

  const handleSearch = () => {
    // Construct the payload dynamically based on the active tab
    const searchParams: any = { tripType, pickup };

    if (tripType === 'one-way') {
      searchParams.drop = drop;
    } else if (tripType === 'round-trip') {
      searchParams.drop = drop;
      searchParams.startDate = startDate; // 👈 Updated to send startDate
    } else if (tripType === 'local') {
      searchParams.package = localPackage;
    }

    router.push({
      pathname: '/routes/Quote',
      params: searchParams
    });
  };

  return (
    <ScrollView 
      style={styles.mainScroll} 
      contentContainerStyle={styles.heroContainer}
      showsVerticalScrollIndicator={false}
    >
      <Head>
        <title>Premium Cab Booking | Pune, Mumbai & Nashik | Prathamesh Tours</title>
        <meta name="description" content="Book premium private cabs for one-way and round trips across Pune, Mumbai, and Nashik. Zero surge pricing, vetted drivers, and transparent fares." />
      </Head>

      <View style={styles.heroTextContainer}>
        <Text style={styles.heroHeading}>
          Premium Private Cabs on the Pune - Mumbai - Nashik Belt
        </Text>
        <Text style={styles.subtitle}>
          Zero sudden surges. Vetted professional drivers. Complete transparency for family & corporate travel.
        </Text>
      </View>

      {/* Booking Selector Widget */}
      <View style={styles.widgetCard}>
        {/* 3-Way Tab Container */}
        <View style={styles.tabContainer}>
          <Pressable 
            style={[styles.tab, tripType === 'one-way' && styles.activeTab]} 
            onPress={() => setTripType('one-way')}
          >
            <Text style={[styles.tabText, tripType === 'one-way' && styles.activeTabText]}>One Way</Text>
          </Pressable>
          <Pressable 
            style={[styles.tab, tripType === 'round-trip' && styles.activeTab]} 
            onPress={() => setTripType('round-trip')}
          >
            <Text style={[styles.tabText, tripType === 'round-trip' && styles.activeTabText]}>Round Trip</Text>
          </Pressable>
          <Pressable 
            style={[styles.tab, tripType === 'local' && styles.activeTab]} 
            onPress={() => setTripType('local')}
          >
            <Text style={[styles.tabText, tripType === 'local' && styles.activeTabText]}>Local Rental</Text>
          </Pressable>
        </View>

        {/* Dynamic Inputs Based on Trip Type */}
        <View style={styles.inputGrid}>
          
          {/* Always show Pickup City */}
          <View style={styles.inputWrapper}>
            <Text style={styles.inputLabel}>{tripType === 'local' ? 'City' : 'Pickup Location'}</Text>
            {/* @ts-ignore */}
            <select value={pickup} onChange={(e) => setPickup(e.target.value)} style={webSelectStyle}>
              {locations.map((loc) => (
                <option key={`pickup-${loc}`} value={loc} disabled={tripType !== 'local' && loc === drop}>
                  {loc}
                </option>
              ))}
            </select>
          </View>

          {/* 🚀 NEW: Dropdown for One-Way Drop */}
          {tripType === 'one-way' && (
            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>Drop Location</Text>
              {/* @ts-ignore */}
              <select value={drop} onChange={(e) => setDrop(e.target.value)} style={webSelectStyle}>
                {locations.map((loc) => (
                  <option key={`drop-${loc}`} value={loc} disabled={loc === pickup}>
                    {loc}
                  </option>
                ))}
              </select>
            </View>
          )}

          {/* 🚀 NEW: Typing Area (Text Input) for Round-Trip Drop */}
          {tripType === 'round-trip' && (
            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>Destination / Route</Text>
              {/* @ts-ignore */}
              <input 
                type="text" 
                placeholder="e.g., Mahabaleshwar, Goa"
                value={drop} 
                onChange={(e: any) => setDrop(e.target.value)} 
                style={webSelectStyle} 
              />
            </View>
          )}


          {/* Show Packages ONLY for Local Rental */}
          {tripType === 'local' && (
            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>Select Package</Text>
              {/* @ts-ignore */}
              <select value={localPackage} onChange={(e) => setLocalPackage(e.target.value)} style={webSelectStyle}>
                {localPackages.map((pkg) => (
                  <option key={pkg.value} value={pkg.value}>
                    {pkg.label}
                  </option>
                ))}
              </select>
            </View>
          )}
          
        </View>

        <Pressable style={styles.searchButton} onPress={handleSearch}>
          <Text style={styles.searchButtonText}>Get Instant Quote</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

// Inline CSS for the native web elements
const webSelectStyle: React.CSSProperties = {
  borderWidth: '1px',
  borderColor: '#CBD5E1',
  borderRadius: '6px',
  padding: '10px 14px',
  fontSize: '16px',
  backgroundColor: '#FFF',
  width: '100%',
  color: '#333',
  outline: 'none',
  fontFamily: 'inherit',
  cursor: 'pointer',
  boxSizing: 'border-box'
};

const styles = StyleSheet.create({
  mainScroll: { flex: 1, backgroundColor: '#F8FAFC' },
  heroContainer: { paddingHorizontal: 24, paddingVertical: 60, alignItems: 'center', maxWidth: 1200, alignSelf: 'center', width: '100%' },
  heroTextContainer: { alignItems: 'center', textAlign: 'center', marginBottom: 40, maxWidth: 800 },
  heroHeading: { fontSize: 42, fontWeight: '800', color: '#1E293B', marginVertical: 0, textAlign: 'center' },
  subtitle: { fontSize: 18, color: '#64748B', marginTop: 12, lineHeight: 26, textAlign: 'center' },
  widgetCard: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 24, width: '100%', maxWidth: 800, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 15, elevation: 2 },
  tabContainer: { flexDirection: 'row', backgroundColor: '#F1F5F9', borderRadius: 8, padding: 4, marginBottom: 20 },
  tab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 6 },
  activeTab: { backgroundColor: '#FFFFFF', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4 },
  tabText: { fontWeight: '600', color: '#64748B' },
  activeTabText: { color: '#208AEF' },
  inputGrid: { flexDirection: 'row', gap: 16, marginBottom: 20, flexWrap: 'wrap' },
  inputWrapper: { flex: 1, minWidth: 200 },
  inputLabel: { fontSize: 14, fontWeight: '600', color: '#475569', marginBottom: 6 },
  searchButton: { backgroundColor: '#208AEF', borderRadius: 6, paddingVertical: 14, alignItems: 'center' },
  searchButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
});