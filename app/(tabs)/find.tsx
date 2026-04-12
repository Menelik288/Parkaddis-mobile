import { Colors } from '@/constants/theme';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Camera, Map, UserLocation, Marker, GeoJSONSource, Layer } from '@maplibre/maplibre-react-native';

import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ImageBackground, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, useColorScheme, View, ActivityIndicator } from 'react-native';

const PARKING_SPOTS = [
  {
    id: '1',
    title: 'Bole Medhanealem Mall',
    subtitle: 'Cameroon St, Bole',
    coordinate: [38.7891, 8.9984] as [number, number],
    slots: 12,
    price: '$2.50',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBR0b_HtyojffIY6GBWEOP72fKjKXiz14ai3V6859g3Oth58o0A84PaLuSC6yAppnl9El79LljNxIBlmHZQL_AmwYmlOe3It5bMZ6R4ID3HHY3tTQl07DDxXsmSHnZde1Rq22_dpQDSpxN1fgEcfYwnZHFs_q6WlRdJmqdj8ysEAADE8EduW6jvPRPTJ-C85iOXI6UbkTlv9UF0qe-CqstuyOivJjI8J4CJJNI6LKYwybnhw7GlBlkXIIN5kE1JrLF2FxA2ZlCfSlA'
  },
  {
    id: '2',
    title: 'Edna Mall Underground',
    subtitle: 'Bole Road, Central',
    coordinate: [38.7876, 8.9972] as [number, number],
    slots: 4,
    price: '$3.00',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAHWn4PSOhz2pvDWc_JghtnLbF9YTjSIdP-k-3a9SjssR8YSLBYgQ_-Y2ydN8N3pdEOsmBrpRnABa_Qv0oWpIzb70OBG52d4JO7zoXlYji6oBF8pHMGkRxSKND3F3nIIo4eyKbnHLS92OqgGuGqufG18JeF7yfduVziDJvGrP2tqmanqx9XaOCUcDVFl3UXnxaHlVQOM9u9jQ1TnCc1lEqiBMv1XHBSQHuEJa79jyaMp6JLyI5Mjnz4fXX0oK9Kk58lVCNk5pqVLLs'
  },
  {
    id: '3',
    title: 'Friendship City Center',
    subtitle: 'Africa Ave, Bole',
    coordinate: [38.7850, 8.9990] as [number, number],
    slots: 8,
    price: '$2.00',
    image: 'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&q=80&w=400'
  }
];

