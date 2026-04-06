import { StyleSheet, View, Text, ScrollView, TouchableOpacity, ImageBackground, Image, useColorScheme, Platform, SafeAreaView } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Colors } from '@/constants/theme';
import { useRouter } from 'expo-router';

export default function ReserveScreen() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const isDark = colorScheme === 'dark';
  const primary = '#064e3b';
  const router = useRouter();

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: isDark ? 'rgba(15,23,42,0.9)' : 'rgba(255,255,255,0.9)', borderBottomColor: isDark ? '#1e293b' : '#f1f5f9' }]}>
        <TouchableOpacity style={styles.headerBtn} onPress={() => router.back()}>
          <MaterialIcons name="arrow-back-ios" size={20} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Parking Details</Text>
        <TouchableOpacity style={styles.headerBtn}>
          <MaterialIcons name="share" size={22} color={theme.text} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Hero Image */}
        <View style={styles.heroWrapper}>
          <ImageBackground 
            source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAJr5GaSyIvZ6YyaGosZK4ZirMKJLAi5ALrWlA-z4s5jZXAnIyJXfVw7mTQ6jh7FhwxxUo5ur3nuO5ZF-kr_RuweOlS2dMZU7qQPoMpB-BKVFV765uaVmJbgzwu6X8s7HGFi9UEAZTL2fpmD36Hd8CKuKW8hn4HETFHxb-x88ZMjaCZt1bTXPYU_s_lQa6eRuERKnmLdskrYUkrsB675o08kdL8twZEaR8CSBXUYPecoDOOG2sF34Hlm7O9apskQ3uPgs5hr5iNJWc' }}
            style={styles.heroImage}
          />
          <View style={[styles.verifiedBadge, { backgroundColor: primary }]}>
            <MaterialIcons name="verified" size={14} color="#fff" />
            <Text style={styles.verifiedText}>VERIFIED SPOT</Text>
          </View>
        </View>

        <View style={styles.detailsContainer}>
          {/* Title & Location */}
          <View style={styles.titleSection}>
            <View style={styles.titleRow}>
              <Text style={[styles.title, { color: theme.text }]}>Downtown Secure Parking</Text>
              <View style={[styles.availableBadge, { backgroundColor: isDark ? 'rgba(6,78,59,0.2)' : '#ecfdf5' }]}>
                <View style={[styles.pulseDot, { backgroundColor: primary }]} />
                <Text style={[styles.availableText, { color: primary }]}>Available</Text>
              </View>
            </View>
            <View style={styles.locationRow}>
              <MaterialIcons name="location-on" size={20} color={primary} />
              <Text style={styles.locationText}>123 Sunshine Ave, Los Angeles, CA • 0.2 mi from you</Text>
            </View>

            {/* Amenities */}
            <View style={styles.amenitiesRow}>
              <View style={[styles.amenityBadge, { backgroundColor: isDark ? '#1e293b' : '#f8fafc', borderColor: isDark ? '#334155' : '#f1f5f9' }]}>
                <MaterialIcons name="ev-station" size={18} color={primary} />
                <Text style={[styles.amenityText, { color: isDark ? '#cbd5e1' : '#475569' }]}>EV CHARGING</Text>
              </View>
              <View style={[styles.amenityBadge, { backgroundColor: isDark ? '#1e293b' : '#f8fafc', borderColor: isDark ? '#334155' : '#f1f5f9' }]}>
                <MaterialIcons name="security" size={18} color={primary} />
                <Text style={[styles.amenityText, { color: isDark ? '#cbd5e1' : '#475569' }]}>CCTV 24/7</Text>
              </View>
              <View style={[styles.amenityBadge, { backgroundColor: isDark ? '#1e293b' : '#f8fafc', borderColor: isDark ? '#334155' : '#f1f5f9' }]}>
                <MaterialIcons name="accessible" size={18} color={primary} />
                <Text style={[styles.amenityText, { color: isDark ? '#cbd5e1' : '#475569' }]}>HANDICAP</Text>
              </View>
            </View>
          </View>

          {/* Location Map Preview */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>LOCATION</Text>
          </View>
          <TouchableOpacity style={[styles.mapPreviewCard, { borderColor: isDark ? '#1e293b' : '#f1f5f9' }]} activeOpacity={0.9}>
            <ImageBackground 
              source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCf3uUy8uI5fg6yO8TLcjR5XjbBu6q7KlBeog8JiXP4EqTNgFP2oYoGVY4ABRKuoIZwm8ss3M5vSSp8B-CYFmDvquQ137fDbyKnXCBM7L4Poh-Vx-bvj2lW8xnUTS7XmLNC_FG-OgfCi_cI1kNcypJyagNiuwZWh1Zkx8YZtEd8DcguqHFj7SltNgD5KfKbzOxeIUhzr8RSc_-5T8WdaL9PTiAGN23KgCKHQnYxd0P_jqNsAipyiNB8LeVQBmcRdbg4XD8VRV4m7PE' }}
              style={styles.mapPreviewImg}
            />
            <View style={styles.mapOverlay} />
            <View style={styles.mapIconCenter}>
              <View style={[styles.mapIconPulse, { backgroundColor: 'rgba(6,78,59,0.2)' }]} />
              <MaterialIcons name="location-on" size={48} color={primary} style={styles.mapIconPin} />
            </View>
            <View style={[styles.openMapsBadge, { backgroundColor: isDark ? 'rgba(15,23,42,0.9)' : 'rgba(255,255,255,0.9)', borderColor: isDark ? '#334155' : '#f1f5f9' }]}>
              <Text style={[styles.openMapsText, { color: theme.text }]}>Open in Maps</Text>
            </View>
          </TouchableOpacity>

          {/* Parking Rules */}
          <View style={[styles.sectionHeader, { marginTop: 24 }]}>
            <Text style={styles.sectionTitle}>PARKING RULES</Text>
          </View>
          <View style={[styles.rulesCard, { backgroundColor: isDark ? 'rgba(30,41,59,0.5)' : '#f8fafc', borderColor: isDark ? '#1e293b' : '#f1f5f9' }]}>
            <View style={styles.ruleItem}>
              <View style={[styles.ruleIconWrapper, { backgroundColor: isDark ? '#1e293b' : '#fff' }]}>
                <MaterialIcons name="height" size={20} color={primary} />
              </View>
              <Text style={[styles.ruleText, { color: isDark ? '#cbd5e1' : '#334155' }]}>Max vehicle height: 2.1 meters</Text>
            </View>
            <View style={styles.ruleItem}>
              <View style={[styles.ruleIconWrapper, { backgroundColor: isDark ? '#1e293b' : '#fff' }]}>
                <MaterialIcons name="qr-code-2" size={20} color={primary} />
              </View>
              <Text style={[styles.ruleText, { color: isDark ? '#cbd5e1' : '#334155' }]}>Show QR code at the entrance</Text>
            </View>
            <View style={styles.ruleItem}>
              <View style={[styles.ruleIconWrapper, { backgroundColor: isDark ? '#1e293b' : '#fff' }]}>
                <MaterialIcons name="no-photography" size={20} color={primary} />
              </View>
              <Text style={[styles.ruleText, { color: isDark ? '#cbd5e1' : '#334155' }]}>No photography inside premises</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Floating Checkout Bar */}
      <View style={[styles.checkoutBar, { backgroundColor: isDark ? 'rgba(15,23,42,0.95)' : 'rgba(255,255,255,0.95)', borderTopColor: isDark ? '#1e293b' : '#f1f5f9' }]}>
        <View style={styles.checkoutPricingRow}>
          <View>
            <Text style={[styles.priceLarge, { color: theme.text }]}>$4.50<Text style={styles.priceUnit}> / hr</Text></Text>
            <Text style={styles.totalEstimate}>TOTAL ESTIMATE $13.50</Text>
          </View>
          <View style={[styles.instantBadge, { backgroundColor: isDark ? 'rgba(6,78,59,0.2)' : '#ecfdf5' }]}>
            <MaterialIcons name="bolt" size={16} color={primary} />
            <Text style={[styles.instantText, { color: primary }]}>INSTANT</Text>
          </View>
        </View>

        <View style={styles.timeSelectorGrid}>
          <View style={styles.timeSelectorCol}>
            <Text style={styles.timeSelectorLabel}>CHECK IN</Text>
            <View style={[styles.timeSelectorBox, { backgroundColor: isDark ? '#1e293b' : '#f1f5f9' }]}>
              <MaterialIcons name="calendar-today" size={18} color={primary} />
              <Text style={[styles.timeSelectorValue, { color: theme.text }]}>Today, 2 PM</Text>
            </View>
          </View>
          <View style={styles.timeSelectorCol}>
            <Text style={styles.timeSelectorLabel}>DURATION</Text>
            <View style={[styles.timeSelectorBox, { backgroundColor: isDark ? '#1e293b' : '#f1f5f9' }]}>
              <MaterialIcons name="timer" size={18} color={primary} />
              <Text style={[styles.timeSelectorValue, { color: theme.text }]}>3 Hours</Text>
            </View>
          </View>
        </View>

        <TouchableOpacity style={[styles.primaryBtn, { backgroundColor: primary }]} onPress={() => router.push('/confirmation' as any)} activeOpacity={0.8}>
          <Text style={styles.primaryBtnText}>Reserve Spot</Text>
          <MaterialIcons name="arrow-forward" size={20} color="#fff" style={styles.primaryBtnIcon} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
    paddingBottom: 16,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 40,
    borderBottomWidth: 1,
  },
  headerBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  scrollContent: {
    paddingTop: Platform.OS === 'ios' ? 90 : 70,
    paddingBottom: 240, // Space for checkout bar
  },
  heroWrapper: {
    width: '100%',
    aspectRatio: 4/3,
    position: 'relative',
  },
  heroImage: {
    ...StyleSheet.absoluteFillObject,
  },
  verifiedBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  verifiedText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
  },
  detailsContainer: {
    padding: 20,
  },
  titleSection: {
    gap: 16,
    marginBottom: 24,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 16,
  },
  title: {
    flex: 1,
    fontSize: 24,
    fontWeight: '800',
    lineHeight: 30,
    letterSpacing: -0.5,
  },
  availableBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  pulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  availableText: {
    fontSize: 12,
    fontWeight: '700',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  locationText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: '#64748b',
    lineHeight: 20,
  },
  amenitiesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  amenityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    gap: 6,
  },
  amenityText: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: -0.2,
  },
  sectionHeader: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  mapPreviewCard: {
    height: 176,
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 1,
  },
  mapPreviewImg: {
    ...StyleSheet.absoluteFillObject,
  },
  mapOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  mapIconCenter: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapIconPulse: {
    position: 'absolute',
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  mapIconPin: {
    zIndex: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  openMapsBadge: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  openMapsText: {
    fontSize: 10,
    fontWeight: '700',
  },
  rulesCard: {
    borderRadius: 16,
    padding: 16,
    gap: 16,
    borderWidth: 1,
  },
  ruleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  ruleIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  ruleText: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  checkoutBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: Platform.OS === 'ios' ? 32 : 20,
    borderTopWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 10,
  },
  checkoutPricingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  priceLarge: {
    fontSize: 30,
    fontWeight: '900',
  },
  priceUnit: {
    fontSize: 14,
    fontWeight: '700',
    color: '#64748b',
  },
  totalEstimate: {
    fontSize: 11,
    fontWeight: '700',
    color: '#94a3b8',
    marginTop: 2,
    letterSpacing: 1,
  },
  instantBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    gap: 4,
  },
  instantText: {
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1,
  },
  timeSelectorGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  timeSelectorCol: {
    flex: 1,
    gap: 6,
  },
  timeSelectorLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#94a3b8',
    letterSpacing: 1,
    paddingHorizontal: 4,
  },
  timeSelectorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    gap: 8,
  },
  timeSelectorValue: {
    fontSize: 14,
    fontWeight: '700',
  },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 56,
    borderRadius: 16,
    shadowColor: '#064e3b',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  primaryBtnText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '900',
  },
  primaryBtnIcon: {
    marginLeft: 8,
  },
});
