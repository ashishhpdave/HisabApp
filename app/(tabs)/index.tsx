import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  Alert,
} from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Summary } from '../../types/database';
import { formatCurrency } from '../../utils/formatters';
import { LinearGradient } from 'expo-linear-gradient';
import { Plus, TrendingUp, TrendingDown, Wallet, BarChart3, LogOut } from 'lucide-react-native';

export default function HomeScreen() {
  const { signOut } = useAuth();
  const [summary, setSummary] = useState<Summary>({
    totalUdhar: 0,
    totalKharcha: 0,
    totalIncome: 0,
    balance: 0,
  });
  const [refreshing, setRefreshing] = useState(false);

  const fetchSummary = async () => {
    try {
      const { data, error } = await supabase
        .from('entries')
        .select('amount, type');

      if (error) throw error;

      const totalUdhar = data
        ?.filter((e) => e.type === 'udhar')
        .reduce((sum, e) => sum + Number(e.amount), 0) || 0;

      const totalKharcha = data
        ?.filter((e) => e.type === 'kharcha')
        .reduce((sum, e) => sum + Number(e.amount), 0) || 0;

      const totalIncome = data
        ?.filter((e) => e.type === 'income')
        .reduce((sum, e) => sum + Number(e.amount), 0) || 0;

      const balance = totalIncome - totalKharcha;

      setSummary({ totalUdhar, totalKharcha, totalIncome, balance });
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchSummary();
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchSummary();
    setRefreshing(false);
  };

  const handleSignOut = async () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          await signOut();
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#E8F5E9', '#F1F8E9']} style={styles.header}>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.greeting}>Hello!</Text>
            <Text style={styles.title}>Hisab Kitab</Text>
          </View>
          <TouchableOpacity onPress={handleSignOut} style={styles.logoutButton}>
            <LogOut size={24} color="#64748B" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Current Balance</Text>
          <Text style={[styles.balanceAmount, summary.balance < 0 && styles.negativeBalance]}>
            {formatCurrency(summary.balance)}
          </Text>
        </View>

        <View style={styles.cardsRow}>
          <View style={[styles.summaryCard, { backgroundColor: '#FFF3CD' }]}>
            <View style={styles.cardIcon}>
              <Wallet size={24} color="#FFB020" />
            </View>
            <Text style={styles.cardLabel}>Udhar</Text>
            <Text style={styles.cardAmount}>{formatCurrency(summary.totalUdhar)}</Text>
          </View>

          <View style={[styles.summaryCard, { backgroundColor: '#FFE5E5' }]}>
            <View style={styles.cardIcon}>
              <TrendingDown size={24} color="#FF6B6B" />
            </View>
            <Text style={styles.cardLabel}>Expense</Text>
            <Text style={styles.cardAmount}>{formatCurrency(summary.totalKharcha)}</Text>
          </View>
        </View>

        <View style={[styles.summaryCard, styles.fullCard, { backgroundColor: '#D4F4DD' }]}>
          <View style={styles.cardIcon}>
            <TrendingUp size={24} color="#10B981" />
          </View>
          <Text style={styles.cardLabel}>Income</Text>
          <Text style={styles.cardAmount}>{formatCurrency(summary.totalIncome)}</Text>
        </View>

        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => router.push('/(tabs)/entries')}
          >
            <Text style={styles.actionButtonText}>View All Entries</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.secondaryButton]}
            onPress={() => router.push('/(tabs)/summary')}
          >
            <BarChart3 size={20} color="#10B981" />
            <Text style={[styles.actionButtonText, styles.secondaryButtonText]}>
              View Summary
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push('/add-entry')}
        activeOpacity={0.8}
      >
        <LinearGradient colors={['#10B981', '#059669']} style={styles.fabGradient}>
          <Plus size={32} color="#fff" />
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 24,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greeting: {
    fontSize: 16,
    color: '#64748B',
    marginBottom: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#2D3748',
  },
  logoutButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  balanceCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  balanceLabel: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 8,
  },
  balanceAmount: {
    fontSize: 36,
    fontWeight: '700',
    color: '#10B981',
  },
  negativeBalance: {
    color: '#FF6B6B',
  },
  cardsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  summaryCard: {
    flex: 1,
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  fullCard: {
    marginHorizontal: 4,
    marginBottom: 20,
  },
  cardIcon: {
    marginBottom: 12,
  },
  cardLabel: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 8,
  },
  cardAmount: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2D3748',
  },
  actionsContainer: {
    marginTop: 8,
    marginBottom: 80,
  },
  actionButton: {
    backgroundColor: '#10B981',
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  secondaryButton: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#10B981',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  secondaryButtonText: {
    color: '#10B981',
  },
  fab: {
    position: 'absolute',
    bottom: 90,
    right: 20,
    borderRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  fabGradient: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
