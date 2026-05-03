import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, useColorScheme } from 'react-native';
import { X, Navigation, Ticket } from 'lucide-react-native';

export type ReservationCardMode = 'preview' | 'navigating';

interface ActiveReservationCardProps {
  title: string;
  address: string;
  status: string;
  distance: number | null;
  duration: number | null;
  mode?: ReservationCardMode;
  onDirectionsClick?: () => void;
  onDismissPreview?: () => void;
  /** Navigating / arrived: closes navigation from the minimal bar */
  onCloseNavigation?: () => void;
}

const CARD_GREEN = '#064e3b';

function formatDistanceDisplay(m: number | null): { line: string; fontSize: number } {
  if (m == null) return { line: '—', fontSize: 26 };
  if (m < 1000) {
    const rounded = Math.max(0, Math.round(m));
    const digits = String(rounded).length;
    return {
      line: `${rounded} m`,
      fontSize: digits <= 2 ? 22 : digits <= 3 ? 26 : 24,
    };
  }
  const km = m / 1000;
  const line = km >= 10 ? `${km.toFixed(1)} km` : `${km.toFixed(1)} km`;
  return { line, fontSize: line.length > 6 ? 24 : 28 };
}

export function ActiveReservationCard({
  title,
  address: _address,
  status: statusLabel,
  distance,
  duration: _duration,
  mode = 'preview',
  onDirectionsClick,
  onDismissPreview,
  onCloseNavigation,
}: ActiveReservationCardProps) {
  const isDark = useColorScheme() === 'dark';
  const dist = useMemo(() => formatDistanceDisplay(distance), [distance]);

  const bg = isDark ? '#1e293b' : CARD_GREEN;
  const borderColor = isDark ? '#334155' : 'transparent';
  const borderWidth = isDark ? 1 : 0;
  const textColor = isDark ? '#f8fafc' : '#ffffff';
  const iconWrapBg = isDark ? '#0f172a' : 'rgba(255,255,255,0.14)';
  const iconColor = isDark ? '#34d399' : '#ffffff';
  const navBtnBg = isDark ? '#34d399' : '#ffffff';
  const navBtnText = isDark ? '#0f172a' : CARD_GREEN;
  const dismissBg = isDark ? '#0f172a' : 'rgba(255,255,255,0.12)';
  const dismissIcon = isDark ? '#f8fafc' : '#ffffff';

  if (mode === 'navigating') {
    return (
      <View style={[styles.navBar, { backgroundColor: bg, borderColor, borderWidth }]}>
        <Text style={[styles.navDistance, { fontSize: dist.fontSize, color: textColor }]} numberOfLines={1}>
          {dist.line}
        </Text>
        <TouchableOpacity
          onPress={() => onCloseNavigation?.()}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          style={[styles.navClose, { backgroundColor: dismissBg }]}
          accessibilityLabel="Close navigation"
        >
          <X size={20} color={dismissIcon} />
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <TouchableOpacity 
      style={{ 
        width: 56, 
        height: 56, 
        borderRadius: 28, 
        backgroundColor: bg, 
        alignItems: 'center', 
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.2,
        shadowRadius: 10,
        elevation: 8,
        borderWidth,
        borderColor
      }} 
      onPress={() => onDirectionsClick?.()} 
      activeOpacity={0.88}
    >
      <Navigation size={24} color={textColor} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  previewCard: {
    borderRadius: 24,
    backgroundColor: CARD_GREEN,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
    alignSelf: 'center',
  },
  previewHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 10,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.14)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewHeaderText: {
    flex: 1,
    minWidth: 0,
  },
  previewKicker: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.6,
    marginBottom: 4,
  },
  previewTitle: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '800',
  },
  dismissBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewDistance: {
    color: 'rgba(255,255,255,0.95)',
    fontWeight: '800',
    letterSpacing: -0.5,
    marginBottom: 14,
  },
  navigateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    minHeight: 48,
    borderRadius: 16,
    backgroundColor: '#ffffff',
  },
  navigateBtnText: {
    fontSize: 15,
    fontWeight: '800',
    color: CARD_GREEN,
  },
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    alignSelf: 'flex-start',
    maxWidth: 320,
    borderRadius: 20,
    backgroundColor: CARD_GREEN,
    paddingVertical: 10,
    paddingHorizontal: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 10,
  },
  navDistance: {
    color: '#ffffff',
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  navClose: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginLeft: 8,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
