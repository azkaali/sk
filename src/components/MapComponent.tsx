/* SkillConnect React Native - Interactive Map Component */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../styles/theme';
import { ProviderProfile, JobRequest } from '../types';

interface MapProps {
  providers: ProviderProfile[];
  jobs: JobRequest[];
  activeCategory: string;
  enRouteTracking?: boolean;
}

export const MapComponent: React.FC<MapProps> = ({ providers, jobs, activeCategory, enRouteTracking }) => {
  const filteredProviders = activeCategory === 'all' 
    ? providers 
    : providers.filter(p => p.category === activeCategory);

  const openJobs = jobs.filter(j => j.status === 'open');

  return (
    <View style={styles.mapContainer}>
      <!-- Simulated Map Layer -->
      <View style={styles.mapGrid}>
        <View style={styles.mapHeaderOverlay}>
          <Text style={styles.mapHeaderTitle}>📍 Location: Downtown (37.7749, -122.4194)</Text>
          <Text style={styles.mapHeaderSub}>
            {filteredProviders.length} Nearby Tradespeople • {openJobs.length} Open Requests
          </Text>
        </View>

        <!-- Simulated Provider Pin Markers -->
        <View style={styles.pinsArea}>
          {filteredProviders.map((p, idx) => (
            <View 
              key={p.id} 
              style={[
                styles.pinMarker, 
                { top: 40 + (idx * 45) % 180, left: 30 + (idx * 75) % 260 }
              ]}
            >
              <Text style={styles.pinText}>🔧 {p.name.split(' ')[0]}</Text>
              <Text style={styles.pinRating}>★ {p.rating}</Text>
            </View>
          ))}

          {/* Open Job Pins */}
          {openJobs.map((j, idx) => (
            <View 
              key={j.id} 
              style={[
                styles.jobMarker, 
                { top: 90 + (idx * 50) % 150, left: 160 + (idx * 60) % 220 }
              ]}
            >
              <Text style={styles.jobMarkerText}>💼 {j.title.substring(0, 15)}...</Text>
            </View>
          ))}

          {/* En Route Animated Tracking Badge */}
          {enRouteTracking && (
            <View style={styles.trackingBadge}>
              <Text style={styles.trackingText}>🚚 Provider En Route to Job Location...</Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  mapContainer: {
    height: 240,
    backgroundColor: '#090D16',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    overflow: 'hidden',
    marginBottom: 14,
  },
  mapGrid: {
    flex: 1,
    padding: 12,
    position: 'relative',
  },
  mapHeaderOverlay: {
    backgroundColor: 'rgba(30, 41, 59, 0.85)',
    padding: 8,
    borderRadius: 8,
    zIndex: 10,
  },
  mapHeaderTitle: {
    color: COLORS.textMain,
    fontSize: 12,
    fontWeight: '700',
  },
  mapHeaderSub: {
    color: COLORS.textMuted,
    fontSize: 10,
    marginTop: 2,
  },
  pinsArea: {
    flex: 1,
    position: 'relative',
  },
  pinMarker: {
    position: 'absolute',
    backgroundColor: COLORS.cardBg,
    borderColor: COLORS.primary,
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    shadowColor: COLORS.primary,
    shadowOpacity: 0.4,
    shadowRadius: 4,
  },
  pinText: {
    color: COLORS.textMain,
    fontSize: 10,
    fontWeight: '700',
  },
  pinRating: {
    color: COLORS.accentGold,
    fontSize: 9,
    fontWeight: '600',
  },
  jobMarker: {
    position: 'absolute',
    backgroundColor: COLORS.accentGold,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  jobMarkerText: {
    color: COLORS.darkBg,
    fontSize: 10,
    fontWeight: '800',
  },
  trackingBadge: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    right: 10,
    backgroundColor: COLORS.primary,
    padding: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  trackingText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
});
