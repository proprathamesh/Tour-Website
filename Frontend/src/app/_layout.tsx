import { Stack } from 'expo-router';
import Head from 'expo-router/head';
import { StyleSheet, Text, View, Image, useWindowDimensions, Platform } from 'react-native';

export default function RootLayout() {
  const { width } = useWindowDimensions();
  const isMobile = width < 768; // Standard tablet/mobile breakpoint

  return (
    <>
      {/* Global Meta tags for SEO */}
      <Head>
        <title>Prathamesh Tours & Travels | Premium Pune Cab Service</title>
        <meta 
          name="description" 
          content="Reliable, premium private cab booking service for Pune, Mumbai, and Nashik corridors. Vetted drivers, zero surge charges, transparent corporate and family travel solutions." 
        />
      </Head>

      <View style={styles.container}>
        {/* Header Section */}
        <View style={styles.headerBase}>
          <View style={[styles.headerInner, isMobile && styles.headerInnerMobile]}>
            
            {/* Logo Section */}
            <View style={styles.logoContainer}>
              <Image 
                source={{ uri: 'https://cdn-icons-png.flaticon.com/512/7573/7573229.png' }} // Sample travel/cab logo
                style={styles.logoImage}
                resizeMode="contain"
              />
              <Text style={styles.logoText}>Prathamesh Travels</Text>
            </View>

            {/* Nav Links Placeholder (Ready for your new buttons) */}
            <View style={styles.navLinks}>
              {/* Future buttons will go here */}
            </View>

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
  container: { 
    flex: 1, 
    backgroundColor: '#F8FAFC' 
  },
  
  // 🚀 Responsive Header Setup
  headerBase: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    alignItems: 'center', // Centers the inner wrapper on large desktop screens
    paddingTop: Platform.OS === 'ios' ? 45 : (Platform.OS === 'android' ? 30 : 0), // Safe area for mobile apps
  },
  headerInner: {
    width: '100%',
    maxWidth: 1200, // Prevents stretching on ultra-wide monitors
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  headerInnerMobile: {
    paddingHorizontal: 16, // Slightly tighter padding for small phone screens
  },

  // 🚀 Logo Styles
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logoImage: {
    width: 36,
    height: 36,
  },
  logoText: { 
    fontSize: 22, 
    fontWeight: '800', 
    color: '#0F172A',
    letterSpacing: -0.5 
  },

  // 🚀 Nav Links
  navLinks: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 20 
  },

  content: { 
    flex: 1 
  },
  
  footer: { 
    padding: 24, 
    borderTopWidth: 1, 
    borderTopColor: '#E2E8F0', 
    alignItems: 'center', 
    backgroundColor: '#FFFFFF' 
  },
  footerText: { 
    color: '#64748B', 
    fontSize: 14,
    fontWeight: '500'
  },
});