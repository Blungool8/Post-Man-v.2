/**
 * App.web.tsx - Versione web dell'app
 * NESSUNA dipendenza da moduli nativi
 */

import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { 
  StyleSheet, 
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView, 
  Alert, 
  Modal,
  TextInput
} from 'react-native';
import { ZONE_DATA, CTD_INFO } from './src/config/ZoneConfig';

// Dati di esempio per le liste fermate
const exampleStopLists = [
  {
    id: '1',
    name: 'Lista Fermate 1',
    stops: [
      {
        id: '1',
        name: 'Via Torino 15',
        address: 'Via Torino 15, Milano, MI 20123',
        latitude: 45.4642,
        longitude: 9.1900,
        status: 'pending'
      },
      {
        id: '2',
        name: 'Piazza Duomo 1',
        address: 'Piazza Duomo 1, Milano, MI 20121',
        latitude: 45.4641,
        longitude: 9.1919,
        status: 'pending'
      },
      {
        id: '3',
        name: 'Via Brera 28',
        address: 'Via Brera 28, Milano, MI 20121',
        latitude: 45.4719,
        longitude: 9.1881,
        status: 'completed'
      }
    ]
  },
  {
    id: '2',
    name: 'Lista Fermate 2',
    stops: [
      {
        id: '4',
        name: 'Via Roma 45',
        address: 'Via Roma 45, Piacenza, PC 29121',
        latitude: 45.0526,
        longitude: 9.6934,
        status: 'pending'
      },
      {
        id: '5',
        name: 'Piazza Cavalli 12',
        address: 'Piazza Cavalli 12, Piacenza, PC 29121',
        latitude: 45.0526,
        longitude: 9.6934,
        status: 'pending'
      }
    ]
  }
];

// Type definitions
interface Stop {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  status: string;
}

interface StopList {
  id: string;
  name: string;
  stops: Stop[];
}

interface Zone {
  id: number;
  name: string;
  description: string;
  area: string;
  mapImage: string;
  realMapPath: string;
  municipalities: string[];
  estimatedStops: number;
  deliveryDays: string[];
  workingDays: string[];
}

