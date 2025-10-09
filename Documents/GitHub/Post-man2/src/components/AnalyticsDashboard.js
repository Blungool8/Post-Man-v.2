import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  ActivityIndicator,
  Alert
} from 'react-native';
import * as FileSystem from 'expo-file-system';
import analyticsService from '../services/AnalyticsService/AnalyticsService';

const AnalyticsDashboard = ({ visible, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState(7);

  useEffect(() => {
    if (visible) {
      loadStats();
    }
  }, [visible, selectedPeriod]);

  const loadStats = async () => {
    try {
      setLoading(true);
      const usageStats = await analyticsService.getUsageStats(selectedPeriod);
      setStats(usageStats);
    } catch (error) {
      console.error('Error loading stats:', error);
      Alert.alert('Errore', 'Errore nel caricamento delle statistiche');
    } finally {
      setLoading(false);
    }
  };

  const exportData = async () => {
    try {
      setLoading(true);
      const filePath = await analyticsService.exportAnalyticsData();
      
      Alert.alert(
        'Export Completato',
        `Dati esportati in: ${filePath}`,
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Error exporting data:', error);
      Alert.alert('Errore', 'Errore nell\'export dei dati');
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (seconds) => {
    if (seconds < 60) return `${Math.round(seconds)}s`;
    if (seconds < 3600) return `${Math.round(seconds / 60)}m`;
    return `${Math.round(seconds / 3600)}h`;
  };

  const formatNumber = (num) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  if (loading) {
    return (
      <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FFD800" />
          <Text style={styles.loadingText}>Caricamento statistiche...</Text>
        </View>
      </Modal>
    );
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>📊 Analytics Dashboard</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content}>
          {/* Selettore Periodo */}
          <View style={styles.periodSelector}>
            <Text style={styles.sectionTitle}>📅 Periodo</Text>
            <View style={styles.periodButtons}>
              {[1, 7, 30].map(days => (
                <TouchableOpacity
                  key={days}
                  style={[
                    styles.periodButton,
                    selectedPeriod === days && styles.periodButtonActive
                  ]}
                  onPress={() => setSelectedPeriod(days)}
                >
                  <Text style={[
                    styles.periodButtonText,
                    selectedPeriod === days && styles.periodButtonTextActive
                  ]}>
                    {days === 1 ? 'Oggi' : `${days} giorni`}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {stats && (
            <>
              {/* Statistiche Sessioni */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>📱 Sessioni</Text>
                <View style={styles.statsGrid}>
                  <View style={styles.statCard}>
                    <Text style={styles.statValue}>{stats.sessionStats.total_sessions}</Text>
                    <Text style={styles.statLabel}>Sessioni Totali</Text>
                  </View>
                  <View style={styles.statCard}>
                    <Text style={styles.statValue}>
                      {formatDuration(stats.sessionStats.avg_session_duration || 0)}
                    </Text>
                    <Text style={styles.statLabel}>Durata Media</Text>
                  </View>
                  <View style={styles.statCard}>
                    <Text style={styles.statValue}>
                      {formatDuration(stats.sessionStats.total_time_spent || 0)}
                    </Text>
                    <Text style={styles.statLabel}>Tempo Totale</Text>
                  </View>
                </View>
              </View>

              {/* Top Funzionalità */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>⭐ Funzionalità Più Utilizzate</Text>
                {stats.topFeatures.map((feature, index) => (
                  <View key={index} style={styles.featureItem}>
                    <View style={styles.featureInfo}>
                      <Text style={styles.featureName}>{feature.feature_name}</Text>
                      <Text style={styles.featureDetails}>
                        {formatNumber(feature.total_usage)} utilizzi • {formatDuration(feature.total_duration || 0)}
                      </Text>
                    </View>
                    <View style={styles.featureRank}>
                      <Text style={styles.rankNumber}>#{index + 1}</Text>
                    </View>
                  </View>
                ))}
              </View>

              {/* Top Eventi */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>🎯 Eventi Più Comuni</Text>
                {stats.topEvents.map((event, index) => (
                  <View key={index} style={styles.eventItem}>
                    <View style={styles.eventInfo}>
                      <Text style={styles.eventName}>{event.event_name}</Text>
                      <Text style={styles.eventCount}>
                        {formatNumber(event.event_count)} volte
                      </Text>
                    </View>
                    <View style={styles.eventBar}>
                      <View 
                        style={[
                          styles.eventBarFill,
                          { 
                            width: `${(event.event_count / stats.topEvents[0].event_count) * 100}%` 
                          }
                        ]} 
                      />
                    </View>
                  </View>
                ))}
              </View>

              {/* Metriche Performance */}
              {stats.performanceStats.length > 0 && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>⚡ Performance</Text>
                  {stats.performanceStats.map((metric, index) => (
                    <View key={index} style={styles.metricItem}>
                      <Text style={styles.metricName}>{metric.metric_name}</Text>
                      <View style={styles.metricValues}>
                        <Text style={styles.metricValue}>
                          Avg: {metric.avg_value.toFixed(1)}{metric.unit || ''}
                        </Text>
                        <Text style={styles.metricRange}>
                          Range: {metric.min_value.toFixed(1)} - {metric.max_value.toFixed(1)}
                        </Text>
                        <Text style={styles.metricSamples}>
                          {metric.sample_count} campioni
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>
              )}
            </>
          )}

          {/* Azioni */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🔧 Azioni</Text>
            
            <TouchableOpacity
              style={styles.actionButton}
              onPress={loadStats}
              disabled={loading}
            >
              <Text style={styles.actionButtonText}>🔄 Aggiorna Statistiche</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.exportButton]}
              onPress={exportData}
              disabled={loading}
            >
              <Text style={styles.actionButtonText}>📤 Esporta Dati</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 20,
    fontSize: 16,
    color: '#666666',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
  },
  closeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    color: '#666666',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 15,
  },
  periodSelector: {
    marginBottom: 30,
  },
  periodButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    alignItems: 'center',
  },
  periodButtonActive: {
    backgroundColor: '#FFD800',
  },
  periodButtonText: {
    fontSize: 14,
    color: '#666666',
    fontWeight: 'bold',
  },
  periodButtonTextActive: {
    color: '#333333',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 12,
    color: '#666666',
    textAlign: 'center',
  },
  featureItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  featureInfo: {
    flex: 1,
  },
  featureName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 5,
  },
  featureDetails: {
    fontSize: 14,
    color: '#666666',
  },
  featureRank: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#FFD800',
    justifyContent: 'center',
    alignItems: 'center',
  },
  rankNumber: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333333',
  },
  eventItem: {
    padding: 15,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  eventInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  eventName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
  },
  eventCount: {
    fontSize: 14,
    color: '#666666',
  },
  eventBar: {
    height: 6,
    backgroundColor: '#E0E0E0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  eventBarFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 3,
  },
  metricItem: {
    padding: 15,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  metricName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 10,
  },
  metricValues: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metricValue: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  metricRange: {
    fontSize: 12,
    color: '#666666',
  },
  metricSamples: {
    fontSize: 12,
    color: '#999999',
  },
  actionButton: {
    backgroundColor: '#FFD800',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  exportButton: {
    backgroundColor: '#4CAF50',
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
  },
});

export default AnalyticsDashboard;
