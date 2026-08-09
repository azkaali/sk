/* SkillConnect React Native - Provider App Screen */

import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  StyleSheet,
  Alert
} from 'react-native';
import { useAppStore } from '../context/AppContext';
import { COLORS, globalStyles } from '../styles/theme';

export const ProviderScreen: React.FC<{ onOpenChat: (jobId: string) => void }> = ({ onOpenChat }) => {
  const {
    currentProvider,
    jobs,
    bids,
    categories,
    toggleProviderOnline,
    submitBid,
    updateJobStatus,
    submitKYC
  } = useAppStore();

  const [bidModalVisible, setBidModalVisible] = useState(false);
  const [kycModalVisible, setKycModalVisible] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);

  const [bidPrice, setBidPrice] = useState('65');
  const [bidEta, setBidEta] = useState('20');
  const [bidMessage, setBidMessage] = useState('Ready to come over!');

  const [kycName, setKycName] = useState('');
  const [kycPhone, setKycPhone] = useState('');
  const [kycExp, setKycExp] = useState('5');

  const openJobs = jobs.filter(j => j.status === 'open');
  const assignedJob = jobs.find(j => j.providerId === currentProvider.id && j.status !== 'completed');

  const handlePlaceBid = () => {
    if (!selectedJobId) return;

    const targetJob = jobs.find(j => j.id === selectedJobId);
    const catConfig = categories.find(c => c.id === targetJob?.category) || { minBid: 10, maxBid: 1000 };

    const priceNum = Number(bidPrice);
    if (priceNum < catConfig.minBid || priceNum > catConfig.maxBid) {
      Alert.alert('Guardrail Violation', `Price must be between $${catConfig.minBid} and $${catConfig.maxBid} for ${catConfig.name}`);
      return;
    }

    submitBid(selectedJobId, priceNum, Number(bidEta), bidMessage);
    setBidModalVisible(false);
    Alert.alert('Bid Broadcasted', 'Your competitive bid was sent to the customer.');
  };

  const handleKYCSubmit = () => {
    submitKYC({
      name: kycName || currentProvider.name,
      phone: kycPhone || currentProvider.phone,
      experienceYears: Number(kycExp)
    });
    setKycModalVisible(false);
    Alert.alert('KYC Submitted', 'Under review by Admin team.');
  };

  return (
    <ScrollView style={globalStyles.container} contentContainerStyle={{ padding: 14 }}>
      {/* Provider Status Header */}
      <View style={globalStyles.card}>
        <View style={globalStyles.rowBetween}>
          <View>
            <Text style={{ color: COLORS.textMain, fontSize: 16, fontWeight: '800' }}>{currentProvider.name}</Text>
            <Text style={{ color: COLORS.textMuted, fontSize: 12 }}>
              ★ {currentProvider.rating} ({currentProvider.jobCount} Jobs) • Status: {currentProvider.verificationStatus.toUpperCase()}
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.onlineBtn, currentProvider.isOnline ? styles.onlineActive : styles.offlineActive]}
            onPress={() => toggleProviderOnline(!currentProvider.isOnline)}
          >
            <Text style={styles.onlineBtnText}>
              {currentProvider.isOnline ? '🟢 ONLINE' : '🔴 OFFLINE'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.radiusBar}>
          <Text style={{ color: COLORS.textMuted, fontSize: 11 }}>Service Radius: 15 km (Downtown Geofence)</Text>
          <TouchableOpacity onPress={() => setKycModalVisible(true)}>
            <Text style={{ color: COLORS.primary, fontSize: 12, fontWeight: '700' }}>+ Verification KYC</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Active Assigned Job Action Timeline */}
      {assignedJob && (
        <View style={[globalStyles.card, { borderColor: COLORS.accentGold }]}>
          <View style={globalStyles.cardHeader}>
            <View style={[globalStyles.badge, { backgroundColor: 'rgba(245, 158, 11, 0.2)', borderColor: COLORS.accentGold }]}>
              <Text style={[globalStyles.badgeText, { color: COLORS.accentGold }]}>{assignedJob.status.replace('_', ' ')}</Text>
            </View>
            <Text style={{ fontSize: 18, fontWeight: '800', color: COLORS.primary }}>${assignedJob.finalPrice || 65}</Text>
          </View>
          <Text style={globalStyles.cardTitle}>{assignedJob.title}</Text>
          <Text style={globalStyles.cardDescription}>Customer: {assignedJob.customerName} ({assignedJob.location})</Text>

          <View style={{ flexDirection: 'row', gap: 8, marginVertical: 8 }}>
            <TouchableOpacity style={globalStyles.btnSecondary} onPress={() => onOpenChat(assignedJob.id)}>
              <Text style={globalStyles.btnSecondaryText}>💬 Chat Customer</Text>
            </TouchableOpacity>
          </View>

          {assignedJob.status === 'accepted' && (
            <TouchableOpacity style={globalStyles.btnPrimary} onPress={() => updateJobStatus(assignedJob.id, 'en_route')}>
              <Text style={globalStyles.btnPrimaryText}>🚚 Mark En Route</Text>
            </TouchableOpacity>
          )}

          {assignedJob.status === 'en_route' && (
            <TouchableOpacity style={globalStyles.btnPrimary} onPress={() => updateJobStatus(assignedJob.id, 'arrived')}>
              <Text style={globalStyles.btnPrimaryText}>🚪 Mark Arrived at Site</Text>
            </TouchableOpacity>
          )}

          {assignedJob.status === 'arrived' && (
            <TouchableOpacity style={globalStyles.btnPrimary} onPress={() => updateJobStatus(assignedJob.id, 'in_progress')}>
              <Text style={globalStyles.btnPrimaryText}>⚡ Start Execution</Text>
            </TouchableOpacity>
          )}

          {assignedJob.status === 'in_progress' && (
            <TouchableOpacity 
              style={globalStyles.btnPrimary} 
              onPress={() => {
                updateJobStatus(assignedJob.id, 'completed');
                Alert.alert('Job Completed!', 'Payment released to your wallet.');
              }}
            >
              <Text style={globalStyles.btnPrimaryText}>✅ Finish & Complete Job</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Broadcasted Job Feed */}
      <Text style={{ fontSize: 15, fontWeight: '700', color: COLORS.textMain, marginVertical: 8 }}>
        Nearby Job Broadcasts ({openJobs.length})
      </Text>

      {!currentProvider.isOnline ? (
        <View style={[globalStyles.card, { alignItems: 'center', padding: 20 }]}>
          <Text style={{ color: COLORS.textMuted, fontSize: 13 }}>Switch your availability status to Online to view broadcasted leads.</Text>
        </View>
      ) : (
        openJobs.map(j => {
          const existingBid = bids.find(b => b.jobId === j.id && b.providerId === currentProvider.id);
          return (
            <View key={j.id} style={globalStyles.card}>
              <View style={globalStyles.cardHeader}>
                <Text style={globalStyles.cardTitle}>{j.title}</Text>
                <Text style={{ fontSize: 14, fontWeight: '800', color: COLORS.primary }}>{j.budgetRange}</Text>
              </View>
              <Text style={globalStyles.cardDescription}>{j.description}</Text>

              {existingBid ? (
                <Text style={{ color: COLORS.accentGold, fontSize: 12, fontWeight: '700' }}>
                  ✓ Bid Submitted: ${existingBid.counterPrice || existingBid.price}
                </Text>
              ) : (
                <TouchableOpacity
                  style={globalStyles.btnPrimary}
                  onPress={() => {
                    setSelectedJobId(j.id);
                    setBidModalVisible(true);
                  }}
                >
                  <Text style={globalStyles.btnPrimaryText}>Place Bid</Text>
                </TouchableOpacity>
              )}
            </View>
          );
        })
      )}

      {/* Provider Wallet Summary */}
      <View style={[globalStyles.card, { marginTop: 10 }]}>
        <Text style={{ fontSize: 12, color: COLORS.textMuted, textTransform: 'uppercase', fontWeight: '700' }}>SkillConnect Wallet Balance</Text>
        <Text style={{ fontSize: 26, fontWeight: '800', color: COLORS.primary, marginVertical: 4 }}>
          ${currentProvider.walletBalance.toFixed(2)}
        </Text>
        <TouchableOpacity style={globalStyles.btnSecondary} onPress={() => Alert.alert('Payout Initiated', 'Funds sent to linked bank account.')}>
          <Text style={globalStyles.btnSecondaryText}>Request Payout</Text>
        </TouchableOpacity>
      </View>

      {/* Submit Bid Modal */}
      <Modal visible={bidModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Submit Competitive Bid</Text>

            <Text style={globalStyles.inputLabel}>Bid Price ($)</Text>
            <TextInput
              style={globalStyles.input}
              keyboardType="numeric"
              value={bidPrice}
              onChangeText={setBidPrice}
            />

            <Text style={globalStyles.inputLabel}>ETA (Minutes)</Text>
            <TextInput
              style={globalStyles.input}
              keyboardType="numeric"
              value={bidEta}
              onChangeText={setBidEta}
            />

            <Text style={globalStyles.inputLabel}>Message to Customer</Text>
            <TextInput
              style={globalStyles.input}
              value={bidMessage}
              onChangeText={setBidMessage}
            />

            <TouchableOpacity style={globalStyles.btnPrimary} onPress={handlePlaceBid}>
              <Text style={globalStyles.btnPrimaryText}>Submit Bid</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[globalStyles.btnSecondary, { marginTop: 8 }]} onPress={() => setBidModalVisible(false)}>
              <Text style={globalStyles.btnSecondaryText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* KYC Modal */}
      <Modal visible={kycModalVisible} animationType="fade" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Provider KYC Verification</Text>
            <TextInput style={globalStyles.input} placeholder="Full Name" placeholderTextColor={COLORS.textMuted} value={kycName} onChangeText={setKycName} />
            <TextInput style={globalStyles.input} placeholder="Phone Number" placeholderTextColor={COLORS.textMuted} value={kycPhone} onChangeText={setKycPhone} />
            <TextInput style={globalStyles.input} placeholder="Years Experience" keyboardType="numeric" value={kycExp} onChangeText={setKycExp} />
            <TouchableOpacity style={globalStyles.btnPrimary} onPress={handleKYCSubmit}>
              <Text style={globalStyles.btnPrimaryText}>Submit KYC</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  onlineBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
  },
  onlineActive: { backgroundColor: COLORS.primaryLight },
  offlineActive: { backgroundColor: 'rgba(239, 68, 68, 0.15)' },
  onlineBtnText: { fontSize: 12, fontWeight: '700', color: COLORS.primary },
  radiusBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.cardBorder,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    justifyContent: 'center',
    padding: 16,
  },
  modalContent: {
    backgroundColor: COLORS.cardBg,
    borderColor: COLORS.cardBorder,
    borderWidth: 1,
    borderRadius: 16,
    padding: 18,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textMain,
    marginBottom: 12,
  },
});
