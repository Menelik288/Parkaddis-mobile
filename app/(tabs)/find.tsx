import { Colors } from '@/constants/theme';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Camera, Map, UserLocation } from '@maplibre/maplibre-react-native';
import { useRouter } from 'expo-router';
import { ImageBackground, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, useColorScheme, View } from 'react-native';

export default function FindScreen() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const isDark = colorScheme === 'dark';
  const primary = '#064e3b';
  const secondary = '#059669'; // from original map design
  const router = useRouter();

  return (
    <View style={styles.container}>
      {/* Main Content (Map & Overlay) */}
      <View style={styles.mapContainer}>
        {/* MapLibreGL Map component */}
        <Map
          style={StyleSheet.absoluteFillObject}
          logo={false}
          attribution={false}
          mapStyle="https://basemaps.cartocdn.com/gl/positron-gl-style/style.json"
        >
          <Camera
            zoom={14}
            center={[38.763611, 9.005401]} // Addis Ababa, Ethiopia
          />
          <UserLocation />
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

        {/* High-Contrast P Pins */}
        <View style={[styles.pPin, { top: '25%', right: '15%' }]}>
          <Text style={styles.pPinText}>P</Text>
        </View>
        <View style={[styles.pPin, styles.pPinActive, { bottom: '40%', left: '20%' }]}>
          <Text style={styles.pPinTextActive}>P</Text>
        </View>
        <View style={[styles.pPin, { top: '45%', right: '40%' }]}>
          <Text style={styles.pPinText}>P</Text>
        </View>

        {/* User Location Crosshair */}
        <View style={styles.userLocation}>
          <View style={styles.userPulse} />
          <View style={styles.userDot} />
        </View>

        {/* Floating Action Button for Location Recenter - Crosshair Style */}
        <View style={styles.distanceSelector}>
          <View style={[styles.distancePillbox, { backgroundColor: isDark ? 'rgba(30,41,59,0.95)' : 'rgba(255,255,255,0.95)' }]}>
            <TouchableOpacity style={[styles.distBtn, styles.distBtnActive]}>
              <Text style={styles.distBtnTextActive}>All</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.distBtn}>
              <Text style={styles.distBtnText}>200m</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.distBtn}>
              <Text style={styles.distBtnText}>400m</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.distBtn}>
              <Text style={styles.distBtnText}>600m</Text>
            </TouchableOpacity>
          </View>
          <View style={[styles.distanceLabelBox, { backgroundColor: isDark ? '#1e293b' : '#fff' }]}>
            <Text style={[styles.distanceLabel, { color: isDark ? '#34d399' : primary }]}>DISTANCE</Text>
          </View>
        </View>

        <TouchableOpacity style={[styles.trackBtn, { backgroundColor: isDark ? '#1e293b' : '#fff' }]}>
          <MaterialIcons name="my-location" size={28} color={isDark ? '#34d399' : primary} />
        </TouchableOpacity>

        {/* Horizontal Scrollable Parking Cards (KEPT FROM ORIGINAL) */}
        <View style={styles.cardsWrapper}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.cardsScroll}>
            {/* Card 1 */}
            <View style={[styles.card, { backgroundColor: isDark ? '#0f172a' : '#fff' }]}>
              <View style={styles.cardInfo}>
                <ImageBackground
                  source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBR0b_HtyojffIY6GBWEOP72fKjKXiz14ai3V6859g3Oth58o0A84PaLuSC6yAppnl9El79LljNxIBlmHZQL_AmwYmlOe3It5bMZ6R4ID3HHY3tTQl07DDxXsmSHnZde1Rq22_dpQDSpxN1fgEcfYwnZHFs_q6WlRdJmqdj8ysEAADE8EduW6jvPRPTJ-C85iOXI6UbkTlv9UF0qe-CqstuyOivJjI8J4CJJNI6LKYwybnhw7GlBlkXIIN5kE1JrLF2FxA2ZlCfSlA' }}
                  style={styles.cardImg}
                  imageStyle={{ borderRadius: 12 }}
                />
                <View style={styles.cardDetails}>
                  <View>
                    <Text style={[styles.cardTitle, { color: theme.text }]} numberOfLines={1}>Bole Medhanealem Mall</Text>
                    <Text style={styles.cardSubtitle} numberOfLines={1}>Cameroon St, Bole</Text>
                  </View>
                  <View style={styles.cardSlots}>
                    <MaterialIcons name="check-circle" size={14} color={secondary} />
                    <Text style={[styles.slotsText, { color: secondary }]}>12 slots available</Text>
                  </View>
                  <Text style={[styles.priceText, { color: primary }]}>$2.50<Text style={styles.priceUnit}>/hr</Text></Text>
                </View>
              </View>
              <View style={styles.cardFooter}>
                <TouchableOpacity style={[styles.reserveBtn, { backgroundColor: primary }]} onPress={() => router.push('/reserve' as any)}>
                  <Text style={styles.reserveBtnText}>Reserve Spot</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Card 2 */}
            <View style={[styles.card, styles.cardSelected, { backgroundColor: isDark ? '#0f172a' : '#fff', borderColor: primary }]}>
              <View style={styles.cardInfo}>
                <ImageBackground
                  source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAHWn4PSOhz2pvDWc_JghtnLbF9YTjSIdP-k-3a9SjssR8YSLBYgQ_-Y2ydN8N3pdEOsmBrpRnABa_Qv0oWpIzb70OBG52d4JO7zoXlYji6oBF8pHMGkRxSKND3F3nIIo4eyKbnHLS92OqgGuGqufG18JeF7yfduVziDJvGrP2tqmanqx9XaOCUcDVFl3UXnxaHlVQOM9u9jQ1TnCc1lEqiBMv1XHBSQHuEJa79jyaMp6JLyI5Mjnz4fXX0oK9Kk58lVCNk5pqVLLs' }}
                  style={styles.cardImg}
                  imageStyle={{ borderRadius: 12 }}
                />
                <View style={styles.cardDetails}>
                  <View>
                    <View style={styles.cardHeaderRow}>
                      <Text style={[styles.cardTitle, { color: theme.text, flex: 1 }]} numberOfLines={1}>Edna Mall Underground</Text>
                      <View style={[styles.selectedBadge, { backgroundColor: `${primary}1a` }]}>
                        <Text style={[styles.selectedBadgeText, { color: primary }]}>SELECTED</Text>
                      </View>
                    </View>
                    <Text style={styles.cardSubtitle} numberOfLines={1}>Bole Road, Central</Text>
                  </View>
                  <View style={styles.cardSlots}>
                    <MaterialIcons name="check-circle" size={14} color={secondary} />
                    <Text style={[styles.slotsText, { color: secondary }]}>4 slots available</Text>
                  </View>
                  <Text style={[styles.priceText, { color: primary }]}>$3.00<Text style={styles.priceUnit}>/hr</Text></Text>
                </View>
              </View>
              <View style={styles.cardFooter}>
                <TouchableOpacity style={[styles.reserveBtn, { backgroundColor: primary }]} onPress={() => router.push('/reserve' as any)}>
                  <Text style={styles.reserveBtnText}>Reserve Spot</Text>
                </TouchableOpacity>
              </View>
            </View>
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
  mapImage: {
    ...StyleSheet.absoluteFillObject,
  },
  mapGradientOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(248, 250, 252, 0.2)',
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
    position: 'absolute',
    width: 38,
    height: 38,
    backgroundColor: '#064e3b',
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  pPinActive: {
    transform: [{ scale: 1.15 }],
    borderWidth: 3,
    borderColor: '#fff',
  },
  pPinText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 18,
  },
  pPinTextActive: {
    color: '#fff',
    fontWeight: '900',
    fontSize: 18,
  },
  userLocation: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -10 }, { translateY: -10 }],
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 30,
  },
  userPulse: {
    position: 'absolute',
    width: 80,
    height: 80,
    backgroundColor: 'rgba(6,78,59,0.1)',
    borderRadius: 40,
  },
  userDot: {
    width: 20,
    height: 20,
    backgroundColor: '#064e3b',
    borderRadius: 10,
    borderWidth: 4,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
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
