import { StyleSheet, View, Text, TouchableOpacity, useColorScheme, Platform, ScrollView } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Colors } from '@/constants/theme';
import { useRouter } from 'expo-router';

export default function ConfirmationScreen() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const isDark = colorScheme === 'dark';
  const primary = '#064e3b';
  const router = useRouter();

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: isDark ? '#0f172a' : '#fff', borderBottomColor: isDark ? '#1e293b' : '#f1f5f9' }]}>
        <TouchableOpacity style={styles.closeBtn} onPress={() => router.back()}>
          <MaterialIcons name="close" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Confirmation</Text>
        <View style={styles.closeBtn} /> {/* Spacer for centering */}
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Status Section */}
        <View style={styles.statusSection}>
          <View style={[styles.successIconWrapper, { backgroundColor: isDark ? 'rgba(52,211,153,0.2)' : '#dcfce7' }]}>
            <MaterialIcons name="check-circle" size={48} color={isDark ? '#34d399' : '#059669'} />
          </View>
          <Text style={[styles.statusTitle, { color: theme.text }]}>Reservation Confirmed</Text>
          <Text style={styles.statusSubtitle}>Your spot is waiting for you</Text>
        </View>

        {/* Ticket Card */}
        <View style={styles.ticketSection}>
          <View style={[styles.ticketCard, { backgroundColor: isDark ? '#0f172a' : '#fff', borderColor: isDark ? '#1e293b' : '#f1f5f9' }]}>
            
            <View style={styles.qrSection}>
              <View style={[styles.qrCodeBox, { backgroundColor: isDark ? '#1e293b' : '#f8fafc', borderColor: isDark ? '#334155' : '#e2e8f0' }]}>
                <MaterialIcons name="qr-code-2" size={96} color={isDark ? '#475569' : '#cbd5e1'} />
                <View style={[styles.qrBackgroundPattern, { opacity: isDark ? 0.05 : 0.1 }]} />
              </View>
              <Text style={styles.scanText}>SCAN AT ENTRY GATE</Text>
            </View>

            {/* Dashed Separator */}
            <View style={styles.separatorContainer}>
              <View style={[styles.cutoutLeft, { backgroundColor: theme.background }]} />
              <View style={styles.dashedLineContainer}>
                <View style={[styles.dashedLine, { borderColor: isDark ? '#1e293b' : '#f1f5f9' }]} />
              </View>
              <View style={[styles.cutoutRight, { backgroundColor: theme.background }]} />
            </View>

            <View style={styles.ticketDetails}>
              <View style={styles.detailTitleGroup}>
                <Text style={[styles.spotNumber, { color: theme.text }]}>Parking Spot #42</Text>
                <Text style={styles.spotLocation}>Grand Central Terminal Parking</Text>
              </View>

              <View style={styles.dateTimeGrid}>
                <View style={styles.dateTimeCol}>
                  <Text style={styles.dateTimeLabel}>DATE</Text>
                  <Text style={[styles.dateTimeValue, { color: theme.text }]}>Sept 20, 2023</Text>
                </View>
                <View style={styles.dateTimeCol}>
                  <Text style={styles.dateTimeLabel}>TIME</Text>
                  <Text style={[styles.dateTimeValue, { color: theme.text }]}>10:00 AM - 6:00 PM</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Receipt Summary */}
        <View style={styles.receiptSection}>
          <View style={styles.receiptRow}>
            <Text style={styles.receiptLabel}>Reservation ID</Text>
            <Text style={[styles.receiptValue, styles.receiptMono, { color: theme.text }]}>#PK-88291</Text>
          </View>
          <View style={[styles.receiptRow, styles.receiptRowTotal, { borderTopColor: isDark ? '#1e293b' : '#f1f5f9' }]}>
            <Text style={styles.receiptTotalLabel}>Total Paid</Text>
            <Text style={[styles.receiptTotalValue, { color: primary }]}>$25.00</Text>
          </View>
        </View>

      </ScrollView>

      {/* Footer Actions */}
      <View style={styles.footerSection}>
        <TouchableOpacity style={[styles.primaryBtn, { backgroundColor: primary }]} 
                          onPress={() => router.replace('/bookings' as any)} 
                          activeOpacity={0.8}>
          <Text style={styles.primaryBtnText}>View Bookings</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={[styles.secondaryBtn, { backgroundColor: isDark ? '#1e293b' : '#f1f5f9' }]} activeOpacity={0.8}>
          <MaterialIcons name="share" size={20} color={isDark ? '#10b981' : primary} style={styles.shareIcon} />
          <Text style={[styles.secondaryBtnText, { color: isDark ? '#10b981' : primary }]}>Share Receipt</Text>
        </TouchableOpacity>
        <View style={[styles.homeIndicator, { backgroundColor: isDark ? '#334155' : '#e2e8f0' }]} />
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
    borderBottomWidth: 1,
    zIndex: 10,
  },
  closeBtn: {
    width: 48,
    height: 48,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.5,
    marginRight: 24, // to balance the close button
  },
  scrollContent: {
    flexGrow: 1,
  },
  statusSection: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 24,
  },
  successIconWrapper: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  statusTitle: {
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: -0.5,
    marginBottom: 8,
    textAlign: 'center',
  },
  statusSubtitle: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
  },
  ticketSection: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  ticketCard: {
    borderRadius: 12,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  qrSection: {
    alignItems: 'center',
    padding: 24,
    gap: 16,
  },
  qrCodeBox: {
    width: 192,
    height: 192,
    borderRadius: 8,
    borderWidth: 2,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  qrBackgroundPattern: {
    ...StyleSheet.absoluteFillObject,
  },
  scanText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  separatorContainer: {
    height: 1,
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
  },
  dashedLineContainer: {
    position: 'absolute',
    left: 16,
    right: 16,
    height: 1,
    overflow: 'hidden',
  },
  dashedLine: {
    width: '100%',
    height: 2,
    borderWidth: 1,
    borderStyle: 'dashed',
    marginTop: -1,
  },
  cutoutLeft: {
    position: 'absolute',
    left: -8,
    width: 16,
    height: 16,
    borderRadius: 8,
    top: -8,
    zIndex: 2,
  },
  cutoutRight: {
    position: 'absolute',
    right: -8,
    width: 16,
    height: 16,
    borderRadius: 8,
    top: -8,
    zIndex: 2,
  },
  ticketDetails: {
    padding: 24,
    gap: 16,
  },
  detailTitleGroup: {
    gap: 4,
  },
  spotNumber: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  spotLocation: {
    fontSize: 16,
    color: '#64748b',
  },
  dateTimeGrid: {
    flexDirection: 'row',
    marginTop: 8,
    gap: 16,
  },
  dateTimeCol: {
    flex: 1,
    gap: 4,
  },
  dateTimeLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  dateTimeValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  receiptSection: {
    paddingHorizontal: 24,
    gap: 8,
    marginBottom: 40,
  },
  receiptRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  receiptRowTotal: {
    paddingTop: 12,
    marginTop: 8,
    borderTopWidth: 1,
  },
  receiptLabel: {
    fontSize: 14,
    color: '#64748b',
  },
  receiptValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  receiptMono: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  receiptTotalLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748b',
  },
  receiptTotalValue: {
    fontSize: 20,
    fontWeight: '700',
  },
  footerSection: {
    paddingHorizontal: 24,
    paddingBottom: Platform.OS === 'ios' ? 24 : 40,
    gap: 12,
  },
  primaryBtn: {
    width: '100%',
    height: 56,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#064e3b',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  secondaryBtn: {
    width: '100%',
    height: 56,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryBtnText: {
    fontSize: 16,
    fontWeight: '600',
  },
  shareIcon: {
    marginRight: 8,
  },
  homeIndicator: {
    height: 6,
    width: 128,
    borderRadius: 3,
    alignSelf: 'center',
    marginTop: 8,
  },
});
