/* SkillConnect React Native - Admin Web & Mobile Console Screen */

import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Alert
} from 'react-native';
import { useAppStore } from '../context/AppContext';
import { COLORS, globalStyles } from '../styles/theme';

export const AdminScreen: React.FC = () => {
  const {
    analytics,
    kycSubmissions,
    approveKYC,
    disputes,
    resolveDispute,
    categories,
    updateGuardrails
  } = useAppStore();

  const [minInput, setMinInput] = useState<Record<string, string>>({});
  const [maxInput, setMaxInput] = useState<Record<string, string>>({});
  const [commInput, setCommInput] = useState<Record<string, string>>({});

  const handleSaveGuardrail = (catId: string, currentMin: number, currentMax: number, currentComm: number) => {
    const min = minInput[catId] ? Number(minInput[catId]) : currentMin;
    const max = maxInput[catId] ? Number(maxInput[catId]) : currentMax;
    const comm = commInput[catId] ? Number(commInput[catId]) : currentComm;

    updateGuardrails(catId, min, max, comm);
    Alert.alert('Guardrails Updated', `Config saved for category.`);
  };

  return (
    <ScrollView style={globalStyles.container} contentContainerStyle={{ padding: 14 }}>
      {/* Metrics Overview Cards */}
      <Text style={styles.sectionHeader}>Platform Analytics & GMV</Text>
      <View style={styles.metricsGrid}>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Total GMV</Text>
          <Text style={[styles.statValue, { color: COLORS.primary }]}>{analytics.totalGmv}</Text>
          <Text style={styles.statSub}>+14.2% Growth</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Platform Revenue</Text>
          <Text style={[styles.statValue, { color: COLORS.accentGold }]}>{analytics.commissionEarned}</Text>
          <Text style={styles.statSub}>Net Commission</Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Active Users</Text>
          <Text style={styles.statValue}>{analytics.activeUsers}</Text>
          <Text style={styles.statSub}>Customers & Providers</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Avg Time to Bid</Text>
          <Text style={[styles.statValue, { color: COLORS.accentBlue }]}>{analytics.avgBidTimeSec}</Text>
          <Text style={styles.statSub}>Instant Match</Text>
        </View>
      </View>

      {/* KYC Verification Approval Desk */}
      <Text style={styles.sectionHeader}>Provider Verification Queue (KYC)</Text>
      {kycSubmissions.length === 0 ? (
        <View style={globalStyles.card}>
          <Text style={{ color: COLORS.textMuted, fontSize: 12 }}>No pending provider verifications.</Text>
        </View>
      ) : (
        kycSubmissions.map(k => (
          <View key={k.id} style={globalStyles.card}>
            <View style={globalStyles.rowBetween}>
              <View>
                <Text style={globalStyles.cardTitle}>{k.name}</Text>
                <Text style={{ color: COLORS.textMuted, fontSize: 12 }}>
                  Trade: {k.category} • {k.experienceYears} yrs exp • Phone: {k.phone}
                </Text>
              </View>
              <View style={[globalStyles.badge, { backgroundColor: COLORS.primaryLight, borderColor: COLORS.primary }]}>
                <Text style={[globalStyles.badgeText, { color: COLORS.primary }]}>{k.status}</Text>
              </View>
            </View>

            <Text style={{ color: COLORS.accentBlue, fontSize: 11, marginVertical: 6 }}>
              📁 Docs: {k.idDocument} • 📷 Selfie: {k.selfie}
            </Text>

            {k.status === 'pending' && (
              <TouchableOpacity
                style={globalStyles.btnPrimary}
                onPress={() => {
                  approveKYC(k.id);
                  Alert.alert('Approved!', `${k.name} has been verified.`);
                }}
              >
                <Text style={globalStyles.btnPrimaryText}>✓ Approve Verification</Text>
              </TouchableOpacity>
            )}
          </View>
        ))
      )}

      {/* Dispute Resolution Queue */}
      <Text style={styles.sectionHeader}>Dispute Resolution Desk</Text>
      {disputes.map(d => (
        <View key={d.id} style={[globalStyles.card, { borderColor: COLORS.accentRed }]}>
          <View style={globalStyles.cardHeader}>
            <Text style={globalStyles.cardTitle}>{d.jobTitle} (${d.amount})</Text>
            <Text style={{ color: COLORS.accentRed, fontSize: 12, fontWeight: '700' }}>{d.status}</Text>
          </View>
          <Text style={globalStyles.cardDescription}>Claim: {d.reason}</Text>

          {d.status === 'open' && (
            <View style={{ flexDirection: 'row', gap: 8, marginTop: 6 }}>
              <TouchableOpacity
                style={globalStyles.btnSecondary}
                onPress={() => {
                  resolveDispute(d.id, 'refund');
                  Alert.alert('Refund Issued', 'Customer account refunded.');
                }}
              >
                <Text style={globalStyles.btnSecondaryText}>Issue Refund</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={globalStyles.btnPrimary}
                onPress={() => {
                  resolveDispute(d.id, 'payout');
                  Alert.alert('Payout Released', 'Funds released to provider.');
                }}
              >
                <Text style={globalStyles.btnPrimaryText}>Release Payout</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      ))}

      {/* Category & Guardrails Config */}
      <Text style={styles.sectionHeader}>Category Bid Guardrails & Commission</Text>
      {categories.map(c => (
        <View key={c.id} style={globalStyles.card}>
          <Text style={globalStyles.cardTitle}>{c.name}</Text>
          <Text style={{ color: COLORS.textMuted, fontSize: 11, marginBottom: 6 }}>
            Current Range: ${c.minBid} - ${c.maxBid} | Take Rate: {c.commissionPct}%
          </Text>

          <View style={{ flexDirection: 'row', gap: 6, marginBottom: 8 }}>
            <TextInput
              style={[globalStyles.input, { flex: 1, marginBottom: 0 }]}
              placeholder={`Min ($${c.minBid})`}
              placeholderTextColor={COLORS.textMuted}
              keyboardType="numeric"
              onChangeText={val => setMinInput({ ...minInput, [c.id]: val })}
            />
            <TextInput
              style={[globalStyles.input, { flex: 1, marginBottom: 0 }]}
              placeholder={`Max ($${c.maxBid})`}
              placeholderTextColor={COLORS.textMuted}
              keyboardType="numeric"
              onChangeText={val => setMaxInput({ ...maxInput, [c.id]: val })}
            />
          </View>

          <TouchableOpacity
            style={globalStyles.btnSecondary}
            onPress={() => handleSaveGuardrail(c.id, c.minBid, c.maxBid, c.commissionPct)}
          >
            <Text style={globalStyles.btnSecondaryText}>Save Guardrail Settings</Text>
          </TouchableOpacity>
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  sectionHeader: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textMain,
    marginTop: 12,
    marginBottom: 8,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: COLORS.cardBg,
    borderColor: COLORS.cardBorder,
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
  },
  statLabel: {
    fontSize: 10,
    color: COLORS.textMuted,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.textMain,
    marginVertical: 2,
  },
  statSub: {
    fontSize: 10,
    color: COLORS.primary,
    fontWeight: '600',
  },
});
