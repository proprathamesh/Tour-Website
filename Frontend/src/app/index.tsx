import Head from 'expo-router/head';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

export default function HomeScreen() {
  const [tripType, setTripType] = useState<'one-way' | 'round-trip'>('one-way');
  const [pickup, setPickup] = useState('Pune');
  const [drop, setDrop] = useState('Mumbai Airport (BOM)');

  // Hardcoded locations for the dropdown based on your launch strategy
  const locations = [
    "Pune (City)",
    "Pune Airport (PNQ)",
    "Mumbai (City)",
    "Mumbai Airport (BOM)",
    "Nashik"
  ];

  const handleSearch = () => {
    router.push({
      pathname: '/routes/Quote',
      params: { tripType, pickup, drop }
    });
  };

  return (
    <View style={styles.heroContainer}>
      {/* 🚀 SEO Metadata Injected Here 🚀 */}
      <Head>
        <title>Premium Cab Booking | Pune, Mumbai & Nashik | Prathamesh Tours</title>
        <meta name="description" content="Book premium private cabs for one-way and round trips across Pune, Mumbai, and Nashik. Zero surge pricing, vetted drivers, and transparent fares." />
      </Head>

      <View style={styles.heroTextContainer}>
        <h1 style={{ fontSize: 42, fontWeight: '800', color: '#1E293B', margin: 0 }}>
          Premium Private Cabs on the Pune - Mumbai - Nashik Belt
        </h1>
        <Text style={styles.subtitle}>
          Zero sudden surges. Vetted professional drivers. Complete transparency for family & corporate travel.
        </Text>
      </View>

      {/* Booking Selector Widget */}
      <View style={styles.widgetCard}>
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
        </View>

        <View style={styles.inputGrid}>
          {/* Pickup Dropdown */}
          <View style={styles.inputWrapper}>
            <Text style={styles.inputLabel}>Pickup Location</Text>
            {/* Note: Using native HTML select for Expo Web compatibility */}
            <select 
              value={pickup} 
              onChange={(e) => setPickup(e.target.value)}
              style={webSelectStyle}
            >
              {locations.map((loc) => (
                <option key={`pickup-${loc}`} value={loc} disabled={loc === drop}>
                  {loc}
                </option>
              ))}
            </select>
          </View>

          {/* Drop Dropdown */}
          <View style={styles.inputWrapper}>
            <Text style={styles.inputLabel}>Drop Location</Text>
            <select 
              value={drop} 
              onChange={(e) => setDrop(e.target.value)}
              style={webSelectStyle}
            >
              {locations.map((loc) => (
                <option key={`drop-${loc}`} value={loc} disabled={loc === pickup}>
                  {loc}
                </option>
              ))}
            </select>
          </View>
        </View>

        <Pressable style={styles.searchButton} onPress={handleSearch}>
          <Text style={styles.searchButtonText}>Get Instant Quote</Text>
        </Pressable>
      </View>
    </View>
  );
}

// Inline CSS for the native web select element to match React Native styling
const webSelectStyle = {
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
  cursor: 'pointer'
};

const styles = StyleSheet.create({
  heroContainer: { paddingHorizontal: 24, paddingVertical: 60, alignItems: 'center', maxWidth: 1200, alignSelf: 'center', width: '100%' },
  heroTextContainer: { alignItems: 'center', textAlign: 'center', marginBottom: 40, maxWidth: 800 },
  subtitle: { fontSize: 18, color: '#64748B', marginTop: 12, lineHeight: 26, textAlign: 'center' },
  widgetCard: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 24, width: '100%', maxWidth: 700, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 15, elevation: 2 },
  tabContainer: { flexDirection: 'row', backgroundColor: '#F1F5F9', borderRadius: 8, padding: 4, marginBottom: 20 },
  tab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 6 },
  activeTab: { backgroundColor: '#FFFFFF', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4 },
  tabText: { fontWeight: '600', color: '#64748B' },
  activeTabText: { color: '#208AEF' },
  inputGrid: { flexDirection: 'row', gap: 16, marginBottom: 20, flexWrap: 'wrap' },
  inputWrapper: { flex: 1, minWidth: 250 },
  inputLabel: { fontSize: 14, fontWeight: '600', color: '#475569', marginBottom: 6 },
  searchButton: { backgroundColor: '#208AEF', borderRadius: 6, paddingVertical: 14, alignItems: 'center' },
  searchButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
});