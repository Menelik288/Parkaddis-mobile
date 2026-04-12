import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Navigation, Clock, MapPin } from 'lucide-react-native';

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
}

export function ActiveReservationCard({
  title,
  address,
  status,
  distance,
  duration,
  mode = 'preview',
  onDirectionsClick,
  onDismissPreview,
}: ActiveReservationCardProps) {
  const formatDistance = (m: number | null) => {
    if (m === null) return '--';
    return m < 1000 ? `${Math.round(m)} m` : `${(m / 1000).toFixed(1)} km`;
  };

  const formatDuration = (s: number | null) => {
    if (s === null) return '--';
    const mins = Math.round(s / 60);
    return mins < 60 ? `${mins} min` : `${Math.floor(mins / 60)}h ${mins % 60}m`;
  };

  if (mode === 'navigating') {
    return (
      <View style={styles.navCompact}>
        <View style={styles.navCompactHeader}>
          <View style={styles.iconContainerSmall}>
            <Navigation size={18} color="#fff" />
          </View>
          <View style={styles.navCompactTitleWrap}>
            <Text style={styles.navCompactLabel}>Remaining</Text>
            <Text style={styles.navCompactDistance}>{formatDistance(distance)}</Text>
          </View>
        </View>
        <Text style={styles.navCompactName} numberOfLines={1}>
          {title}
        </Text>
        <View style={styles.navCompactRow}>
          <Clock size={14} color="#64748b" />
          <Text style={styles.navCompactEta}>{formatDuration(duration)}</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <MapPin size={20} color="#fff" />
        </View>
        <View style={styles.titleInfo}>
          <Text style={styles.statusLabel}>{status}</Text>
          <Text style={styles.titleText} numberOfLines={1}>
            {title}
          </Text>
          {!!address && (
            <Text style={styles.addressText} numberOfLines={2}>
              {address}
            </Text>
          )}
        </View>
      </View>

      <View style={styles.metricsRow}>
        <View style={styles.metric}>
          <Clock size={14} color="#64748b" />
          <Text style={styles.metricText}>{formatDuration(duration)}</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.metric}>
          <Navigation size={14} color="#64748b" />
          <Text style={styles.metricText}>{formatDistance(distance)}</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.button} onPress={() => onDirectionsClick?.()}>
        <Navigation size={16} color="#fff" fill="#fff" />
        <Text style={styles.buttonText}>Get directions</Text>
      </TouchableOpacity>

      {onDismissPreview ? (
        <TouchableOpacity style={styles.dismissBtn} onPress={onDismissPreview}>
          <Text style={styles.dismissText}>Dismiss route</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 10,
    maxWidth: 340,
  },
  navCompact: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 12,
    maxWidth: 280,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.25)',
  },
  navCompactHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  navCompactTitleWrap: {
    flex: 1,
  },
  navCompactLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#059669',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  navCompactDistance: {
    fontSize: 22,
    fontWeight: '900',
    color: '#0f172a',
  },
  navCompactName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 8,
  },
  navCompactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  navCompactEta: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 12,
  },
  iconContainer: {
    width: 44,
    height: 44,
    backgroundColor: '#10b981',
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainerSmall: {
    width: 40,
    height: 40,
    backgroundColor: '#10b981',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleInfo: {
    flex: 1,
  },
  statusLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#10b981',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  titleText: {
    fontSize: 17,
    fontWeight: '900',
    color: '#1e293b',
  },
  addressText: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 4,
    fontWeight: '500',
  },
  metricsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 8,
    marginBottom: 14,
  },
  metric: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  metricText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#475569',
  },
  divider: {
    width: 1,
    height: 16,
    backgroundColor: '#e2e8f0',
  },
  button: {
    backgroundColor: '#10b981',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 48,
    borderRadius: 14,
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '800',
  },
  dismissBtn: {
    marginTop: 10,
    alignItems: 'center',
    paddingVertical: 6,
  },
  dismissText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748b',
  },
});
