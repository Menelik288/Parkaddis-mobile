import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Image, useColorScheme, Platform } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Colors } from '@/constants/theme';
import { useRouter } from 'expo-router';

export default function BookingsScreen() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const isDark = colorScheme === 'dark';
  const primary = '#064e3b';
  const router = useRouter();

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: isDark ? 'rgba(15,23,42,0.9)' : 'rgba(248,250,252,0.9)' }]}>
        <View style={styles.headerLeft}>
          <View style={styles.logoContainer}>
            <MaterialIcons name="local-parking" size={20} color="#fff" />
          </View>
          <Text style={[styles.headerTitle, { color: theme.tint }]}>ParkAddis</Text>
        </View>
        <TouchableOpacity style={[styles.notificationBtn, { backgroundColor: isDark ? '#1e293b' : '#fff', borderColor: isDark ? '#334155' : '#e2e8f0' }]}>
          <MaterialIcons name="notifications" size={20} color={theme.icon} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Headline Section */}
        <View style={styles.headlineSection}>
          <Text style={[styles.headlineTitle, { color: theme.text }]}>My Bookings</Text>
          <Text style={styles.headlineSubtitle}>Manage your active and past reservations</Text>
        </View>

        {/* Active Reservation Card */}
        <View style={[styles.activeCard, { backgroundColor: isDark ? '#0f172a' : '#fff' }]}>
          <View style={styles.activeMapContainer}>
            <Image 
              source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDIsNoPwKGoTK2HeONEbMxDr4flroBwxgk68xgQFUd17TR6s_zLcLeIW4EyZX1xv12xR7pn7kELKhDTJaMfe8HlCK7COSKyq2rT5NV4wIMXbQVuTNLgiemoeSjCIbXLbgCa5NxkXRzxRSSrRxtRelo1GllVQvHqDSP_EdK5ILODJz9ttrK5Htq3JNXBjpnZwXl-6t7W2uRB00c3AEj1edPAWso1j2B4POYKRcex9Lqlhsjtk8CdbKEwqn0ngzur0xRPwIrJ9O_9sMKo' }} 
              style={styles.activeMapImg} 
            />
            <View style={[styles.mapOverlay, { backgroundColor: 'rgba(6,78,59,0.1)' }]} />
            <View style={[styles.zoneBadge, { backgroundColor: isDark ? 'rgba(15,23,42,0.9)' : 'rgba(255,255,255,0.9)' }]}>
              <MaterialIcons name="location-on" size={16} color={primary} />
              <Text style={[styles.zoneBadgeText, { color: primary }]}>Zone A-42</Text>
            </View>
          </View>
          
          <View style={styles.activeInfo}>
            <View style={styles.activeHeaderRow}>
              <Text style={[styles.activeTitle, { color: theme.text }]} numberOfLines={1}>Bole Medhanealem Parking</Text>
              <View style={[styles.statusBadgeActive, { backgroundColor: isDark ? 'rgba(6,78,59,0.2)' : '#ecfdf5' }]}>
                <Text style={[styles.statusBadgeTextActive, { color: primary }]}>ACTIVE</Text>
              </View>
            </View>
            
            <View style={styles.timeRemainingRow}>
              <Text style={[styles.timeLarge, { color: primary }]}>14:22</Text>
              <Text style={styles.timeLabel}>remaining</Text>
            </View>
            
            <View style={[styles.progressBarBg, { backgroundColor: isDark ? '#1e293b' : '#f1f5f9' }]}>
              <View style={[styles.progressBarFill, { backgroundColor: primary, width: '65%' }]} />
            </View>
            
            <View style={styles.actionButtonsRow}>
              <TouchableOpacity style={[styles.btnOutline, { borderColor: isDark ? '#334155' : '#cbd5e1' }]}>
                <MaterialIcons name="timer" size={18} color={theme.text} />
                <Text style={[styles.btnOutlineText, { color: theme.text }]}>Extend</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.btnPrimary, { backgroundColor: primary }]}>
                <MaterialIcons name="directions" size={18} color="#fff" />
                <Text style={styles.btnPrimaryText}>Get Directions</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Recent Bookings */}
        <View style={styles.recentSection}>
          <View style={styles.recentHeader}>
            <Text style={[styles.recentTitle, { color: theme.text }]}>Recent Bookings</Text>
            <TouchableOpacity><Text style={[styles.viewAllText, { color: primary }]}>View All</Text></TouchableOpacity>
          </View>
          
          <View style={styles.historyList}>
            {/* Item 1 */}
            <View style={[styles.historyItem, { backgroundColor: isDark ? '#0f172a' : '#fff', borderColor: isDark ? '#1e293b' : '#e2e8f0' }]}>
              <View style={[styles.historyIcon, { backgroundColor: isDark ? '#1e293b' : '#f8fafc' }]}>
                <MaterialIcons name="local-parking" size={24} color={theme.icon} />
              </View>
              <View style={styles.historyInfo}>
                <Text style={[styles.historyItemTitle, { color: theme.text }]}>Edna Mall Garage</Text>
                <Text style={styles.historyTime}>Oct 25 • 2h 30m</Text>
              </View>
              <View style={styles.historyRight}>
                <Text style={[styles.historyPrice, { color: theme.text }]}>ETB 45.00</Text>
                <Text style={styles.historyStatus}>COMPLETED</Text>
              </View>
            </View>

            {/* Item 2 */}
            <View style={[styles.historyItem, { backgroundColor: isDark ? '#0f172a' : '#fff', borderColor: isDark ? '#1e293b' : '#e2e8f0' }]}>
              <View style={[styles.historyIcon, { backgroundColor: isDark ? '#1e293b' : '#f8fafc' }]}>
                <MaterialIcons name="local-parking" size={24} color={theme.icon} />
              </View>
              <View style={styles.historyInfo}>
                <Text style={[styles.historyItemTitle, { color: theme.text }]}>Addis Ababa Museum</Text>
                <Text style={styles.historyTime}>Oct 22 • 1h 15m</Text>
              </View>
              <View style={styles.historyRight}>
                <Text style={[styles.historyPrice, { color: theme.text }]}>ETB 25.00</Text>
                <Text style={styles.historyStatus}>COMPLETED</Text>
              </View>
            </View>

            {/* Item 3 */}
            <View style={[styles.historyItem, { backgroundColor: isDark ? '#0f172a' : '#fff', borderColor: isDark ? '#1e293b' : '#e2e8f0' }]}>
              <View style={[styles.historyIcon, { backgroundColor: isDark ? '#1e293b' : '#f8fafc' }]}>
                <MaterialIcons name="local-parking" size={24} color={theme.icon} />
              </View>
              <View style={styles.historyInfo}>
                <Text style={[styles.historyItemTitle, { color: theme.text }]}>Dembel City Center</Text>
                <Text style={styles.historyTime}>Oct 20 • 4h 00m</Text>
              </View>
              <View style={styles.historyRight}>
                <Text style={[styles.historyPrice, { color: theme.text }]}>ETB 80.00</Text>
                <Text style={[styles.historyStatus, { color: '#ef4444' }]}>CANCELLED</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 20,
    zIndex: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'transparent', // Will inherit from conditional styling if needed, but dashboard has flat look
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logoContainer: {
    backgroundColor: '#064e3b',
    padding: 8,
    borderRadius: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  notificationBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 40,
  },
  headlineSection: {
    marginBottom: 32,
  },
  headlineTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  headlineSubtitle: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 2,
  },
  activeCard: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 6,
    marginBottom: 40,
  },
  activeMapContainer: {
    height: 180,
    position: 'relative',
  },
  activeMapImg: {
    ...StyleSheet.absoluteFillObject,
  },
  mapOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  zoneBadge: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  zoneBadgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  activeInfo: {
    padding: 24,
  },
  activeHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  activeTitle: {
    fontSize: 18,
    fontWeight: '700',
    flex: 1,
    marginRight: 16,
  },
  statusBadgeActive: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusBadgeTextActive: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  timeRemainingRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
  },
  timeLarge: {
    fontSize: 36,
    fontWeight: '800',
    letterSpacing: -1,
  },
  timeLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748b',
  },
  progressBarBg: {
    height: 8,
    borderRadius: 4,
    marginTop: 16,
    marginBottom: 24,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  actionButtonsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  btnOutline: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
  },
  btnOutlineText: {
    fontSize: 14,
    fontWeight: '700',
  },
  btnPrimary: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  btnPrimaryText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  recentSection: {
    marginBottom: 24,
  },
  recentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  recentTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  viewAllText: {
    fontSize: 12,
    fontWeight: '700',
  },
  historyList: {
    gap: 12,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 1,
  },
  historyIcon: {
    width: 48,
    height: 48,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  historyInfo: {
    flex: 1,
  },
  historyItemTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 2,
  },
  historyTime: {
    fontSize: 12,
    color: '#64748b',
  },
  historyRight: {
    alignItems: 'flex-end',
  },
  historyPrice: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 2,
  },
  historyStatus: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
});
