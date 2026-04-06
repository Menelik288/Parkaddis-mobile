import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Image, useColorScheme, Platform } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Colors } from '@/constants/theme';
import { useRouter } from 'expo-router';

export default function TicketsScreen() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const isDark = colorScheme === 'dark';
  const primary = '#064e3b';
  const router = useRouter();

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#0f172a' : '#f8fafc' }]}>
      {/* TopAppBar */}
      <View style={styles.topOverlay}>
        <TouchableOpacity onPress={() => router.back()} style={[styles.pillButton, { backgroundColor: isDark ? '#1e293b' : '#fff', borderColor: isDark ? '#334155' : '#fff' }]}>
          <MaterialIcons name="arrow-back" size={24} color={isDark ? '#34d399' : primary} />
        </TouchableOpacity>
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

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Page Headline */}
        <View style={styles.headerBox}>
          <Text style={[styles.pageTitle, { color: isDark ? '#f8fafc' : '#0f172a' }]}>Your Tickets</Text>
          <Text style={styles.pageSubtitle}>Manage your active and previous parking sessions.</Text>
        </View>

        {/* Filter Toggle */}
        <View style={[styles.filterToggle, { backgroundColor: isDark ? '#1e293b' : '#f1f5f9' }]}>
          <TouchableOpacity style={[styles.filterBtnActive, { backgroundColor: isDark ? '#34d399' : primary }]}>
            <Text style={[styles.filterBtnTextActive, { color: isDark ? '#064e3b' : '#fff' }]}>Active</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.filterBtnInactive}>
            <Text style={styles.filterBtnTextInactive}>Expired</Text>
          </TouchableOpacity>
        </View>

        {/* Active Session Section */}
        <View style={styles.activeSection}>
          <View style={[styles.activeCard, { backgroundColor: isDark ? '#1e293b' : '#fff', borderColor: isDark ? '#334155' : 'transparent', borderWidth: isDark ? 1 : 0 }]}>
            <View style={[styles.activeCardTop, { borderBottomColor: isDark ? '#334155' : 'rgba(148,163,184,0.3)' }]}>
              {/* Notches */}
              <View style={[styles.notchLeft, { backgroundColor: isDark ? '#0f172a' : '#f8fafc' }]} />
              <View style={[styles.notchRight, { backgroundColor: isDark ? '#0f172a' : '#f8fafc' }]} />
              
              <View style={styles.activeCardInfo}>
                <View style={styles.infoRowBlock}>
                  <Text style={styles.labelSmall}>LOCATION</Text>
                  <Text style={[styles.locationTitle, { color: isDark ? '#34d399' : primary }]}>Addis Plaza North</Text>
                </View>
                <View style={styles.detailsRow}>
                  <View style={styles.detailsBlock}>
                    <Text style={styles.labelSmall}>BAY</Text>
                    <Text style={[styles.detailValue, { color: isDark ? '#f8fafc' : '#0f172a' }]}>A-42</Text>
                  </View>
                  <View style={styles.detailsBlock}>
                    <Text style={styles.labelSmall}>STARTED</Text>
                    <Text style={[styles.detailValue, { color: isDark ? '#f8fafc' : '#0f172a' }]}>10:45 AM</Text>
                  </View>
                </View>
              </View>
              
              <View style={styles.ticketBtnWrapper}>
                <TouchableOpacity style={[styles.ticketBtn, { backgroundColor: isDark ? '#34d399' : primary }]}>
                  <MaterialIcons name="qr-code-2" size={16} color={isDark ? '#064e3b' : '#fff'} />
                  <Text style={[styles.ticketBtnText, { color: isDark ? '#064e3b' : '#fff' }]}>TICKET</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={[styles.activeCardBottom, { backgroundColor: isDark ? 'rgba(52,211,153,0.1)' : primary }]}>
              <View style={styles.costBox}>
                <Text style={[styles.costLabel, { color: isDark ? '#34d399' : 'rgba(255,255,255,0.7)' }]}>CURRENT COST</Text>
                <Text style={[styles.costAmount, { color: isDark ? '#34d399' : '#fff' }]}>250 ETB</Text>
              </View>
              <TouchableOpacity style={[styles.addTimeBtn, { backgroundColor: isDark ? '#34d399' : '#fff' }]}>
                <Text style={[styles.addTimeBtnText, { color: isDark ? '#064e3b' : primary }]}>ADD TIME</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Upcoming Reservations */}
        <View style={styles.upcomingSection}>
          <Text style={styles.sectionLabel}>UPCOMING RESERVATIONS</Text>
          
          <View style={styles.upcomingList}>
            {/* Card 1 */}
            <TouchableOpacity style={[styles.upcomingCard, { backgroundColor: isDark ? '#1e293b' : '#fff', borderColor: isDark ? '#334155' : '#e2e8f0' }]} activeOpacity={0.7}>
              <Image source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCTZLNTdVfhdL-h_XPx22k3KwWtuJhq0H_wyZRXho3OQCpCCjoZiH7U9RlJuzy4LvB5AP78CjAr_s-dClEBDZ8men8IOPYHVx3vKzvg-GNAxHCJ5gurKsLsL72h0aKu_I9mOdorSO4tcjxzUIiqX8mpFgHDWMzl8RIumd7-ja5ksRhLK7DWb0FVdp3DbHb_dUMjmxDqVIyLo9SYf2EaGEwFGlYzp3l7n68hsJwai2MRMmSM7-Nl7pYXk7sj0p1P67LCDnm156Ye3jQ' }} style={styles.upcomingImage} />
              <View style={styles.upcomingDetails}>
                <View style={styles.upcomingMeta}>
                  <View style={[styles.tagBadge, { backgroundColor: isDark ? '#334155' : '#f1f5f9' }]}>
                    <Text style={[styles.tagText, { color: isDark ? '#94a3b8' : '#475569' }]}>PREPAID</Text>
                  </View>
                  <Text style={styles.bookingId}>#PA-902</Text>
                </View>
                <Text style={[styles.upcomingTitle, { color: isDark ? '#f8fafc' : '#0f172a' }]}>Kazanchis Tower</Text>
                <Text style={styles.upcomingTime}>Tomorrow, 09:00 AM</Text>
              </View>
              <MaterialIcons name="chevron-right" size={24} color={isDark ? '#475569' : '#cbd5e1'} />
            </TouchableOpacity>

            {/* Card 2 */}
            <TouchableOpacity style={[styles.upcomingCard, { backgroundColor: isDark ? '#1e293b' : '#fff', borderColor: isDark ? '#334155' : '#e2e8f0' }]} activeOpacity={0.7}>
              <Image source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCZ0AoUoK1XSVkeBl7WTyfiBbrMP94HzOMVrKNHirQ-zxcLmv_YFdYjJrrtRqv58ejuz2POyqSvHqjy87WrQxNMabEKuRRemi_1R7SEAP5Yoely70nxsr5vyzaR2ET0IQxCtWzeQvbiyBhaH6tDJMGnPGLv4SSb06H5P1ORYERL48RTIGOGvX_3YKsJDHBDJpzZ5rVWQuQrWNvPYFbcVhIqzXFnIdsvEgd5FHrE4fZjSjDQCxF-NncKJ0Nj4fJccWgqOQCrjJjv9Ao' }} style={styles.upcomingImage} />
              <View style={styles.upcomingDetails}>
                <View style={styles.upcomingMeta}>
                  <View style={[styles.tagBadge, { backgroundColor: isDark ? 'rgba(52,211,153,0.1)' : '#ecfdf5' }]}>
                    <Text style={[styles.tagText, { color: isDark ? '#34d399' : primary }]}>VALET</Text>
                  </View>
                  <Text style={styles.bookingId}>#PA-441</Text>
                </View>
                <Text style={[styles.upcomingTitle, { color: isDark ? '#f8fafc' : '#0f172a' }]}>Sheraton Addis</Text>
                <Text style={styles.upcomingTime}>Oct 24, 07:30 PM</Text>
              </View>
              <MaterialIcons name="chevron-right" size={24} color={isDark ? '#475569' : '#cbd5e1'} />
            </TouchableOpacity>
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
  topOverlay: {
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: 24,
    paddingBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 50,
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
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 40,
    paddingTop: 16,
  },
  headerBox: {
    marginBottom: 32,
  },
  pageTitle: {
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  pageSubtitle: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 4,
  },
  filterToggle: {
    flexDirection: 'row',
    padding: 6,
    borderRadius: 16,
    marginBottom: 32,
  },
  filterBtnActive: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
  },
  filterBtnInactive: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
  },
  filterBtnTextActive: {
    fontSize: 14,
    fontWeight: '700',
  },
  filterBtnTextInactive: {
    fontSize: 14,
    fontWeight: '700',
    color: '#475569',
  },
  activeSection: {
    marginBottom: 40,
  },
  activeCard: {
    borderRadius: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 4,
    overflow: 'hidden',
  },
  activeCardTop: {
    padding: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottomWidth: 1,
    borderStyle: 'dashed',
    position: 'relative',
  },
  notchLeft: {
    position: 'absolute',
    left: -12,
    top: '50%',
    marginTop: -12,
    width: 24,
    height: 24,
    borderRadius: 12,
    zIndex: 10,
  },
  notchRight: {
    position: 'absolute',
    right: -12,
    top: '50%',
    marginTop: -12,
    width: 24,
    height: 24,
    borderRadius: 12,
    zIndex: 10,
  },
  activeCardInfo: {
    flex: 1,
    gap: 16,
  },
  infoRowBlock: {
    gap: 2,
  },
  labelSmall: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    color: '#475569',
  },
  locationTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  detailsRow: {
    flexDirection: 'row',
    gap: 32,
  },
  detailsBlock: {
    gap: 2,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  ticketBtnWrapper: {
    alignSelf: 'center',
  },
  ticketBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
  },
  ticketBtnText: {
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  activeCardBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
  },
  costBox: {
    gap: 2,
  },
  costLabel: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  costAmount: {
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  addTimeBtn: {
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  addTimeBtnText: {
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  upcomingSection: {
    gap: 16,
  },
  sectionLabel: {
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1,
    color: '#475569',
  },
  upcomingList: {
    gap: 12,
  },
  upcomingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    gap: 16,
  },
  upcomingImage: {
    width: 64,
    height: 64,
    borderRadius: 8,
  },
  upcomingDetails: {
    flex: 1,
  },
  upcomingMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 2,
  },
  tagBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  tagText: {
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  bookingId: {
    fontSize: 8,
    fontWeight: '700',
    color: '#94a3b8',
  },
  upcomingTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  upcomingTime: {
    fontSize: 11,
    color: '#475569',
    marginTop: 2,
  },
});