export default function FindScreen() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const isDark = colorScheme === 'dark';
  const primary = '#064e3b';
  const secondary = '#059669';
  const router = useRouter();

  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [selectedSpotId, setSelectedSpotId] = useState<string | null>(null);
  const [routeData, setRouteData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let subscription: Location.LocationSubscription | null = null;

    async function startTracking() {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.error('Permission to access location was denied');
        setLoading(false);
        return;
      }

      // Initial position
      try {
        let initial = await Location.getCurrentPositionAsync({});
        setUserLocation([initial.coords.longitude, initial.coords.latitude]);
      } catch (e) {
        console.warn('Could not get initial location', e);
      }
      setLoading(false);

      // Live subscription
      subscription = await Location.watchPositionAsync(
        { 
          accuracy: Location.Accuracy.Balanced, 
          distanceInterval: 5, // Update every 5 meters
          timeInterval: 5000   // Or every 5 seconds
        },
        (newLoc) => {
          setUserLocation([newLoc.coords.longitude, newLoc.coords.latitude]);
        }
      );
    }

    startTracking();

    return () => {
      if (subscription) {
        subscription.remove();
      }
    };
  }, []);

  const fetchRoute = async (destination: [number, number]) => {
    if (!userLocation) return;
    try {
      const url = `https://router.project-osrm.org/route/v1/driving/${userLocation[0]},${userLocation[1]};${destination[0]},${destination[1]}?overview=full&geometries=geojson`;
      const response = await fetch(url);
      const data = await response.json();
      if (data.routes && data.routes.length > 0) {
        setRouteData(data.routes[0].geometry);
      }
    } catch (error) {
      console.error('Error fetching route:', error);
    }
  };

  const handleSpotPress = (spot: typeof PARKING_SPOTS[0]) => {
    setSelectedSpotId(spot.id);
    fetchRoute(spot.coordinate as [number, number]);
  };

  if (loading && !userLocation) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center', backgroundColor: isDark ? '#0f172a' : '#f8fafc' }]}>
        <ActivityIndicator size="large" color={primary} />
        <Text style={{ marginTop: 12, color: theme.text }}>Locating you...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.mapContainer}>
        <Map
          style={StyleSheet.absoluteFillObject}
          logo={false}
          attribution={false}
          mapStyle="https://basemaps.cartocdn.com/gl/positron-gl-style/style.json"
        >
          <Camera
            zoom={14}
            center={userLocation || [38.763611, 9.005401]}
          />
          
          <UserLocation />

          {/* Parking Spot Markers */}
          {PARKING_SPOTS.map((spot) => (
            <Marker
              key={spot.id}
              id={spot.id}
              lngLat={spot.coordinate}
            >
              <TouchableOpacity onPress={() => handleSpotPress(spot)}>
                <View style={[
                  styles.pPin, 
                  selectedSpotId === spot.id && styles.pPinActive,
                  { backgroundColor: selectedSpotId === spot.id ? secondary : primary }
                ]}>
                  <Text style={styles.pPinText}>P</Text>
                </View>
              </TouchableOpacity>
            </Marker>
          ))}

          {/* Route Line */}
          {routeData && (
            <GeoJSONSource id="routeSource" data={{ type: 'Feature', geometry: routeData, properties: {} }}>
              <Layer
                id="routeLayer"
                type="line"
                style={{
                  lineColor: secondary,
                  lineWidth: 5,
                  lineJoin: 'round',
                  lineCap: 'round',
                  lineOpacity: 0.8,
                }}
              />
            </GeoJSONSource>
          )}
        </Map>
        {/* Top Navigation Overlay */}
        <View style={styles.topOverlay}>
          <View style={styles.leftActions}>
            <TouchableOpacity onPress={() => router.back()} style={[styles.pillButton, { backgroundColor: isDark ? '#1e293b' : '#fff', borderColor: isDark ? '#334155' : '#fff' }]}>
              <MaterialIcons name="arrow-back" size={24} color={isDark ? '#34d399' : primary} />
            </TouchableOpacity>
            <TouchableOpacity style={[styles.pillButton, { backgroundColor: isDark ? '#1e293b' : '#fff', borderColor: isDark ? '#334155' : '#fff' }]}>
              <MaterialIcons name="search" size={24} color={isDark ? '#34d399' : primary} />
            </TouchableOpacity>
          </View>
          <View style={[styles.walletWidget, { backgroundColor: isDark ? '#1e293b' : '#fff', borderColor: isDark ? '#334155' : '#fff' }]}>
            <View style={styles.walletTextContainer}>
              <Text style={styles.walletLabel}>BALANCE</Text>
              <Text style={[styles.walletAmount, { color: isDark ? '#34d399' : primary }]}>ETB 450.00</Text>
            </View>
            <View style={[styles.walletIcon, { backgroundColor: isDark ? '#34d399' : primary }]}>
              <MaterialIcons name="account-balance-wallet" size={20} color={isDark ? '#064e3b' : "#fff"} />
            </View>
          </View>
        </View>

        {/* Floating Action Buttons */}
        <View style={styles.distanceSelector}>
          <View style={[styles.distancePillbox, { backgroundColor: isDark ? 'rgba(30,41,59,0.95)' : 'rgba(255,255,255,0.95)' }]}>
            {['All', '200m', '400m', '600m'].map((dist) => (
              <TouchableOpacity key={dist} style={[styles.distBtn, dist === 'All' && styles.distBtnActive]}>
                <Text style={dist === 'All' ? styles.distBtnTextActive : styles.distBtnText}>{dist}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={[styles.distanceLabelBox, { backgroundColor: isDark ? '#1e293b' : '#fff' }]}>
            <Text style={[styles.distanceLabel, { color: isDark ? '#34d399' : primary }]}>DISTANCE</Text>
          </View>
        </View>

        <TouchableOpacity 
          style={[styles.trackBtn, { backgroundColor: isDark ? '#1e293b' : '#fff' }]}
          onPress={async () => {
            let location = await Location.getCurrentPositionAsync({});
            setUserLocation([location.coords.longitude, location.coords.latitude]);
          }}
        >
          <MaterialIcons name="my-location" size={28} color={isDark ? '#34d399' : primary} />
        </TouchableOpacity>

        {/* Horizontal Scrollable Parking Cards */}
        <View style={styles.cardsWrapper}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.cardsScroll}>
            {PARKING_SPOTS.map((spot) => (
              <TouchableOpacity 
                key={spot.id} 
                activeOpacity={0.9}
                onPress={() => handleSpotPress(spot)}
                style={[
                  styles.card, 
                  selectedSpotId === spot.id && styles.cardSelected, 
                  { backgroundColor: isDark ? '#0f172a' : '#fff', borderColor: selectedSpotId === spot.id ? primary : 'transparent' }
                ]}
              >
                <View style={styles.cardInfo}>
                  <ImageBackground
                    source={{ uri: spot.image }}
                    style={styles.cardImg}
                    imageStyle={{ borderRadius: 12 }}
                  />
                  <View style={styles.cardDetails}>
                    <View>
                      <View style={styles.cardHeaderRow}>
                        <Text style={[styles.cardTitle, { color: theme.text, flex: 1 }]} numberOfLines={1}>{spot.title}</Text>
                        {selectedSpotId === spot.id && (
                          <View style={[styles.selectedBadge, { backgroundColor: `${primary}1a` }]}>
                            <Text style={[styles.selectedBadgeText, { color: primary }]}>SELECTED</Text>
                          </View>
                        )}
                      </View>
                      <Text style={styles.cardSubtitle} numberOfLines={1}>{spot.subtitle}</Text>
                    </View>
                    <View style={styles.cardSlots}>
                      <MaterialIcons name="check-circle" size={14} color={secondary} />
                      <Text style={[styles.slotsText, { color: secondary }]}>{spot.slots} slots available</Text>
                    </View>
                    <Text style={[styles.priceText, { color: primary }]}>{spot.price}<Text style={styles.priceUnit}>/hr</Text></Text>
                  </View>
                </View>
                <View style={styles.cardFooter}>
                  <TouchableOpacity style={[styles.reserveBtn, { backgroundColor: primary }]} onPress={() => router.push('/reserve' as any)}>
                    <Text style={styles.reserveBtnText}>Reserve Spot</Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  mapContainer: {
    flex: 1,
    position: 'relative',
    backgroundColor: '#cbd5e1',
  },
  topOverlay: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 40,
    left: 24,
    right: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    zIndex: 50,
  },
  leftActions: {
    gap: 12,
  },
  pillButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
    borderWidth: 1,
  },
  walletWidget: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 16,
    paddingRight: 4,
    paddingVertical: 4,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
    borderWidth: 1,
    gap: 12,
  },
  walletTextContainer: {
    alignItems: 'flex-start',
  },
  walletLabel: {
    fontSize: 9,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    color: '#475569',
  },
  walletAmount: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  walletIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pPin: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
    borderWidth: 2,
    borderColor: '#fff',
  },
  pPinActive: {
    transform: [{ scale: 1.2 }],
    borderColor: '#fff',
    borderWidth: 3,
  },
  pPinText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 16,
  },
  distanceSelector: {
    position: 'absolute',
    left: 24,
    bottom: 250,
    zIndex: 40,
    alignItems: 'center',
    gap: 8,
  },
  distancePillbox: {
    padding: 6,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 5,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.5)',
    gap: 4,
  },
  distBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  distBtnActive: {
    backgroundColor: '#064e3b',
  },
  distBtnText: {
    color: '#475569',
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  distBtnTextActive: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  distanceLabelBox: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  distanceLabel: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  trackBtn: {
    position: 'absolute',
    right: 24,
    bottom: 250,
    zIndex: 40,
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 5,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  cardsWrapper: {
    position: 'absolute',
    bottom: 24,
    left: 0,
    right: 0,
  },
  cardsScroll: {
    paddingHorizontal: 16,
    gap: 16,
  },
  card: {
    width: 320,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    overflow: 'hidden',
  },
  cardSelected: {
    borderWidth: 2,
  },
  cardInfo: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  cardImg: {
    width: 96,
    height: 96,
    borderRadius: 12,
  },
  cardDetails: {
    flex: 1,
    justifyContent: 'space-between',
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 2,
  },
  cardSubtitle: {
    fontSize: 12,
    color: '#64748b',
  },
  selectedBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  selectedBadgeText: {
    fontSize: 9,
    fontWeight: '700',
  },
  cardSlots: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 6,
  },
  slotsText: {
    fontSize: 11,
    fontWeight: '600',
  },
  priceText: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 4,
  },
  priceUnit: {
    fontSize: 12,
    fontWeight: '400',
    color: '#64748b',
  },
  cardFooter: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  reserveBtn: {
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  reserveBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});
