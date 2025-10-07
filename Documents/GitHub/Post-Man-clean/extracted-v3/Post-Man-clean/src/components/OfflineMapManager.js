import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  Alert,
  ActivityIndicator,
  ProgressBarAndroid,
  Platform
} from 'react-native';
import offlineMapService from '../services/OfflineService/OfflineMapService';

const OfflineMapManager = ({ visible, onClose }) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [downloadedRegions, setDownloadedRegions] = useState([]);
  const [cacheStats, setCacheStats] = useState(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(null);
  const [loading, setLoading] = useState(false);

  // Regioni predefinite per download
  const predefinedRegions = [
    {
      name: 'Milano Centro',
      centerLat: 45.4642,
      centerLng: 9.1900,
      radiusKm: 5,
      zoomLevels: [12, 13, 14, 15, 16],
      description: 'Area centrale di Milano (5km raggio)'
    },
    {
      name: 'Roma Centro',
      centerLat: 41.9028,
      centerLng: 12.4964,
      radiusKm: 5,
      zoomLevels: [12, 13, 14, 15, 16],
      description: 'Area centrale di Roma (5km raggio)'
    },
    {
      name: 'Napoli Centro',
      centerLat: 40.8518,
      centerLng: 14.2681,
      radiusKm: 5,
      zoomLevels: [12, 13, 14, 15, 16],
      description: 'Area centrale di Napoli (5km raggio)'
    }
  ];

  useEffect(() => {
    if (visible) {
      initializeService();
    }
  }, [visible]);

  const initializeService = async () => {
    try {
      setLoading(true);
      await offlineMapService.initialize();
      setIsInitialized(true);
      await loadData();
    } catch (error) {
      console.error('Error initializing offline map service:', error);
      Alert.alert('Errore', 'Errore nell\'inizializzazione del servizio mappe offline');
    } finally {
      setLoading(false);
    }
  };

  const loadData = async () => {
    try {
      const regions = await offlineMapService.getDownloadedRegions();
      const stats = await offlineMapService.getCacheStats();
      
      setDownloadedRegions(regions);
      setCacheStats(stats);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const downloadRegion = async (region) => {
    try {
      setIsDownloading(true);
      setDownloadProgress({ progress: 0, region: region.name });

      const result = await offlineMapService.downloadRegionTiles({
        ...region,
        onProgress: (progress) => {
          setDownloadProgress(progress);
        }
      });

      if (result.success) {
        Alert.alert(
          'Download Completato',
          `Regione "${region.name}" scaricata con successo!\n${result.downloadedTiles} tiles scaricati.`,
          [{ text: 'OK' }]
        );
        await loadData(); // Ricarica dati
      }
    } catch (error) {
      console.error('Error downloading region:', error);
      Alert.alert('Errore Download', error.message);
    } finally {
      setIsDownloading(false);
      setDownloadProgress(null);
    }
  };

  const clearCache = () => {
    Alert.alert(
      'Conferma Cancellazione',
      'Sei sicuro di voler cancellare tutte le mappe offline? Questa azione non può essere annullata.',
      [
        { text: 'Annulla', style: 'cancel' },
        {
          text: 'Cancella',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              await offlineMapService.clearCache();
              await loadData();
              Alert.alert('Successo', 'Cache mappe offline cancellata');
            } catch (error) {
              console.error('Error clearing cache:', error);
              Alert.alert('Errore', 'Errore nella cancellazione della cache');
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('it-IT');
  };

  if (loading) {
    return (
      <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FFD800" />
          <Text style={styles.loadingText}>Inizializzazione...</Text>
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
          <Text style={styles.title}>🗺️ Mappe Offline</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content}>
          {/* Statistiche Cache */}
          {cacheStats && (
            <View style={styles.statsSection}>
              <Text style={styles.sectionTitle}>📊 Statistiche Cache</Text>
              <View style={styles.statsContainer}>
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>Tiles Scaricati</Text>
                  <Text style={styles.statValue}>{cacheStats.total_tiles || 0}</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>Dimensione Cache</Text>
                  <Text style={styles.statValue}>{formatFileSize(cacheStats.total_size || 0)}</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>Ultimo Accesso</Text>
                  <Text style={styles.statValue}>{formatDate(cacheStats.last_access)}</Text>
                </View>
              </View>
            </View>
          )}

          {/* Download in corso */}
          {isDownloading && downloadProgress && (
            <View style={styles.downloadSection}>
              <Text style={styles.sectionTitle}>⬇️ Download in Corso</Text>
              <View style={styles.downloadContainer}>
                <Text style={styles.downloadRegion}>{downloadProgress.region}</Text>
                <Text style={styles.downloadProgress}>
                  {downloadProgress.downloadedTiles} / {downloadProgress.totalTiles} tiles
                </Text>
                {Platform.OS === 'android' ? (
                  <ProgressBarAndroid
                    styleAttr="Horizontal"
                    progress={downloadProgress.progress / 100}
                    indeterminate={false}
                    color="#FFD800"
                  />
                ) : (
                  <View style={styles.progressBar}>
                    <View 
                      style={[
                        styles.progressFill, 
                        { width: `${downloadProgress.progress}%` }
                      ]} 
                    />
                  </View>
                )}
                <Text style={styles.progressText}>
                  {downloadProgress.progress.toFixed(1)}%
                </Text>
              </View>
            </View>
          )}

          {/* Regioni Predefinite */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📍 Regioni Disponibili</Text>
            <Text style={styles.sectionDescription}>
              Scarica mappe offline per aree specifiche. Le mappe saranno disponibili anche senza connessione internet.
            </Text>
            
            {predefinedRegions.map((region, index) => (
              <View key={index} style={styles.regionCard}>
                <View style={styles.regionInfo}>
                  <Text style={styles.regionName}>{region.name}</Text>
                  <Text style={styles.regionDescription}>{region.description}</Text>
                  <Text style={styles.regionDetails}>
                    Zoom: {region.zoomLevels.join(', ')} | Raggio: {region.radiusKm}km
                  </Text>
                </View>
                <TouchableOpacity
                  style={[
                    styles.downloadButton,
                    isDownloading && styles.downloadButtonDisabled
                  ]}
                  onPress={() => downloadRegion(region)}
                  disabled={isDownloading}
                >
                  <Text style={styles.downloadButtonText}>
                    {isDownloading ? '⏳' : '⬇️'} Scarica
                  </Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>

          {/* Regioni Scaricate */}
          {downloadedRegions.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>✅ Regioni Scaricate</Text>
              {downloadedRegions.map((region, index) => (
                <View key={index} style={styles.downloadedRegionCard}>
                  <View style={styles.downloadedRegionInfo}>
                    <Text style={styles.downloadedRegionName}>{region.name}</Text>
                    <Text style={styles.downloadedRegionStats}>
                      {region.downloaded_tiles} / {region.total_tiles} tiles
                    </Text>
                    <Text style={styles.downloadedRegionDate}>
                      Scaricato: {formatDate(region.completed_at)}
                    </Text>
                  </View>
                  <View style={styles.statusBadge}>
                    <Text style={styles.statusText}>
                      {region.status === 'completed' ? '✅' : '⏳'}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* Gestione Cache */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🗑️ Gestione Cache</Text>
            <Text style={styles.sectionDescription}>
              Gestisci lo spazio utilizzato dalle mappe offline.
            </Text>
            
            <TouchableOpacity
              style={styles.clearButton}
              onPress={clearCache}
              disabled={loading}
            >
              <Text style={styles.clearButtonText}>🗑️ Cancella Tutta la Cache</Text>
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
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 15,
    lineHeight: 20,
  },
  statsSection: {
    marginBottom: 30,
    padding: 15,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: '#666666',
    marginBottom: 5,
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
  },
  downloadSection: {
    marginBottom: 30,
    padding: 15,
    backgroundColor: '#E3F2FD',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#2196F3',
  },
  downloadContainer: {
    alignItems: 'center',
  },
  downloadRegion: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1976D2',
    marginBottom: 5,
  },
  downloadProgress: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 10,
  },
  progressBar: {
    width: '100%',
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 5,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FFD800',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: '#666666',
  },
  regionCard: {
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
  regionInfo: {
    flex: 1,
  },
  regionName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 5,
  },
  regionDescription: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 3,
  },
  regionDetails: {
    fontSize: 12,
    color: '#999999',
  },
  downloadButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 5,
  },
  downloadButtonDisabled: {
    backgroundColor: '#E0E0E0',
  },
  downloadButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  downloadedRegionCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#E8F5E8',
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#4CAF50',
  },
  downloadedRegionInfo: {
    flex: 1,
  },
  downloadedRegionName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 5,
  },
  downloadedRegionStats: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 3,
  },
  downloadedRegionDate: {
    fontSize: 12,
    color: '#999999',
  },
  statusBadge: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusText: {
    fontSize: 16,
  },
  clearButton: {
    backgroundColor: '#F44336',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  clearButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default OfflineMapManager;
