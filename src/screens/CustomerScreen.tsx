/* SkillConnect React Native - Customer App Screen */

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
import { MapComponent } from '../components/MapComponent';

export const CustomerScreen: React.FC<{ onOpenChat: (jobId: string) => void }> = ({ onOpenChat }) => {
  const {
    activeCategory,
    setActiveCategory,
    categories,
    providers,
    jobs,
    bids,
    addJobRequest,
    acceptBid,
    counterBid,
    updateJobStatus
  } = useAppStore();

  const [postModalVisible, setPostModalVisible] = useState(false);
  const [counterModalVisible, setCounterModalVisible] = useState(false);
  const [paymentModalVisible, setPaymentModalVisible] = useState(false);
  const [ratingModalVisible, setRatingModalVisible] = useState(false);

  const [jobTitle, setJobTitle] = useState('');
  const [jobCategory, setJobCategory] = useState('electrician');
  const [jobDesc, setJobDesc] = useState('');
  const [jobBudget, setJobBudget] = useState('$50 - $100');

  const [selectedBidId, setSelectedBidId] = useState<string | null>(null);
  const [counterPriceInput, setCounterPriceInput] = useState('');

  const activeJob = jobs.find(j => j.status !== 'completed');
  const openJob = jobs.find(j => j.status === 'open');
  const jobBids = openJob ? bids.filter(b => b.jobId === openJob.id && b.status !== 'declined') : [];

  const handleCreateJob = () => {
    if (!jobTitle.trim() || !jobDesc.trim()) {
      Alert.alert('Required', 'Please fill in job title and description');
      return;
    }

    addJobRequest({
      title: jobTitle,
      category: jobCategory,
      description: jobDesc,
      budgetRange: jobBudget,
      scheduleType: 'Now'
    });

    setPostModalVisible(false);
    setJobTitle('');
    setJobDesc('');
    Alert.alert('Job Broadcasted!', 'Nearby verified tradespeople are being notified.');
  };

  const handleCounter = () => {
    if (selectedBidId && counterPriceInput) {
      counterBid(selectedBidId, Number(counterPriceInput));
      setCounterModalVisible(false);
      Alert.alert('Counter Sent!', `Your counter offer of $${counterPriceInput} was sent to the provider.`);
    }
  };

  const handlePayment = () => {
    if (activeJob) {
      updateJobStatus(activeJob.id, 'completed');
      setPaymentModalVisible(false);
      setRatingModalVisible(true);
    }
  };

  return (
    <ScrollView style={globalStyles.container} contentContainerStyle={{ padding: 14 }}>
      {/* Category Scroll Bar */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catScroll}>
        <TouchableOpacity
          style={[styles.catChip, activeCategory === 'all' && styles.catChipActive]}
          onPress={() => setActiveCategory('all')}
        >
          <Text style={[styles.catText, activeCategory === 'all' && styles.catTextActive]}>All Trades</Text>
        </TouchableOpacity>
        {categories.map(c => (
          <TouchableOpacity
            key={c.id}
            style={[styles.catChip, activeCategory === c.id && styles.catChipActive]}
            onPress={() => setActiveCategory(c.id)}
          >
            <Text style={[styles.catText, activeCategory === c.id && styles.catTextActive]}>{c.name}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Interactive Map View */}
      <MapComponent 
        providers={providers} 
        jobs={jobs} 
        activeCategory={activeCategory}
        enRouteTracking={activeJob?.status === 'en_route'} 
      />

      {/* Active Job Card / Post Job CTA */}
      {!activeJob ? (
        <View style={globalStyles.card}>
          <Text style={styles.ctaTitle}>Need a Skilled Laborer?</Text>
          <Text style={globalStyles.cardDescription}>
            Post your task (electrical, plumbing, carpentry, AC repair) and receive negotiable bids from nearby providers.
          </Text>
          <TouchableOpacity style={globalStyles.btnPrimary} onPress={() => setPostModalVisible(true)}>
            <Text style={globalStyles.btnPrimaryText}>+ Post a Job Request</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={[globalStyles.card, { borderColor: COLORS.primary }]}>
          <View style={globalStyles.cardHeader}>
            <View style={[globalStyles.badge, { backgroundColor: COLORS.primaryLight, borderColor: COLORS.primary }]}>
              <Text style={[globalStyles.badgeText, { color: COLORS.primary }]}>{activeJob.status.replace('_', ' ')}</Text>
            </View>
            <Text style={{ color: COLORS.textMuted, fontSize: 12 }}>{activeJob.scheduleType}</Text>
          </View>
          <Text style={globalStyles.cardTitle}>{activeJob.title}</Text>
          <Text style={globalStyles.cardDescription}>{activeJob.description}</Text>

          {/* Execution Timeline */}
          <View style={styles.timelineRow}>
            {['accepted', 'en_route', 'arrived', 'in_progress'].map((st, i) => {
              const currentIdx = ['accepted', 'en_route', 'arrived', 'in_progress'].indexOf(activeJob.status);
              const isActive = currentIdx >= i;
              return (
                <View key={st} style={styles.timelineItem}>
                  <View style={[styles.timelineDot, isActive && { backgroundColor: COLORS.primary }]} />
                  <Text style={[styles.timelineLabel, isActive && { color: COLORS.primary }]}>{st.replace('_', ' ')}</Text>
                </View>
              );
            })}
          </View>

          {activeJob.providerId && (
            <View style={styles.providerBox}>
              <Text style={styles.providerName}>Assigned Provider: Alex Rivers (★ 4.9)</Text>
              <TouchableOpacity style={globalStyles.btnSecondary} onPress={() => onOpenChat(activeJob.id)}>
                <Text style={globalStyles.btnSecondaryText}>💬 Chat / Call</Text>
              </TouchableOpacity>
            </View>
          )}

          {activeJob.status === 'in_progress' && (
            <TouchableOpacity style={[globalStyles.btnPrimary, { marginTop: 10 }]} onPress={() => setPaymentModalVisible(true)}>
              <Text style={globalStyles.btnPrimaryText}>💳 Pay & Complete Job</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Incoming InDrive Bids List */}
      {openJob && (
        <View style={{ marginTop: 10 }}>
          <Text style={{ fontSize: 15, fontWeight: '700', color: COLORS.textMain, marginBottom: 8 }}>
            Incoming Bids ({jobBids.length}) — InDrive Negotiable Model
          </Text>

          {jobBids.map(b => (
            <View key={b.id} style={styles.bidCard}>
              <View style={globalStyles.rowBetween}>
                <View>
                  <Text style={{ fontSize: 15, fontWeight: '700', color: COLORS.textMain }}>{b.providerName}</Text>
                  <Text style={{ fontSize: 12, color: COLORS.textMuted }}>
                    ★ {b.providerRating} ({b.providerJobCount} jobs) • {b.etaMinutes} mins ETA
                  </Text>
                </View>
                <Text style={{ fontSize: 18, fontWeight: '800', color: COLORS.primary }}>
                  ${b.counterPrice || b.price}
                </Text>
              </View>

              <Text style={{ fontSize: 12, color: COLORS.textMuted, marginVertical: 6 }}>"{b.message}"</Text>

              <View style={[globalStyles.rowBetween, { marginTop: 6 }]}>
                <TouchableOpacity
                  style={globalStyles.btnSecondary}
                  onPress={() => {
                    setSelectedBidId(b.id);
                    setCounterPriceInput(String(b.price - 5));
                    setCounterModalVisible(true);
                  }}
                >
                  <Text style={globalStyles.btnSecondaryText}>Counter Offer</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={globalStyles.btnPrimary}
                  onPress={() => acceptBid(b.id)}
                >
                  <Text style={globalStyles.btnPrimaryText}>Accept Bid</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Post Job Modal */}
      <Modal visible={postModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Post Job Request</Text>

            <Text style={globalStyles.inputLabel}>Title</Text>
            <TextInput
              style={globalStyles.input}
              placeholder="e.g. Fix Kitchen Breaker"
              placeholderTextColor={COLORS.textMuted}
              value={jobTitle}
              onChangeText={setJobTitle}
            />

            <Text style={globalStyles.inputLabel}>Description</Text>
            <TextInput
              style={[globalStyles.input, { height: 70 }]}
              multiline
              placeholder="Describe work needed..."
              placeholderTextColor={COLORS.textMuted}
              value={jobDesc}
              onChangeText={setJobDesc}
            />

            <Text style={globalStyles.inputLabel}>Target Budget</Text>
            <TextInput
              style={globalStyles.input}
              value={jobBudget}
              onChangeText={setJobBudget}
            />

            <TouchableOpacity style={globalStyles.btnPrimary} onPress={handleCreateJob}>
              <Text style={globalStyles.btnPrimaryText}>Broadcast Request</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[globalStyles.btnSecondary, { marginTop: 8 }]} onPress={() => setPostModalVisible(false)}>
              <Text style={globalStyles.btnSecondaryText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Counter Offer Modal */}
      <Modal visible={counterModalVisible} animationType="fade" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>InDrive Counter-Offer</Text>
            <Text style={globalStyles.inputLabel}>Proposed Counter Price ($)</Text>
            <TextInput
              style={globalStyles.input}
              keyboardType="numeric"
              value={counterPriceInput}
              onChangeText={setCounterPriceInput}
            />
            <TouchableOpacity style={globalStyles.btnPrimary} onPress={handleCounter}>
              <Text style={globalStyles.btnPrimaryText}>Send Counter</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[globalStyles.btnSecondary, { marginTop: 8 }]} onPress={() => setCounterModalVisible(false)}>
              <Text style={globalStyles.btnSecondaryText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Payment Modal */}
      <Modal visible={paymentModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>In-App Payment Authorization</Text>
            <Text style={{ color: COLORS.primary, fontSize: 28, fontWeight: '800', textAlign: 'center', marginVertical: 12 }}>
              ${activeJob?.finalPrice || 65}.00
            </Text>
            <Text style={{ color: COLORS.textMuted, fontSize: 12, textAlign: 'center', marginBottom: 14 }}>
              PCI-DSS Masked Payment Gateway (Cards, Wallets, Cash option)
            </Text>
            <TouchableOpacity style={globalStyles.btnPrimary} onPress={handlePayment}>
              <Text style={globalStyles.btnPrimaryText}>Authorize Payment</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Rating Modal */}
      <Modal visible={ratingModalVisible} animationType="fade" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Rate Provider</Text>
            <Text style={{ color: COLORS.accentGold, fontSize: 24, textAlign: 'center', marginVertical: 10 }}>
              ★ ★ ★ ★ ★
            </Text>
            <TouchableOpacity style={globalStyles.btnPrimary} onPress={() => { setRatingModalVisible(false); Alert.alert('Thank you!', 'Review submitted.'); }}>
              <Text style={globalStyles.btnPrimaryText}>Submit Review</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  catScroll: {
    marginBottom: 12,
  },
  catChip: {
    backgroundColor: COLORS.cardBg,
    borderColor: COLORS.cardBorder,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 8,
  },
  catChipActive: {
    backgroundColor: COLORS.primaryLight,
    borderColor: COLORS.primary,
  },
  catText: {
    color: COLORS.textMuted,
    fontSize: 12,
    fontWeight: '600',
  },
  catTextActive: {
    color: COLORS.primary,
  },
  ctaTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textMain,
    marginBottom: 4,
  },
  timelineRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 12,
    paddingHorizontal: 4,
  },
  timelineItem: {
    alignItems: 'center',
  },
  timelineDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.cardBorder,
    marginBottom: 4,
  },
  timelineLabel: {
    fontSize: 9,
    color: COLORS.textMuted,
    textTransform: 'capitalize',
  },
  providerBox: {
    backgroundColor: COLORS.darkBg,
    padding: 10,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  providerName: {
    color: COLORS.textMain,
    fontSize: 12,
    fontWeight: '600',
  },
  bidCard: {
    backgroundColor: COLORS.cardBg,
    borderColor: COLORS.cardBorder,
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalContent: {
    width: '100%',
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
