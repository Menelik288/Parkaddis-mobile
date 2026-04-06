import React, { useState } from 'react';
import { StyleSheet, Image, View, ScrollView, TouchableOpacity, useColorScheme, Platform, Text, Modal, TouchableWithoutFeedback } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Colors } from '@/constants/theme';
import { useRouter } from 'expo-router';

export default function DashboardScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const theme = Colors[colorScheme ?? 'light'];
  const router = useRouter();

  const [menuVisible, setMenuVisible] = useState(false);

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#0f172a' : '#f8fafc' }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: isDark ? 'rgba(15,23,42,0.9)' : 'rgba(248,250,252,0.9)' }]}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => setMenuVisible(true)}>
            <MaterialIcons name="menu" size={28} color={isDark ? '#34d399' : '#064e3b'} />
          </TouchableOpacity>
          <View style={styles.logoContainer}>
            <Text style={[styles.logoText, { color: isDark ? '#34d399' : '#064e3b' }]}>PARK</Text>
            <Text style={[styles.logoText, { color: '#94a3b8' }]}>ADDIS</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.profileBtn}>
          <Image 
            source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCfC1XV-tRFlO0NiqcRcFa--y4bpmuh9swWvoAaMvj2IvH2vm7qnVj20dp0eSSkRpiB1710oTpA7oPCpcsg-tdcVIlntEr-a7GlvN-nG2wcF3EJedwSIkq8YiYfClTDkcfQdm72c3cNETGcgvDz27uUiWqwUzV5jj-PD88NNMlY01Zv_9Nz5bhWRamVKBXWbRR5jnFHDRugm70WIqLYvYddsFhUwvFwy4ozs-r1lpU4Yet8usvzM66yQmxBVHDLDZ14soL-L-lBkTc' }}
            style={styles.profileImage}
          />
        </TouchableOpacity>
      </View>

      <Modal visible={menuVisible} transparent animationType="fade">
        <TouchableWithoutFeedback onPress={() => setMenuVisible(false)}>
          <View style={styles.menuOverlay}>
            <TouchableWithoutFeedback>
              <View style={[styles.menuDropdown, { backgroundColor: isDark ? '#1e293b' : '#ffffff', borderColor: isDark ? '#334155' : '#e2e8f0' }]}>
                <TouchableOpacity 
                  style={styles.menuItem} 
                  onPress={() => { setMenuVisible(false); router.push('/saved' as any); }}
                >
                  <MaterialIcons name="bookmark" size={20} color={isDark ? '#34d399' : '#064e3b'} />
                  <Text style={[styles.menuItemText, { color: isDark ? '#f8fafc' : '#0f172a' }]}>Saved Spots</Text>
                </TouchableOpacity>
                
                <View style={[styles.menuDivider, { backgroundColor: isDark ? '#334155' : '#f1f5f9' }]} />
                
                <TouchableOpacity 
                  style={styles.menuItem} 
                  onPress={() => { setMenuVisible(false); router.push('/settings' as any); }}
                >
                  <MaterialIcons name="settings" size={20} color={isDark ? '#34d399' : '#064e3b'} />
                  <Text style={[styles.menuItemText, { color: isDark ? '#f8fafc' : '#0f172a' }]}>Settings</Text>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Welcome */}
        <View style={styles.greetingSection}>
          <Text style={styles.welcomeSubtitle}>WELCOME BACK</Text>
          <Text style={[styles.greetingTitle, { color: isDark ? '#34d399' : '#064e3b' }]}>Good Afternoon, Driver</Text>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={[styles.statCard, { backgroundColor: isDark ? '#1e293b' : '#ffffff', borderColor: isDark ? '#334155' : '#f8fafc' }]}>
            <View style={[styles.statIconContainer, { backgroundColor: isDark ? 'rgba(52,211,153,0.2)' : '#d1fae5' }]}>
              <MaterialIcons name="bookmark-border" size={24} color={isDark ? '#34d399' : '#064e3b'} />
            </View>
            <View>
              <Text style={styles.statLabel}>Active Reservations</Text>
              <Text style={[styles.statValue, { color: isDark ? '#f8fafc' : '#0f172a' }]}>00</Text>
            </View>
          </View>

          <View style={[styles.statCard, { backgroundColor: isDark ? '#1e293b' : '#ffffff', borderColor: isDark ? '#334155' : '#f8fafc' }]}>
            <View style={[styles.statIconContainer, { backgroundColor: isDark ? '#334155' : '#e2e8f0' }]}>
              <MaterialIcons name="history" size={24} color={isDark ? '#94a3b8' : '#475569'} />
            </View>
            <View>
              <Text style={styles.statLabel}>Total Bookings</Text>
              <Text style={[styles.statValue, { color: isDark ? '#f8fafc' : '#0f172a' }]}>148</Text>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActionSection}>
          <Text style={[styles.sectionTitle, { color: isDark ? '#f8fafc' : '#0f172a' }]}>Quick Actions</Text>
          <View style={[styles.quickActionCard, { backgroundColor: isDark ? 'rgba(52,211,153,0.1)' : 'rgba(236,253,245,0.4)', borderColor: isDark ? 'rgba(52,211,153,0.2)' : 'rgba(209,250,229,0.3)' }]}>
            <View style={[styles.quickActionIconContainer, { backgroundColor: isDark ? 'rgba(52,211,153,0.2)' : 'rgba(209,250,229,0.6)' }]}>
              <MaterialIcons name="location-on" size={32} color={isDark ? '#34d399' : '#064e3b'} />
            </View>
            <Text style={[styles.quickActionTitle, { color: isDark ? '#f8fafc' : '#0f172a' }]}>Ready to park?</Text>
            <Text style={[styles.quickActionSubtitle, { color: isDark ? '#94a3b8' : '#475569' }]}>
              Find the best premium parking spots in Addis Ababa with real-time availability.
            </Text>
            <TouchableOpacity 
              style={[styles.quickActionButton, { backgroundColor: isDark ? '#34d399' : '#064e3b' }]}
              onPress={() => router.push('/find' as any)}
              activeOpacity={0.8}
            >
              <Text style={[styles.quickActionBtnText, { color: isDark ? '#0f172a' : '#ffffff' }]}>Find Parking Nearby</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Recent History */}
        <View style={styles.historySection}>
          <View style={styles.historyHeader}>
            <Text style={[styles.sectionTitle, { color: isDark ? '#f8fafc' : '#0f172a' }]}>Recent History</Text>
            <TouchableOpacity>
              <Text style={[styles.historyAction, { color: isDark ? '#34d399' : '#064e3b' }]}>VIEW ALL</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.historyList}>
            {/* Item 1 */}
            <TouchableOpacity style={[styles.historyItem, { backgroundColor: isDark ? '#1e293b' : '#ffffff', borderColor: isDark ? '#334155' : '#f8fafc' }]} activeOpacity={0.7}>
              <View style={styles.historyLeft}>
                <View style={[styles.historyIcon, { backgroundColor: isDark ? '#0f172a' : '#f1f5f9' }]}>
                  <MaterialIcons name="local-parking" size={24} color={isDark ? '#94a3b8' : '#475569'} />
                </View>
                <View>
                  <Text style={[styles.historyItemTitle, { color: isDark ? '#f8fafc' : '#0f172a' }]}>Bole District A-2</Text>
                  <Text style={styles.historyTime}>Oct 12 • 2h 15m</Text>
                </View>
              </View>
              <View style={styles.historyRight}>
                <Text style={[styles.historyItemPrice, { color: isDark ? '#f8fafc' : '#0f172a' }]}>$8.00</Text>
                <Text style={styles.paidBadge}>PAID</Text>
              </View>
            </TouchableOpacity>

            {/* Item 2 */}
            <TouchableOpacity style={[styles.historyItem, { backgroundColor: isDark ? '#1e293b' : '#ffffff', borderColor: isDark ? '#334155' : '#f8fafc' }]} activeOpacity={0.7}>
              <View style={styles.historyLeft}>
                <View style={[styles.historyIcon, { backgroundColor: isDark ? '#0f172a' : '#f1f5f9' }]}>
                  <MaterialIcons name="apartment" size={24} color={isDark ? '#94a3b8' : '#475569'} />
                </View>
                <View>
                  <Text style={[styles.historyItemTitle, { color: isDark ? '#f8fafc' : '#0f172a' }]}>Churchill Ave Plaza</Text>
                  <Text style={styles.historyTime}>Oct 10 • 4h 30m</Text>
                </View>
              </View>
              <View style={styles.historyRight}>
                <Text style={[styles.historyItemPrice, { color: isDark ? '#f8fafc' : '#0f172a' }]}>$22.50</Text>
                <Text style={styles.paidBadge}>PAID</Text>
              </View>
            </TouchableOpacity>

            {/* Item 3 */}
            <TouchableOpacity style={[styles.historyItem, { backgroundColor: isDark ? '#1e293b' : '#ffffff', borderColor: isDark ? '#334155' : '#f8fafc' }]} activeOpacity={0.7}>
              <View style={styles.historyLeft}>
                <View style={[styles.historyIcon, { backgroundColor: isDark ? '#0f172a' : '#f1f5f9' }]}>
                  <MaterialIcons name="shopping-bag" size={24} color={isDark ? '#94a3b8' : '#475569'} />
                </View>
                <View>
                  <Text style={[styles.historyItemTitle, { color: isDark ? '#f8fafc' : '#0f172a' }]}>Edna Mall Underground</Text>
                  <Text style={styles.historyTime}>Oct 09 • 1h 05m</Text>
                </View>
              </View>
              <View style={styles.historyRight}>
                <Text style={[styles.historyItemPrice, { color: isDark ? '#f8fafc' : '#0f172a' }]}>$5.00</Text>
                <Text style={styles.paidBadge}>PAID</Text>
              </View>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 20,
    zIndex: 10,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  menuOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  menuDropdown: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 100 : 80,
    left: 20,
    width: 200,
    borderRadius: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
    padding: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 12,
    borderRadius: 8,
  },
  menuItemText: {
    fontSize: 15,
    fontWeight: '600',
  },
  menuDivider: {
    height: 1,
    width: '100%',
    marginVertical: 4,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoText: {
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -1,
  },
  profileBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#064e3b',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    backgroundColor: '#d1fae5',
  },
  profileImage: {
    width: '100%',
    height: '100%',
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  greetingSection: {
    marginTop: 8,
    marginBottom: 32,
  },
  welcomeSubtitle: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 2,
    color: '#94a3b8',
    marginBottom: 8,
  },
  greetingTitle: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 32,
  },
  statCard: {
    flex: 1,
    padding: 20,
    borderRadius: 24,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.04,
    shadowRadius: 24,
    elevation: 3,
    justifyContent: 'space-between',
    aspectRatio: 1,
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statLabel: {
    color: '#475569',
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 32,
    fontWeight: '700',
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  quickActionSection: {
    marginBottom: 32,
  },
  quickActionCard: {
    marginTop: 16,
    borderWidth: 1,
    borderRadius: 40,
    padding: 32,
    alignItems: 'center',
  },
  quickActionIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  quickActionTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 12,
  },
  quickActionSubtitle: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
    maxWidth: 260,
  },
  quickActionButton: {
    width: '100%',
    maxWidth: 240,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#064e3b',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 8,
  },
  quickActionBtnText: {
    fontSize: 14,
    fontWeight: '700',
  },
  historySection: {
    marginBottom: 24,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  historyAction: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  historyList: {
    gap: 12,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderRadius: 24,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.02,
    shadowRadius: 10,
    elevation: 1,
  },
  historyLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  historyIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  historyItemTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  historyTime: {
    fontSize: 12,
    color: '#475569',
  },
  historyRight: {
    alignItems: 'flex-end',
  },
  historyItemPrice: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  paidBadge: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    color: '#059669',
  },
});
