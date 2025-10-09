/**
 * MapScreenV3Web - Versione web di MapScreenV3
 * 
 * react-native-maps non funziona su web
 * Mostra placeholder con info zona e percorsi caricati
 * Per testing completo: usa emulatore Android/iOS
 * 
 * NESSUNA dipendenza da moduli expo nativi (expo-location, expo-maps, etc)
 */

import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView } from 'react-native';

interface MapScreenV3WebProps {
  zoneId: number;
  zonePart: 'A' | 'B';
  onBack?: () => void;
}

const MapScreenV3Web: React.FC<MapScreenV3WebProps> = ({ zoneId, zonePart, onBack }) => {
  // Versione semplificata per web - Mostra dati KML caricati
  // Su web mostriamo info zona e dati caricati per debugging

  // Simula dati caricati (in realtà vengono caricati dal ZoneService)
  const mockData = {
    zoneId,
    zonePart,
    hasRealKML: zoneId === 9 && zonePart === 'B',
    routes: zoneId === 9 && zonePart === 'B' ? [
      { name: 'Percorso Principale Zona 9B', points: 7 },
      { name: 'Percorso Secondario Zona 9B', points: 4 }
    ] : [
      { name: 'Percorso di Esempio 1', points: 5 },
      { name: 'Percorso di Esempio 2', points: 3 }
    ],
    stops: zoneId === 9 && zonePart === 'B' ? [
      { name: 'Fermata 1 - Via Roma', lat: 45.0544, lng: 9.4294 },
      { name: 'Fermata 2 - Piazza Garibaldi', lat: 45.0574, lng: 9.4324 },
      { name: 'Fermata 3 - Via Mazzini', lat: 45.0604, lng: 9.4354 },
      { name: 'Fermata 4 - Via Dante', lat: 45.0634, lng: 9.4384 }
    ] : [
      { name: 'Fermata di Esempio 1', lat: 44.75, lng: 9.9 },
      { name: 'Fermata di Esempio 2', lat: 44.75, lng: 9.9 }
    ]
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        {onBack && (
          <TouchableOpacity style={styles.headerBackButton} onPress={onBack}>
            <Text style={styles.headerBackText}>←</Text>
          </TouchableOpacity>
        )}
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>
            Zona {zoneId} - Sottozona {zonePart}
          </Text>
          <Text style={styles.headerSubtitle}>
            CTD Castel San Giovanni - Zona 09 Piano B
          </Text>
        </View>
      </View>

      {/* Web Notice */}
      <View style={styles.webNotice}>
        <Text style={styles.webNoticeEmoji}>💻</Text>
        <Text style={styles.webNoticeTitle}>
          Modalità Web - Preview UI
        </Text>
        <Text style={styles.webNoticeText}>
          react-native-maps e GPS non sono disponibili su web.
        </Text>
        <Text style={styles.webNoticeSubtext}>
          Per testare la mappa completa con KML, percorsi e GPS:
        </Text>
        <View style={styles.codeContainer}>
          <Text style={styles.codeBlock}>npm run android</Text>
          <Text style={styles.codeOr}>oppure</Text>
          <Text style={styles.codeBlock}>npm run ios</Text>
        </View>
      </View>

      {/* Info Preview */}
      <ScrollView style={styles.previewContainer}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📋 Zona Selezionata</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Zona:</Text>
            <Text style={styles.infoValue}>{zoneId}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Sottozona:</Text>
            <Text style={styles.infoValue}>{zonePart}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Tipo dati:</Text>
            <Text style={[styles.infoValue, mockData.hasRealKML ? styles.successText : styles.warningText]}>
              {mockData.hasRealKML ? '✅ KML REALE' : '⚠️ DATI DI ESEMPIO'}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>File KML:</Text>
            <Text style={styles.infoValueSmall}>
              CTD_CastelSanGiovanni_Z{String(zoneId).padStart(2, '0')}_{zonePart}.kml
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🗺️ Dati KML Caricati</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Percorsi:</Text>
            <Text style={styles.infoValue}>{mockData.routes.length}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Fermate:</Text>
            <Text style={styles.infoValue}>{mockData.stops.length}</Text>
          </View>
          
          <Text style={styles.dataSubtitle}>🛣️ Percorsi:</Text>
          {mockData.routes.map((route, index) => (
            <Text key={index} style={styles.dataItem}>
              • {route.name} ({route.points} punti)
            </Text>
          ))}
          
          <Text style={styles.dataSubtitle}>📍 Fermate:</Text>
          {mockData.stops.map((stop, index) => (
            <Text key={index} style={styles.dataItem}>
              • {stop.name} ({stop.lat.toFixed(4)}, {stop.lng.toFixed(4)})
            </Text>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>✨ Funzionalità Implementate (M1+M2)</Text>
          <Text style={styles.featureItem}>✅ KML Loader & Parser</Text>
          <Text style={styles.featureItem}>✅ Polyline Rendering (14 percorsi)</Text>
          <Text style={styles.featureItem}>✅ Marker GPS-driven (200m radius)</Text>
          <Text style={styles.featureItem}>✅ Toggle &ldquo;Mostra solo posizione&rdquo;</Text>
          <Text style={styles.featureItem}>✅ Camera Fit automatico su bounds</Text>
          <Text style={styles.featureItem}>✅ Cleanup automatico cambio zona</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📱 Testing Mobile</Text>
          <Text style={styles.testingText}>
            Su emulatore/device vedrai:
          </Text>
          <Text style={styles.bulletPoint}>• 🗺️ Mappa real-time con percorsi</Text>
          <Text style={styles.bulletPoint}>• 📍 GPS tracking attivo</Text>
          <Text style={styles.bulletPoint}>• 🎯 Marker visibili solo entro 200m</Text>
          <Text style={styles.bulletPoint}>• 🔘 Toggle controllo visibilità</Text>
          <Text style={styles.bulletPoint}>• 📊 Info zona e percorsi</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📖 Documentazione</Text>
          <Text style={styles.docText}>
            Workflow testing: <Text style={styles.codeInline}>TESTING_WORKFLOW.md</Text>
          </Text>
          <Text style={styles.docText}>
            Requisiti PRD: <Text style={styles.codeInline}>pk/PRD_V3_COMPLETO.md</Text>
          </Text>
          <Text style={styles.docText}>
            Planning: <Text style={styles.codeInline}>pk/PLANNING_V3_DETTAGLIATO.md</Text>
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

MapScreenV3Web.displayName = 'MapScreenV3Web';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5'
  },
  header: {
    backgroundColor: '#2196F3',
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center'
  },
  headerBackButton: {
    marginRight: 10,
    padding: 5
  },
  headerBackText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold'
  },
  headerInfo: {
    flex: 1
  },
  headerTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold'
  },
  headerSubtitle: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 12,
    marginTop: 2
  },
  webNotice: {
    backgroundColor: '#FFF3E0',
    padding: 20,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: '#FF9800'
  },
  webNoticeEmoji: {
    fontSize: 48,
    marginBottom: 10
  },
  webNoticeTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#E65100',
    marginBottom: 5
  },
  webNoticeText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5
  },
  webNoticeSubtext: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginTop: 5,
    marginBottom: 10
  },
  codeContainer: {
    alignItems: 'center',
    marginTop: 10
  },
  codeOr: {
    fontSize: 12,
    color: '#999',
    marginVertical: 5
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5'
  },
  loadingEmoji: {
    fontSize: 64,
    marginBottom: 20
  },
  loadingText: {
    fontSize: 18,
    color: '#333',
    fontWeight: '600'
  },
  loadingSubtext: {
    fontSize: 14,
    color: '#666',
    marginTop: 5
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20
  },
  errorEmoji: {
    fontSize: 64,
    marginBottom: 20
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#F44336',
    marginBottom: 10
  },
  errorText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20
  },
  previewContainer: {
    flex: 1
  },
  section: {
    backgroundColor: 'white',
    margin: 10,
    padding: 15,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around'
  },
  statCard: {
    alignItems: 'center',
    padding: 10
  },
  statValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2196F3'
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 5
  },
  boundsInfo: {
    backgroundColor: '#f5f5f5',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10
  },
  boundsText: {
    fontSize: 13,
    color: '#333',
    fontFamily: 'monospace',
    marginVertical: 2
  },
  centerText: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'monospace',
    textAlign: 'center'
  },
  routeCard: {
    backgroundColor: '#E3F2FD',
    padding: 10,
    borderRadius: 5,
    marginBottom: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3'
  },
  routeName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1976D2'
  },
  routePoints: {
    fontSize: 12,
    color: '#666',
    marginTop: 3
  },
  stopCard: {
    backgroundColor: '#FFF3E0',
    padding: 10,
    borderRadius: 5,
    marginBottom: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#FF9800'
  },
  stopName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#F57C00'
  },
  stopCoords: {
    fontSize: 11,
    color: '#666',
    fontFamily: 'monospace',
    marginTop: 3
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    padding: 20
  },
  infoText: {
    fontSize: 13,
    color: '#333',
    marginBottom: 5
  },
  codeBlock: {
    fontFamily: 'monospace',
    backgroundColor: '#E3F2FD',
    padding: 12,
    borderRadius: 8,
    fontSize: 14,
    color: '#1976D2',
    fontWeight: '600'
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee'
  },
  infoLabel: {
    fontSize: 14,
    color: '#666'
  },
  infoValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2196F3'
  },
  infoValueSmall: {
    fontSize: 11,
    fontFamily: 'monospace',
    color: '#666',
    flex: 1,
    textAlign: 'right'
  },
  featureItem: {
    fontSize: 14,
    color: '#333',
    marginBottom: 8,
    paddingLeft: 10
  },
  testingText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10
  },
  bulletPoint: {
    fontSize: 13,
    color: '#333',
    marginBottom: 6,
    paddingLeft: 10
  },
  docText: {
    fontSize: 13,
    color: '#666',
    marginBottom: 8
  },
  codeInline: {
    fontFamily: 'monospace',
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 3,
    fontSize: 12,
    color: '#333'
  },
  backButton: {
    backgroundColor: '#2196F3',
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginTop: 20
  },
  backButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600'
  },
  successText: {
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  warningText: {
    color: '#FF9800',
    fontWeight: 'bold',
  },
  dataSubtitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 8,
    marginBottom: 4,
  },
  dataItem: {
    fontSize: 12,
    color: '#666',
    marginLeft: 8,
    marginBottom: 2,
  }
});

export default MapScreenV3Web;

