import React, { useMemo } from 'react';
import { View, Text, FlatList, Image, StyleSheet } from 'react-native';

export default function QuoteScreen({ routeKey, routesData, masterVehicles, tripType = 'oneWay' }:any) {
  
  // 1. Hydration: Join normalized route pricing with master vehicle specs
  const hydratedVehicles = useMemo(() => {
    const route = routesData[routeKey];
    if (!route) return [];

    // Create a Map for O(1) lookups against the master collection
    const vehiclesMap = new Map(masterVehicles.map((v:any) => [v.vehicleId, v]));

    return route.oneWayPricing.map((pricing:any) => {
      const carDetails = vehiclesMap.get(pricing.vehicleId);
      
      if (!carDetails) return null; 

      return {
        ...carDetails,
        oneWayPackage: pricing.oneWayPackage,
      };
    }).filter(Boolean); // Clean up any nulls if a vehicleId is missing
  }, [routeKey, routesData, masterVehicles]);

  const routeDetails = routesData[routeKey]?.routeDetails;

  // 2. Extensible Fare Calculation Logic
  // Handles the math for round trips using the variables nested in the master schema
  const calculateDisplayFare = (vehicle:any) => {
    if (tripType === 'roundTrip') {
      const extraKmRate = vehicle.pricing.roundTrip.extraKmRate;
      const days = 1; // Example multiplier
      const standardKms = 300; 
      const driverAllowance = 300;
      
      // If round trip: e.g., 12/300/300 -> (12 * 300) + 300
      return (extraKmRate * standardKms * days) + (driverAllowance * days);
    }
    
    // Default to the localized one-way package cost
    return vehicle.oneWayPackage;
  };

  // 3. UI Renderer
  const renderVehicle = ({ item }:any) => (
    <View style={styles.card}>
      <Image source={{ uri: item.metadata.imageUrl }} style={styles.image} />
      
      <View style={styles.details}>
        <Text style={styles.title}>{item.name}</Text>
        <Text style={styles.subtitle}>{item.models}</Text>
        <Text style={styles.specs}>{item.seats} Seats • {item.fuel}</Text>
      </View>
      
      <View style={styles.priceContainer}>
        <Text style={styles.price}>₹{calculateDisplayFare(item)}</Text>
        <Text style={styles.baseFareLabel}>Base Fare</Text>
      </View>
    </View>
  );

  if (!routeDetails) {
    return (
      <View style={styles.centered}>
        <Text style={styles.error}>Route information unavailable.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Route Header */}
      <View style={styles.header}>
        <Text style={styles.routeText}>
          {routeDetails.origin} ➔ {routeDetails.destination}
        </Text>
        <Text style={styles.subRouteText}>
          {routeDetails.distanceKm} km • ~{routeDetails.estimatedTimeHours} hrs
        </Text>
      </View>

      {/* Available Vehicles List */}
      <FlatList
        data={hydratedVehicles}
        keyExtractor={(item) => item.vehicleId}
        renderItem={renderVehicle}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { padding: 20, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderColor: '#EAEAEA' },
  routeText: { fontSize: 18, fontWeight: '700', color: '#333' },
  subRouteText: { fontSize: 14, color: '#666', marginTop: 4 },
  list: { padding: 16 },
  card: { 
    flexDirection: 'row', 
    backgroundColor: '#FFF', 
    padding: 16, 
    marginBottom: 12, 
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 }
  },
  image: { width: 80, height: 50, resizeMode: 'contain', alignSelf: 'center' },
  details: { flex: 1, marginLeft: 16, justifyContent: 'center' },
  title: { fontSize: 16, fontWeight: '600' },
  subtitle: { fontSize: 13, color: '#555', marginTop: 2 },
  specs: { fontSize: 12, color: '#888', marginTop: 4 },
  priceContainer: { justifyContent: 'center', alignItems: 'flex-end' },
  price: { fontSize: 18, fontWeight: 'bold', color: '#2A9D8F' },
  baseFareLabel: { fontSize: 12, color: '#888' },
  error: { fontSize: 16, color: '#E63946' }
});