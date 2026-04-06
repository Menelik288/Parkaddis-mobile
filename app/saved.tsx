import { StyleSheet, View, Text, ScrollView, TouchableOpacity, useColorScheme, Platform, Image, TextInput } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Colors } from '@/constants/theme';
import { useRouter } from 'expo-router';

export default function SavedScreen() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const isDark = colorScheme === 'dark';
  const primary = '#064e3b';
  const secondary = '#059669';
  const router = useRouter();

  const savedLocations = [
    {
      id: 1,
      title: 'Bole Medhanealem Mall',
      subtitle: 'Cameroon St, Bole, Addis Ababa',
      status: 'Active',
      statusColor: primary,
      availability: '12 slots available',
      rate: '25 ETB',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBxxtuHbfJAvLt1QMOqnzf8o3vG72V6dPyRjX0ZpA61mWo6_RyB49EzIpSm6prs6F6FTv-rXCHgNWCoad0Wr84JJCJrhnjm_0YXuGvExiWI_xWvkV9gIfwslQhai4NB79LgJNveoc1x_VzxWDujQt0RaZagIFD95Crd3drTeHtT5enx5v8TEsyZZ6WW85I-bV7S6890l5sHXUhz6DeKxzWfHWs7oWWNAPLp9DJfc6NflnlWdRfcLRAOGr8jre900tG05r2rfrbOE6s'
    },
    {
      id: 2,
      title: 'Edna Mall Parking',
      subtitle: 'Bole Road, Addis Ababa',
      status: 'Limited',
      statusColor: '#d97706',
      availability: '4 slots available',
      rate: '20 ETB',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAoT5E3vucLOSKlxRch3FfkcCp_dqHo6wUoJOhWyhArOIAbq09m9HBTG321276lNNQlsoDbrIoTP-b_yQ0-yXcQ2x6KemPHSp3vwxpb9TODBHQNIwhsDxFEQCrGgBDKNzcVpmElQX15JT-TSTSyR80dkhmN8Ug8blJPb16Xq-cAPCaCWlMV9gU-ZJELUv_j_4uUJXmlfbnIXCZ4lMl25EmGUKkMoCRI1pNZcCKr1IR1Ad6DxzOOmM493UhcOAwNDCZI3Ncq2qafHzY'
    },
    {
      id: 3,
      title: 'Century Mall Lot',
      subtitle: 'Gurd Shola, Addis Ababa',
      status: 'Active',
      statusColor: primary,
      availability: '45 slots available',
      rate: '15 ETB',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCViuh7VfOihyYQN2wy_8dT27RluD5x3Mng4Cq54HfXSdNnh3VGitfkaEGQqhSecDiBKFzGSOdduhKBjzOCvGbpxXsLqB_bjO33WIl63y84dOOFIJ_3tKFggYMPZQH75axxbvYC24bmlspU2JjcOHLLVt7yiFeldxQ9pWBeL24ANfw6I_8PbJ1LTonsEgsE2VPn1qxPks-tphlMZG2RzEfcaldxSxjohyuviIzJXViqOs23CkAxR6PIVTDQwO42fFJhgJO77DiQs-s'
    }
  ];

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
        {/* Editorial Header */}
        <View style={styles.headerBox}>
          <Text style={[styles.pageSubtitle, { color: isDark ? '#34d399' : '#064e3b' }]}>PERSONAL COLLECTION</Text>
          <Text style={[styles.pageTitle, { color: isDark ? '#f8fafc' : '#0f172a' }]}>Saved Spots</Text>
        </View>

        {/* Search Bar */}
        <View style={styles.searchWrapper}>
          <MaterialIcons name="search" size={20} color="#94a3b8" style={styles.searchIcon} />
          <TextInput 
            style={[styles.searchInput, { backgroundColor: isDark ? '#1e293b' : '#f1f5f9', color: isDark ? '#f8fafc' : '#0f172a' }]}
            placeholder="Filter locations..."
            placeholderTextColor="#94a3b8"
          />
        </View>

        {/* Saved Locations List */}
        <View style={styles.listWrapper}>
          {savedLocations.map((item) => (
            <TouchableOpacity key={item.id} style={[styles.card, { backgroundColor: isDark ? '#1e293b' : '#ffffff' }]} activeOpacity={0.9}>
              <View style={styles.cardImageContainer}>
                <Image source={{ uri: item.image }} style={styles.cardImage} />
                <TouchableOpacity style={styles.bookmarkBtnButton}>
                  <MaterialIcons name="bookmark" size={20} color={primary} />
                </TouchableOpacity>
              </View>

              <View style={styles.cardContent}>
                <View style={styles.cardTop}>
                  <View style={styles.titleRow}>
                    <Text style={[styles.cardTitle, { color: isDark ? '#f8fafc' : '#0f172a' }]} numberOfLines={1}>{item.title}</Text>
                    <View style={[styles.statusBadge, { backgroundColor: isDark ? 'rgba(52,211,153,0.1)' : `${item.statusColor}1A` }]}>
                      <View style={[styles.statusDot, { backgroundColor: isDark ? '#34d399' : item.statusColor }]} />
                      <Text style={[styles.statusText, { color: isDark ? '#34d399' : item.statusColor }]}>{item.status}</Text>
                    </View>
                  </View>
                  <View style={styles.subtitleRow}>
                    <MaterialIcons name="location-pin" size={14} color="#64748b" />
                    <Text style={styles.cardSubtitle} numberOfLines={1}>{item.subtitle}</Text>
                  </View>
                </View>

                <View style={[styles.cardBottom, { borderTopColor: isDark ? '#334155' : 'rgba(148,163,184,0.3)' }]}>
                  <View>
                    <Text style={styles.infoLabel}>AVAILABILITY</Text>
                    <Text style={[styles.infoValue, { color: isDark ? '#f8fafc' : '#0f172a' }]}>{item.availability}</Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={styles.infoLabel}>RATE</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
                      <Text style={[styles.priceAmount, { color: isDark ? '#34d399' : primary }]}>{item.rate}</Text>
                      <Text style={styles.priceUnit}>/hr</Text>
                    </View>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          ))}
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
    paddingTop: 8,
  },
  headerBox: {
    marginBottom: 24,
  },
  pageSubtitle: {
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  pageTitle: {
    fontSize: 32,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32,
  },
  searchIcon: {
    position: 'absolute',
    left: 16,
    zIndex: 10,
  },
  searchInput: {
    flex: 1,
    height: 52,
    borderRadius: 16,
    paddingLeft: 44,
    paddingRight: 16,
    fontSize: 14,
    fontWeight: '500',
  },
  listWrapper: {
    gap: 24,
  },
  card: {
    borderRadius: 32,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 4,
  },
  cardImageContainer: {
    height: 180,
    width: '100%',
    position: 'relative',
  },
  cardImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  bookmarkBtnButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardContent: {
    padding: 24,
  },
  cardTop: {
    marginBottom: 16,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '800',
    flex: 1,
    marginRight: 16,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 6,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 9,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  subtitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  cardSubtitle: {
    fontSize: 13,
    color: '#64748b',
    flex: 1,
  },
  cardBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderStyle: 'dashed',
  },
  infoLabel: {
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1,
    color: '#94a3b8',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '700',
  },
  priceAmount: {
    fontSize: 20,
    fontWeight: '900',
  },
  priceUnit: {
    fontSize: 11,
    fontWeight: '500',
    color: '#64748b',
    marginLeft: 2,
  },
});
