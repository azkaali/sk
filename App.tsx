/* SkillConnect React Native Application Root Entry Point */

import React, { useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar
} from 'react-native';
import { AppProvider, useAppStore } from './src/context/AppContext';
import { COLORS } from './src/styles/theme';
import { CustomerScreen } from './src/screens/CustomerScreen';
import { ProviderScreen } from './src/screens/ProviderScreen';
import { AdminScreen } from './src/screens/AdminScreen';
import { ChatScreen } from './src/screens/ChatScreen';

const MainAppNavigator: React.FC = () => {
  const { role, setRole } = useAppStore();
  const [activeChatJobId, setActiveChatJobId] = useState<string | null>(null);

  if (activeChatJobId) {
    return <ChatScreen jobId={activeChatJobId} onClose={() => setActiveChatJobId(null)} />;
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.darkBg }}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.darkBg} />
      
      {/* Top Header Role Selector Bar */}
      <View style={styles.header}>
        <View style={styles.brandRow}>
          <View style={styles.brandIcon}>
            <Text style={{ fontSize: 16 }}>🤝</Text>
          </View>
          <Text style={styles.brandText}>SkillConnect</Text>
          <View style={styles.rnBadge}>
            <Text style={styles.rnBadgeText}>REACT NATIVE</Text>
          </View>
        </View>

        {/* Role Switcher Pills */}
        <View style={styles.roleBar}>
          <TouchableOpacity
            style={[styles.rolePill, role === 'customer' && styles.rolePillActive]}
            onPress={() => setRole('customer')}
          >
            <Text style={[styles.roleText, role === 'customer' && styles.roleTextActive]}>Customer</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.rolePill, role === 'provider' && styles.rolePillActive]}
            onPress={() => setRole('provider')}
          >
            <Text style={[styles.roleText, role === 'provider' && styles.roleTextActive]}>Provider</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.rolePill, role === 'admin' && styles.adminPillActive]}
            onPress={() => setRole('admin')}
          >
            <Text style={[styles.roleText, role === 'admin' && styles.roleTextActive]}>Admin</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Screen Views */}
      {role === 'customer' && <CustomerScreen onOpenChat={jobId => setActiveChatJobId(jobId)} />}
      {role === 'provider' && <ProviderScreen onOpenChat={jobId => setActiveChatJobId(jobId)} />}
      {role === 'admin' && <AdminScreen />}
    </SafeAreaView>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainAppNavigator />
    </AppProvider>
  );
}

const styles = StyleSheet.create({
  header: {
    padding: 12,
    backgroundColor: COLORS.cardBg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.cardBorder,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  brandIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  brandText: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.textMain,
  },
  rnBadge: {
    backgroundColor: 'rgba(99, 102, 241, 0.2)',
    borderColor: COLORS.secondary,
    borderWidth: 1,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    marginLeft: 8,
  },
  rnBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: COLORS.secondary,
  },
  roleBar: {
    flexDirection: 'row',
    backgroundColor: COLORS.darkBg,
    padding: 3,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  rolePill: {
    flex: 1,
    paddingVertical: 6,
    alignItems: 'center',
    borderRadius: 16,
  },
  rolePillActive: {
    backgroundColor: COLORS.primary,
  },
  adminPillActive: {
    backgroundColor: COLORS.secondary,
  },
  roleText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
  roleTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
});
