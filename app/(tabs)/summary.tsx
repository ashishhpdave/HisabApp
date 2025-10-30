import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  RefreshControl,
  Alert,
} from 'react-native';
import { useFocusEffect } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { Entry } from '../../types/database';
import { formatCurrency } from '../../utils/formatters';
import { LinearGradient } from 'expo-linear-gradient';
import { PieChart, BarChart } from 'react-native-chart-kit';
import { TrendingUp, TrendingDown, Wallet } from 'lucide-react-native';

const screenWidth = Dimensions.get('window').width;

export default function SummaryScreen() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchEntries = async () => {
    try {
      const { data, error } = await supabase
        .from('entries')
        .select('*')
        .order('date', { ascending: false });

      if (error) throw error;
      setEntries(data || []);
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchEntries();
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchEntries();
    setRefreshing(false);
  };

  const totalUdhar = entries
    .filter((e) => e.type === 'udhar')
    .reduce((sum, e) => sum + Number(e.amount), 0);

  const totalKharcha = entries
    .filter((e) => e.type === 'kharcha')
    .reduce((sum, e) => sum + Number(e.amount), 0);

  const totalIncome = entries
    .filter((e) => e.type === 'income')
    .reduce((sum, e) => sum + Number(e.amount), 0);

  const balance = totalIncome - totalKharcha;

  const pieData = [
    {
      name: 'Udhar',
      amount: totalUdhar,
      color: '#FFD43B',
      legendFontColor: '#64748B',
      legendFontSize: 14,
    },
    {
      name: 'Expense',
      amount: totalKharcha,
      color: '#FF6B6B',
      legendFontColor: '#64748B',
      legendFontSize: 14,
    },
    {
      name: 'Income',
      amount: totalIncome,
      color: '#51CF66',
      legendFontColor: '#64748B',
      legendFontSize: 14,
    },
  ];

  const monthlyData = getMonthlyData(entries);

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#E8F5E9', '#F1F8E9']} style={styles.header}>
        <Text style={styles.title}>Summary & Analytics</Text>
      </LinearGradient>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View style={styles.summaryCards}>
          <View style={[styles.card, { backgroundColor: '#D4F4DD' }]}>
            <View style={styles.cardIcon}>
              <TrendingUp size={24} color="#10B981" />
            </View>
            <Text style={styles.cardLabel}>Total Income</Text>
            <Text style={[styles.cardValue, { color: '#10B981' }]}>
              {formatCurrency(totalIncome)}
            </Text>
          </View>

          <View style={[styles.card, { backgroundColor: '#FFE5E5' }]}>
            <View style={styles.cardIcon}>
              <TrendingDown size={24} color="#FF6B6B" />
            </View>
            <Text style={styles.cardLabel}>Total Expense</Text>
            <Text style={[styles.cardValue, { color: '#FF6B6B' }]}>
              {formatCurrency(totalKharcha)}
            </Text>
          </View>

          <View style={[styles.card, { backgroundColor: '#FFF3CD' }]}>
            <View style={styles.cardIcon}>
              <Wallet size={24} color="#FFB020" />
            </View>
            <Text style={styles.cardLabel}>Total Udhar</Text>
            <Text style={[styles.cardValue, { color: '#FFB020' }]}>
              {formatCurrency(totalUdhar)}
            </Text>
          </View>

          <View style={[styles.card, styles.balanceCard]}>
            <Text style={styles.cardLabel}>Net Balance</Text>
            <Text style={[styles.balanceValue, balance < 0 && styles.negativeBalance]}>
              {formatCurrency(balance)}
            </Text>
          </View>
        </View>

        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>Distribution Overview</Text>
          {totalIncome + totalKharcha + totalUdhar > 0 ? (
            <PieChart
              data={pieData}
              width={screenWidth - 80}
              height={220}
              chartConfig={{
                color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              }}
              accessor="amount"
              backgroundColor="transparent"
              paddingLeft="15"
              absolute
            />
          ) : (
            <View style={styles.noDataContainer}>
              <Text style={styles.noDataText}>No data to display</Text>
            </View>
          )}
        </View>

        {monthlyData.labels.length > 0 && (
          <View style={styles.chartCard}>
            <Text style={styles.chartTitle}>Monthly Trend</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <BarChart
                data={monthlyData}
                width={Math.max(screenWidth - 80, monthlyData.labels.length * 80)}
                height={220}
                yAxisLabel="₹"
                yAxisSuffix=""
                chartConfig={{
                  backgroundColor: '#fff',
                  backgroundGradientFrom: '#fff',
                  backgroundGradientTo: '#fff',
                  decimalPlaces: 0,
                  color: (opacity = 1) => `rgba(16, 185, 129, ${opacity})`,
                  labelColor: (opacity = 1) => `rgba(100, 116, 139, ${opacity})`,
                  style: {
                    borderRadius: 16,
                  },
                  propsForLabels: {
                    fontSize: 12,
                  },
                }}
                style={styles.barChart}
                fromZero
                showValuesOnTopOfBars
              />
            </ScrollView>
          </View>
        )}

        <View style={styles.statsCard}>
          <Text style={styles.statsTitle}>Quick Stats</Text>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Total Entries:</Text>
            <Text style={styles.statValue}>{entries.length}</Text>
          </View>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Avg. Transaction:</Text>
            <Text style={styles.statValue}>
              {entries.length > 0
                ? formatCurrency(
                    entries.reduce((sum, e) => sum + Number(e.amount), 0) / entries.length
                  )
                : '₹0.00'}
            </Text>
          </View>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Largest Transaction:</Text>
            <Text style={styles.statValue}>
              {entries.length > 0
                ? formatCurrency(Math.max(...entries.map((e) => Number(e.amount))))
                : '₹0.00'}
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

function getMonthlyData(entries: Entry[]) {
  const monthlyTotals: { [key: string]: number } = {};

  entries.forEach((entry) => {
    const date = new Date(entry.date);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    monthlyTotals[monthKey] = (monthlyTotals[monthKey] || 0) + Number(entry.amount);
  });

  const sortedMonths = Object.keys(monthlyTotals).sort();
  const labels = sortedMonths.map((m) => {
    const [year, month] = m.split('-');
    return `${['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][parseInt(month) - 1]}`;
  });
  const data = sortedMonths.map((m) => monthlyTotals[m]);

  return {
    labels: labels.slice(-6),
    datasets: [{ data: data.slice(-6) }],
  };
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
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#2D3748',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  summaryCards: {
    marginBottom: 20,
  },
  card: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  cardIcon: {
    marginBottom: 8,
  },
  cardLabel: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 8,
  },
  cardValue: {
    fontSize: 24,
    fontWeight: '700',
  },
  balanceCard: {
    backgroundColor: '#fff',
  },
  balanceValue: {
    fontSize: 28,
    fontWeight: '700',
    color: '#10B981',
  },
  negativeBalance: {
    color: '#FF6B6B',
  },
  chartCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2D3748',
    marginBottom: 16,
  },
  noDataContainer: {
    height: 220,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noDataText: {
    fontSize: 16,
    color: '#94A3B8',
  },
  barChart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  statsCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2D3748',
    marginBottom: 16,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  statLabel: {
    fontSize: 14,
    color: '#64748B',
  },
  statValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2D3748',
  },
});