export default function App() {
  const [stopLists, setStopLists] = useState<StopList[]>(exampleStopLists);
  const [selectedStopList, setSelectedStopList] = useState<StopList | null>(null);
  const [selectedStop, setSelectedStop] = useState<Stop | null>(null);
  const [showZoneModal, setShowZoneModal] = useState(false);
  const [showZonePartModal, setShowZonePartModal] = useState(false);
  const [showStopListModal, setShowStopListModal] = useState(false);
  const [showCreateListModal, setShowCreateListModal] = useState(false);
  const [selectedZone, setSelectedZone] = useState<Zone | null>(null);
  const [selectedZonePart, setSelectedZonePart] = useState<'A' | 'B' | null>(null);
  const [showMap, setShowMap] = useState(false);
  const [newListName, setNewListName] = useState('');

  const handleSelectZone = () => {
    setShowZoneModal(true);
  };

  const handleZoneSelected = (zone: Zone) => {
    setSelectedZone(zone);
    setShowZoneModal(false);
    setShowZonePartModal(true);
  };

  const handleZonePartSelected = (part: 'A' | 'B') => {
    setSelectedZonePart(part);
    setShowZonePartModal(false);
    setShowMap(true);
  };

  const handleBackToMain = () => {
    setShowMap(false);
    setSelectedZone(null);
    setSelectedZonePart(null);
  };

  const handleCreateStopList = () => {
    if (newListName.trim()) {
      const newList: StopList = {
        id: Date.now().toString(),
        name: newListName.trim(),
        stops: []
      };
      setStopLists(prev => [...prev, newList]);
      setNewListName('');
      setShowCreateListModal(false);
      Alert.alert('Lista Creata', `Lista "${newList.name}" creata con successo!`);
    }
  };

  const handleCompleteStop = (stopId: string) => {
    if (selectedStopList) {
      setStopLists(prevLists =>
        prevLists.map(list =>
          list.id === selectedStopList.id
            ? {
                ...list,
                stops: list.stops.map(stop =>
                  stop.id === stopId
                    ? { ...stop, status: 'completed' }
                    : stop
                )
              }
            : list
        )
      );
      
      // Aggiorna anche selectedStopList
      const updatedList = stopLists.find(l => l.id === selectedStopList.id);
      if (updatedList) {
        setSelectedStopList({
          ...updatedList,
          stops: updatedList.stops.map(stop =>
            stop.id === stopId
              ? { ...stop, status: 'completed' }
              : stop
          )
        });
      }
      
      setSelectedStop(null);
      Alert.alert('Fermata Completata', 'Fermata completata con successo!');
    }
  };

  // Mostra schermata mappa (versione web semplificata)
  if (showMap && selectedZone && selectedZonePart) {
    return (
      <View style={styles.container}>
        <StatusBar style="auto" />
        
        {/* Header */}
        <View style={styles.mapHeader}>
          <TouchableOpacity style={styles.backButton} onPress={handleBackToMain}>
            <Text style={styles.backButtonText}>← Indietro</Text>
          </TouchableOpacity>
          <Text style={styles.mapHeaderTitle}>
            Zona {selectedZone.id} - Sottozona {selectedZonePart}
          </Text>
        </View>

        {/* Web Notice */}
        <View style={styles.webNotice}>
          <Text style={styles.webNoticeEmoji}>💻</Text>
          <Text style={styles.webNoticeTitle}>Modalità Web - Preview UI</Text>
          <Text style={styles.webNoticeText}>
            Mappa e GPS non disponibili su web
          </Text>
          <Text style={styles.webNoticeSubtext}>
            Per testing completo usa:
          </Text>
          <View style={styles.codeContainer}>
            <Text style={styles.codeBlock}>npm run android</Text>
          </View>
        </View>

        {/* Info */}
        <ScrollView style={styles.content}>
          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>📋 Zona Selezionata</Text>
            <Text style={styles.infoText}>• Zona: {selectedZone.id}</Text>
            <Text style={styles.infoText}>• Nome: {selectedZone.name}</Text>
            <Text style={styles.infoText}>• Sottozona: {selectedZonePart}</Text>
            <Text style={styles.infoText}>
              • File KML: CTD_CastelSanGiovanni_Z{String(selectedZone.id).padStart(2, '0')}_{selectedZonePart}.kml
            </Text>
          </View>

          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>✨ Funzionalità Implementate</Text>
            <Text style={styles.featureText}>✅ KML Loader & Parser (M1)</Text>
            <Text style={styles.featureText}>✅ Polyline Rendering - 14 percorsi (M2)</Text>
            <Text style={styles.featureText}>✅ Marker GPS-driven 200m radius (M2)</Text>
            <Text style={styles.featureText}>✅ Toggle visibilità marker (M2)</Text>
            <Text style={styles.featureText}>✅ Camera Fit automatico (M2)</Text>
            <Text style={styles.featureText}>✅ Cleanup cambio zona (M2)</Text>
          </View>

          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>📱 Test su Mobile</Text>
            <Text style={styles.testText}>
              Su emulatore/device vedrai:
            </Text>
            <Text style={styles.bulletText}>• 🗺️ Mappa con 14 percorsi blu</Text>
            <Text style={styles.bulletText}>• 📍 GPS tracking real-time</Text>
            <Text style={styles.bulletText}>• 🎯 Marker entro 200m</Text>
            <Text style={styles.bulletText}>• 🔘 Controlli visibilità</Text>
          </View>
        </ScrollView>
      </View>
    );
  }

  // Schermata principale
  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      
      <View style={styles.header}>
        <Text style={styles.title}>🗺️ Post-Man</Text>
        <Text style={styles.subtitle}>Gestione Percorsi Postali</Text>
        <Text style={styles.version}>v3.0 Claude AI - Web Preview</Text>
      </View>

      <View style={styles.ctdInfo}>
        <Text style={styles.ctdTitle}>📍 {CTD_INFO.name}</Text>
        <Text style={styles.ctdAddress}>{CTD_INFO.address}</Text>
        <Text style={styles.ctdProvince}>{CTD_INFO.province} - {CTD_INFO.region}</Text>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity 
          style={styles.primaryButton}
          onPress={handleSelectZone}
        >
          <Text style={styles.primaryButtonText}>🗺️ Seleziona Zona</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.secondaryButton}
          onPress={() => setShowStopListModal(true)}
        >
          <Text style={styles.secondaryButtonText}>📋 Gestisci Liste Fermate</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.secondaryButton}
          onPress={() => setShowCreateListModal(true)}
        >
          <Text style={styles.secondaryButtonText}>➕ Crea Nuova Lista</Text>
        </TouchableOpacity>

        <View style={styles.webWarning}>
          <Text style={styles.webWarningText}>
            ⚠️ Limitazioni Web: Mappa e GPS richiedono emulatore/device
          </Text>
        </View>
      </View>

      {/* Modal Selezione Zona */}
      <Modal
        visible={showZoneModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowZoneModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Seleziona Zona</Text>
            
            <ScrollView style={styles.zoneList}>
              {ZONE_DATA.map((zone) => (
                <TouchableOpacity
                  key={zone.id}
                  style={styles.zoneItem}
                  onPress={() => handleZoneSelected(zone)}
                >
                  <Text style={styles.zoneName}>Zona {zone.id}</Text>
                  <Text style={styles.zoneDesc}>{zone.description}</Text>
                  <Text style={styles.zoneArea}>{zone.area}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <TouchableOpacity 
              style={styles.modalCloseButton}
              onPress={() => setShowZoneModal(false)}
            >
              <Text style={styles.modalCloseText}>Chiudi</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal Selezione A/B */}
      <Modal
        visible={showZonePartModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowZonePartModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {selectedZone && `${selectedZone.name}`}
            </Text>
            <Text style={styles.modalSubtitle}>Seleziona Sottozona (Piano)</Text>

            <View style={styles.partButtons}>
              <TouchableOpacity
                style={[styles.partButton, styles.partButtonA]}
                onPress={() => handleZonePartSelected('A')}
              >
                <Text style={styles.partButtonText}>A</Text>
                <Text style={styles.partButtonSubtext}>Piano A</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.partButton, styles.partButtonB]}
                onPress={() => handleZonePartSelected('B')}
              >
                <Text style={styles.partButtonText}>B</Text>
                <Text style={styles.partButtonSubtext}>Piano B</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity 
              style={styles.modalCancelButton}
              onPress={() => {
                setShowZonePartModal(false);
                setSelectedZone(null);
              }}
            >
              <Text style={styles.modalCancelText}>Annulla</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal Liste Fermate */}
      <Modal visible={showStopListModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Liste Fermate</Text>
            
            <ScrollView style={styles.stopListsContainer}>
              {stopLists.map(list => (
                <TouchableOpacity
                  key={list.id}
                  style={styles.stopListItem}
                  onPress={() => {
                    setSelectedStopList(list);
                    setShowStopListModal(false);
                  }}
                >
                  <Text style={styles.stopListName}>{list.name}</Text>
                  <Text style={styles.stopListCount}>
                    {list.stops.length} fermate
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            
            <TouchableOpacity 
              style={styles.modalCloseButton} 
              onPress={() => setShowStopListModal(false)}
            >
              <Text style={styles.modalCloseText}>Chiudi</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal Crea Lista */}
      <Modal visible={showCreateListModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Crea Nuova Lista</Text>
            
            <TextInput
              style={styles.textInput}
              placeholder="Nome lista fermate..."
              value={newListName}
              onChangeText={setNewListName}
            />
            
            <View style={styles.modalButtonsRow}>
              <TouchableOpacity 
                style={styles.modalButton} 
                onPress={handleCreateStopList}
              >
                <Text style={styles.modalButtonText}>Crea</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.modalButton, styles.modalButtonSecondary]} 
                onPress={() => {
                  setShowCreateListModal(false);
                  setNewListName('');
                }}
              >
                <Text style={styles.modalButtonText}>Annulla</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Visualizzazione Lista Selezionata */}
      {selectedStopList && !showMap && (
        <View style={styles.selectedListContainer}>
          <View style={styles.selectedListHeader}>
            <Text style={styles.selectedListTitle}>📋 {selectedStopList.name}</Text>
            <TouchableOpacity onPress={() => setSelectedStopList(null)}>
              <Text style={styles.closeListButton}>✕</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.stopsScrollContainer}>
            {selectedStopList.stops.map(stop => (
              <TouchableOpacity
                key={stop.id}
                style={[
                  styles.stopItem,
                  { backgroundColor: stop.status === 'completed' ? '#4CAF50' : '#FF9800' }
                ]}
                onPress={() => setSelectedStop(stop)}
              >
                <Text style={styles.stopName}>{stop.name}</Text>
                <Text style={styles.stopAddress}>{stop.address}</Text>
                <Text style={styles.stopStatus}>
                  {stop.status === 'completed' ? '✅ Completata' : '⏳ In attesa'}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Dettagli Fermata Selezionata */}
      {selectedStop && (
        <Modal visible={true} animationType="fade" transparent>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Fermata: {selectedStop.name}</Text>
              
              <View style={styles.stopDetails}>
                <Text style={styles.stopDetailText}>📍 {selectedStop.address}</Text>
                <Text style={styles.stopDetailText}>
                  📊 Status: {selectedStop.status === 'completed' ? '✅ Completata' : '⏳ Pendente'}
                </Text>
              </View>
              
              <View style={styles.modalButtonsRow}>
                {selectedStop.status !== 'completed' && (
                  <TouchableOpacity 
                    style={styles.modalButton} 
                    onPress={() => handleCompleteStop(selectedStop.id)}
                  >
                    <Text style={styles.modalButtonText}>✅ Completa</Text>
                  </TouchableOpacity>
                )}
                
                <TouchableOpacity 
                  style={[styles.modalButton, styles.modalButtonSecondary]} 
                  onPress={() => setSelectedStop(null)}
                >
                  <Text style={styles.modalButtonText}>Chiudi</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#2196F3',
    padding: 30,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 5,
  },
  version: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
  },
  ctdInfo: {
    backgroundColor: 'white',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  ctdTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  ctdAddress: {
    fontSize: 13,
    color: '#666',
    marginBottom: 3,
  },
  ctdProvince: {
    fontSize: 12,
    color: '#999',
  },
  actions: {
    padding: 20,
  },
  primaryButton: {
    backgroundColor: '#2196F3',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 15,
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  secondaryButton: {
    backgroundColor: 'white',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#2196F3',
  },
  secondaryButtonText: {
    color: '#2196F3',
    fontSize: 16,
    fontWeight: '600',
  },
  webWarning: {
    backgroundColor: '#FFF3E0',
    padding: 15,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#FF9800',
  },
  webWarningText: {
    fontSize: 13,
    color: '#E65100',
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    width: '90%',
    maxWidth: 500,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },
  zoneList: {
    maxHeight: 400,
  },
  zoneItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  zoneName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2196F3',
  },
  zoneDesc: {
    fontSize: 13,
    color: '#666',
    marginTop: 3,
  },
  zoneArea: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  partButtons: {
    flexDirection: 'row',
    gap: 15,
    marginBottom: 20,
  },
  partButton: {
    flex: 1,
    padding: 30,
    borderRadius: 12,
    alignItems: 'center',
  },
  partButtonA: {
    backgroundColor: '#4CAF50',
  },
  partButtonB: {
    backgroundColor: '#FF9800',
  },
  partButtonText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: 'white',
  },
  partButtonSubtext: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 5,
  },
  modalCloseButton: {
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  modalCloseText: {
    fontSize: 14,
    color: '#666',
  },
  modalCancelButton: {
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalCancelText: {
    fontSize: 14,
    color: '#666',
  },
  // Map Screen Styles
  mapHeader: {
    backgroundColor: '#2196F3',
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    padding: 8,
    marginRight: 10,
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  mapHeaderTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
  },
  webNotice: {
    backgroundColor: '#FFF3E0',
    padding: 20,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: '#FF9800',
  },
  webNoticeEmoji: {
    fontSize: 48,
    marginBottom: 10,
  },
  webNoticeTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#E65100',
    marginBottom: 5,
  },
  webNoticeText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  webNoticeSubtext: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginBottom: 10,
  },
  codeContainer: {
    alignItems: 'center',
  },
  codeBlock: {
    fontFamily: 'monospace',
    backgroundColor: '#E3F2FD',
    padding: 12,
    borderRadius: 8,
    fontSize: 14,
    color: '#1976D2',
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  infoCard: {
    backgroundColor: 'white',
    margin: 15,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  featureText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 8,
    paddingLeft: 10,
  },
  testText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  bulletText: {
    fontSize: 13,
    color: '#333',
    marginBottom: 6,
    paddingLeft: 10,
  },
  // Stop Lists Styles
  stopListsContainer: {
    maxHeight: 300,
    marginBottom: 15,
  },
  stopListItem: {
    padding: 15,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    marginBottom: 10,
  },
  stopListName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2196F3',
    marginBottom: 5,
  },
  stopListCount: {
    fontSize: 13,
    color: '#666',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 20,
  },
  modalButtonsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  modalButton: {
    flex: 1,
    backgroundColor: '#2196F3',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalButtonSecondary: {
    backgroundColor: '#999',
  },
  modalButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  // Selected List Styles
  selectedListContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '60%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 10,
  },
  selectedListHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  selectedListTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  closeListButton: {
    fontSize: 24,
    color: '#999',
    padding: 5,
  },
  stopsScrollContainer: {
    flex: 1,
    padding: 15,
  },
  stopItem: {
    padding: 15,
    borderRadius: 12,
    marginBottom: 12,
  },
  stopName: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    marginBottom: 5,
  },
  stopAddress: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 5,
  },
  stopStatus: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
  },
  // Stop Details Modal
  stopDetails: {
    backgroundColor: '#f5f5f5',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  stopDetailText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
});

