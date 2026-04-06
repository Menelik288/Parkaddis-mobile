import { StyleSheet, View, Text, ScrollView, TouchableOpacity, useColorScheme, Platform } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Colors } from '@/constants/theme';
import { useRouter } from 'expo-router';

export default function SettingsScreen() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const isDark = colorScheme === 'dark';
  const primary = '#064e3b';
  const router = useRouter();

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#0f172a' : '#f8fafc' }]}>
      <View style={[styles.header, { backgroundColor: isDark ? '#020617' : '#f8fafc' }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <MaterialIcons name="arrow-back" size={24} color={isDark ? '#34d399' : primary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: isDark ? '#d1fae5' : primary }]}>Settings</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>General</Text>
          
          <TouchableOpacity style={[styles.listItem, { backgroundColor: isDark ? '#1e293b' : '#ffffff' }]}>
            <View style={styles.listItemLeft}>
              <View style={[styles.listIconBox, { backgroundColor: isDark ? '#0f172a' : '#f1f5f9' }]}>
                <MaterialIcons name="security" size={20} color={isDark ? '#34d399' : primary} />
              </View>
              <View style={styles.listItemText}>
                <Text style={[styles.listItemTitle, { color: isDark ? '#f8fafc' : '#0f172a' }]}>Security & Privacy</Text>
                <Text style={styles.listItemSubtitle}>Password, biometrics, data</Text>
              </View>
            </View>
            <MaterialIcons name="chevron-right" size={24} color="#94a3b8" />
          </TouchableOpacity>

          <TouchableOpacity style={[styles.listItem, { backgroundColor: isDark ? '#1e293b' : '#ffffff' }]}>
            <View style={styles.listItemLeft}>
              <View style={[styles.listIconBox, { backgroundColor: isDark ? '#0f172a' : '#f1f5f9' }]}>
                <MaterialIcons name="notifications" size={20} color={isDark ? '#34d399' : primary} />
              </View>
              <View style={styles.listItemText}>
                <Text style={[styles.listItemTitle, { color: isDark ? '#f8fafc' : '#0f172a' }]}>Notifications</Text>
                <Text style={styles.listItemSubtitle}>Push, email and SMS alerts</Text>
              </View>
            </View>
            <MaterialIcons name="chevron-right" size={24} color="#94a3b8" />
          </TouchableOpacity>

          <TouchableOpacity style={[styles.listItem, { backgroundColor: isDark ? '#1e293b' : '#ffffff' }]}>
            <View style={styles.listItemLeft}>
              <View style={[styles.listIconBox, { backgroundColor: isDark ? '#0f172a' : '#f1f5f9' }]}>
                <MaterialIcons name="language" size={20} color={isDark ? '#34d399' : primary} />
              </View>
              <View style={styles.listItemText}>
                <Text style={[styles.listItemTitle, { color: isDark ? '#f8fafc' : '#0f172a' }]}>Language & Region</Text>
                <Text style={styles.listItemSubtitle}>English (US), GMT+3</Text>
              </View>
            </View>
            <MaterialIcons name="chevron-right" size={24} color="#94a3b8" />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Support & About</Text>
          
          <TouchableOpacity style={[styles.listItem, { backgroundColor: isDark ? '#1e293b' : '#ffffff' }]}>
            <View style={styles.listItemLeft}>
              <View style={[styles.listIconBox, { backgroundColor: isDark ? '#0f172a' : '#f1f5f9' }]}>
                <MaterialIcons name="help" size={20} color={isDark ? '#34d399' : primary} />
              </View>
              <View style={styles.listItemText}>
                <Text style={[styles.listItemTitle, { color: isDark ? '#f8fafc' : '#0f172a' }]}>Help & Support</Text>
                <Text style={styles.listItemSubtitle}>FAQs, contact support</Text>
              </View>
            </View>
            <MaterialIcons name="chevron-right" size={24} color="#94a3b8" />
          </TouchableOpacity>

          <TouchableOpacity style={[styles.listItem, { backgroundColor: isDark ? '#1e293b' : '#ffffff' }]}>
            <View style={styles.listItemLeft}>
              <View style={[styles.listIconBox, { backgroundColor: isDark ? '#0f172a' : '#f1f5f9' }]}>
                <MaterialIcons name="info" size={20} color={isDark ? '#34d399' : primary} />
              </View>
              <View style={styles.listItemText}>
                <Text style={[styles.listItemTitle, { color: isDark ? '#f8fafc' : '#0f172a' }]}>About ParkAddis</Text>
                <Text style={styles.listItemSubtitle}>Version 2.4.0</Text>
              </View>
            </View>
            <MaterialIcons name="chevron-right" size={24} color="#94a3b8" />
          </TouchableOpacity>

          <TouchableOpacity style={[styles.listItem, { backgroundColor: isDark ? '#1e293b' : '#ffffff' }]}>
            <View style={styles.listItemLeft}>
              <View style={[styles.listIconBox, { backgroundColor: isDark ? '#0f172a' : '#f1f5f9' }]}>
                <MaterialIcons name="gavel" size={20} color={isDark ? '#34d399' : primary} />
              </View>
              <View style={styles.listItemText}>
                <Text style={[styles.listItemTitle, { color: isDark ? '#f8fafc' : '#0f172a' }]}>Terms of Service</Text>
                <Text style={styles.listItemSubtitle}>Usage rules and legal</Text>
              </View>
            </View>
            <MaterialIcons name="chevron-right" size={24} color="#94a3b8" />
          </TouchableOpacity>
        </View>

        <View style={styles.footerSection}>
          <TouchableOpacity>
            <Text style={styles.deactivateText}>Deactivate Account</Text>
          </TouchableOpacity>
          <View style={styles.footerInfo}>
            <Text style={styles.versionText}>PARKADDIS V2.4.0</Text>
            <Text style={styles.builtForText}>Proudly built for Addis Ababa</Text>
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
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: 24,
    paddingBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 40,
    gap: 32,
  },
  section: {
    gap: 12,
  },
  sectionLabel: {
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1,
    color: '#94a3b8',
    paddingHorizontal: 8,
    marginBottom: 4,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 2,
  },
  listItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  listIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listItemText: {
    gap: 2,
  },
  listItemTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  listItemSubtitle: {
    fontSize: 11,
    color: '#94a3b8',
    fontWeight: '500',
  },
  footerSection: {
    alignItems: 'center',
    gap: 16,
    marginTop: 16,
  },
  deactivateText: {
    color: '#ef4444',
    fontSize: 12,
    fontWeight: '500',
    opacity: 0.8,
  },
  footerInfo: {
    alignItems: 'center',
    gap: 2,
  },
  versionText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#94a3b8',
    letterSpacing: -0.5,
  },
  builtForText: {
    fontSize: 9,
    color: '#94a3b8',
    opacity: 0.5,
  },
});
