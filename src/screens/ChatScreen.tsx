/* SkillConnect React Native - In-App Chat & Masked Calling Screen */

import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Alert
} from 'react-native';
import { useAppStore } from '../context/AppContext';
import { COLORS, globalStyles } from '../styles/theme';

export const ChatScreen: React.FC<{ jobId: string; onClose: () => void }> = ({ jobId, onClose }) => {
  const { chats, sendChatMessage, currentUser, currentProvider, role } = useAppStore();
  const [inputText, setInputText] = useState('');
  const [callModalVisible, setCallModalVisible] = useState(false);

  const messages = chats[jobId] || [];
  const myId = role === 'customer' ? currentUser.id : currentProvider.id;

  const handleSend = () => {
    if (!inputText.trim()) return;
    sendChatMessage(jobId, inputText.trim());
    setInputText('');
  };

  return (
    <View style={globalStyles.container}>
      {/* Chat Header Bar */}
      <View style={styles.headerBar}>
        <TouchableOpacity onPress={onClose}>
          <Text style={{ color: COLORS.primary, fontWeight: '700', fontSize: 14 }}>← Back</Text>
        </TouchableOpacity>
        <Text style={{ color: COLORS.textMain, fontWeight: '700', fontSize: 15 }}>SkillConnect Chat</Text>
        <TouchableOpacity onPress={() => setCallModalVisible(true)}>
          <Text style={{ color: COLORS.accentGold, fontWeight: '700', fontSize: 12 }}>📞 Call</Text>
        </TouchableOpacity>
      </View>

      {/* Messages Scroll Area */}
      <ScrollView style={{ flex: 1, padding: 14 }}>
        {messages.map(m => {
          const isMe = m.sender === myId;
          return (
            <View
              key={m.id}
              style={[
                styles.bubble,
                isMe ? styles.sentBubble : styles.receivedBubble
              ]}
            >
              <Text style={styles.senderLabel}>{m.senderName}</Text>
              <Text style={styles.bubbleText}>{m.text}</Text>
              <Text style={styles.timeText}>{m.timestamp}</Text>
            </View>
          );
        })}
      </ScrollView>

      {/* Input Bar */}
      <View style={styles.inputBar}>
        <TextInput
          style={[globalStyles.input, { flex: 1, marginBottom: 0 }]}
          placeholder="Type message..."
          placeholderTextColor={COLORS.textMuted}
          value={inputText}
          onChangeText={setInputText}
        />
        <TouchableOpacity style={globalStyles.btnPrimary} onPress={handleSend}>
          <Text style={globalStyles.btnPrimaryText}>Send</Text>
        </TouchableOpacity>
      </View>

      {/* Masked Phone Call Simulator Modal */}
      <Modal visible={callModalVisible} animationType="fade" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.callContent}>
            <Text style={{ fontSize: 40, textAlign: 'center' }}>🛡️</Text>
            <Text style={{ fontSize: 16, fontWeight: '700', color: COLORS.textMain, marginTop: 8, textAlign: 'center' }}>
              Privacy-Masked Voice Call
            </Text>
            <Text style={{ fontSize: 11, color: COLORS.textMuted, textAlign: 'center', marginVertical: 6 }}>
              Both phone numbers are hidden & protected by SkillConnect proxy line.
            </Text>
            <TouchableOpacity
              style={[globalStyles.btnPrimary, { backgroundColor: COLORS.accentRed }]}
              onPress={() => {
                setCallModalVisible(false);
                Alert.alert('Call Ended', 'Masked connection terminated.');
              }}
            >
              <Text style={globalStyles.btnPrimaryText}>End Masked Call</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    backgroundColor: COLORS.cardBg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.cardBorder,
  },
  bubble: {
    maxWidth: '80%',
    padding: 10,
    borderRadius: 14,
    marginBottom: 8,
  },
  sentBubble: {
    alignSelf: 'flex-end',
    backgroundColor: COLORS.primary,
  },
  receivedBubble: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.cardBg,
    borderColor: COLORS.cardBorder,
    borderWidth: 1,
  },
  senderLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: COLORS.textMuted,
    marginBottom: 2,
  },
  bubbleText: {
    color: COLORS.textMain,
    fontSize: 13,
  },
  timeText: {
    fontSize: 8,
    color: COLORS.textMuted,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  inputBar: {
    flexDirection: 'row',
    gap: 8,
    padding: 12,
    backgroundColor: COLORS.cardBg,
    borderTopWidth: 1,
    borderTopColor: COLORS.cardBorder,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  callContent: {
    width: '80%',
    backgroundColor: COLORS.cardBg,
    borderColor: COLORS.primary,
    borderWidth: 1,
    borderRadius: 16,
    padding: 20,
  },
});
