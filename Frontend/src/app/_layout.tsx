import { Stack } from 'expo-router';
import Head from 'expo-router/head';
import { Pressable, StyleSheet, Text, View } from 'react-native';

export default function RootLayout() {
  return (
    <>
      {/* Global Meta tags for SEO */}
      <Head>
        <title>Prathamesh Tours & Travels | Premium Pune Cab Service</title>
        <meta name="description" content="Reliable, premium private cab booking service for Pune, Mumbai, and Nashik corridors. Vetted drivers, zero surge charges, transparent corporate and family travel solutions." />
      </Head>

      <View style={styles.container}>
        {/* Header Section */}
        <View style={styles.header}>
          <Text style={styles.logo}>Prathamesh Travels</Text>
          <View style={styles.navLinks}>
            <Pressable><Text style={styles.navText}>Home</Text></Pressable>
            <Pressable style={styles.contactBtn}>
              <Text style={styles.contactBtnText}>Call Now</Text>
            </Pressable>
          </View>
        </View>

        {/* Dynamic Route Pages Content */}
        <View style={styles.content}>
          <Stack screenOptions={{ headerShown: false }} />
        </View>

        {/* Global Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>© 2026 Prathamesh Tours & Travels. All rights reserved.</Text>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  logo: { fontSize: 20, fontWeight: '700', color: '#208AEF' },
  navLinks: { flexDirection: 'row', alignItems: 'center', gap: 20 },
  navText: { color: '#475569', fontWeight: '500' },
  contactBtn: { backgroundColor: '#208AEF', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 6 },
  contactBtnText: { color: '#FFFFFF', fontWeight: '600' },
  content: { flex: 1 },
  footer: { padding: 20, borderTopWidth: 1, borderTopColor: '#E2E8F0', alignItems: 'center', backgroundColor: '#FFFFFF' },
  footerText: { color: '#94A3B8', fontSize: 12 },
});