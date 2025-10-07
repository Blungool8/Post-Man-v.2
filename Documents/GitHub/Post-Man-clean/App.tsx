import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { 
  StyleSheet, 
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView, 
  Alert, 
  Modal,
  TextInput,
  Platform,
  Image
} from 'react-native';
import ZoneService from './src/services/ZoneService';
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

// Utilizziamo i dati delle zone dal servizio
const zoneData = ZONE_DATA;

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
  mapImage: string;
  estimatedStops: number;
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
  const [mapLoadError, setMapLoadError] = useState(false);

  const handleSelectZone = () => {
    setShowZoneModal(true);
  };

  const handleZoneSelected = (zone: Zone) => {
    console.log('=== DEBUG handleZoneSelected ===');
    console.log('zone ricevuta:', zone);
    console.log('zone.id:', zone.id);
    console.log('zone.name:', zone.name);
    
    setSelectedZone(zone);
    setShowZoneModal(false);
    
    console.log('selectedZone dopo setState:', zone);
    
    // Mostra modal per selezione A/B invece di Alert
    setShowZonePartModal(true);
  };

  const handleZonePartSelected = (part: 'A' | 'B') => {
    console.log('=== DEBUG handleZonePartSelected ===');
    console.log('part ricevuto:', part);
    console.log('selectedZone prima:', selectedZone);
    console.log('selectedZonePart prima:', selectedZonePart);
    
    setSelectedZonePart(part);
    setShowZonePartModal(false);
    
    console.log('selectedZonePart dopo setState:', part);
    
    // Chiama direttamente la funzione con i parametri
    handleZonePartConfirmedDirect(selectedZone, part);
  };

  const handleZonePartConfirmedDirect = async (zone: Zone | null, part: 'A' | 'B') => {
    console.log('=== DEBUG handleZonePartConfirmedDirect ===');
    console.log('zone ricevuta:', zone);
    console.log('part ricevuta:', part);
    
    if (zone && part) {
      console.log('✅ Condizione if superata, procedo con il caricamento');
      
      // TEST 1: Verifichiamo se il problema è nel ZoneService
      try {
        console.log(`TEST 1: Chiamando ZoneService.loadZoneMap(${zone.id}, ${part})`);
        const zoneMapData = await ZoneService.loadZoneMap(zone.id, part);
        console.log('✅ ZoneService.loadZoneMap SUCCESSO:', zoneMapData);
        
        console.log(`TEST 2: Chiamando ZoneService.getStopsForZone(${zone.id}, ${part})`);
        const zoneStops = await ZoneService.getStopsForZone(zone.id, part);
        console.log('✅ ZoneService.getStopsForZone SUCCESSO:', zoneStops);
        
        console.log('TEST 3: Impostando setShowMap(true)');
        setShowMap(true);
        console.log('✅ setShowMap(true) SUCCESSO');
        
        Alert.alert(
          'Sottozona Selezionata',
          `${zone.name} - Sottozona ${part} caricata!\n\nFermate trovate: ${zoneStops.length}\nComuni serviti: ${zoneMapData.municipalities.join(', ')}\n\nDebug: Zona ID ${zone.id}, Parte ${part}`
        );
        
      } catch (error) {
        console.error('❌ ERRORE nel caricamento:', error);
        console.error('Stack trace:', (error as Error).stack);
        Alert.alert('Errore', `Errore nel caricamento della zona: ${(error as Error).message}`);
      }
    } else {
      console.log('❌ Condizione if NON superata');
      console.log('zone è null/undefined?', !zone);
      console.log('part è null/undefined?', !part);
      Alert.alert('Errore Debug', `Stato non valido:\nZona: ${zone?.id || 'null'}\nParte: ${part || 'null'}`);
    }
  };

  const handleZonePartConfirmed = async () => {
    console.log('=== DEBUG handleZonePartConfirmed ===');
    console.log('selectedZone:', selectedZone);
    console.log('selectedZonePart:', selectedZonePart);
    console.log('selectedZone?.id:', selectedZone?.id);
    console.log('typeof selectedZonePart:', typeof selectedZonePart);
    
    if (selectedZone && selectedZonePart) {
      console.log('✅ Condizione if superata, procedo con il caricamento');
      try {
        console.log(`Caricando zona ${selectedZone.id} - parte ${selectedZonePart}`);
        
        // Carica la mappa della zona selezionata
        const zoneMapData = await ZoneService.loadZoneMap(selectedZone.id, selectedZonePart);
        console.log('ZoneMapData caricata:', zoneMapData);
        
        // Carica le fermate per questa zona
        const zoneStops = await ZoneService.getStopsForZone(selectedZone.id, selectedZonePart);
        console.log('ZoneStops caricate:', zoneStops);
        
        setShowMap(true);
        Alert.alert(
          'Sottozona Selezionata',
          `${selectedZone.name} - Sottozona ${selectedZonePart} caricata!\n\nFermate trovate: ${zoneStops.length}\nComuni serviti: ${zoneMapData.municipalities.join(', ')}\n\nDebug: Zona ID ${selectedZone.id}, Parte ${selectedZonePart}`
        );
      } catch (error) {
        console.error('Errore nel caricamento:', error);
        Alert.alert('Errore', `Errore nel caricamento della zona: ${(error as Error).message}`);
      }
    } else {
      console.log('❌ Condizione if NON superata');
      console.log('selectedZone è null/undefined?', !selectedZone);
      console.log('selectedZonePart è null/undefined?', !selectedZonePart);
      Alert.alert('Errore Debug', `Stato non valido:\nZona: ${selectedZone?.id || 'null'}\nParte: ${selectedZonePart || 'null'}`);
    }
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
      setSelectedStop(null);
      Alert.alert('Fermata Completata', 'Fermata completata con successo!');
    }
  };

  const handleBackToMain = () => {
    setShowMap(false);
    setSelectedZone(null);
    setSelectedZonePart(null);
    setMapLoadError(false);
  };


  if (showMap && selectedZone) {
    return (
      <View style={styles.container}>
        <StatusBar style="auto" />
        
        <View style={styles.mapHeader}>
          <TouchableOpacity style={styles.backButton} onPress={handleBackToMain}>
            <Text style={styles.backButtonText}>← Torna</Text>
          </TouchableOpacity>
          <Text style={styles.mapTitle}>
            {selectedZone.name} - Sottozona {selectedZonePart}
          </Text>
        </View>

        <View style={styles.mapContainer}>
          <Image 
            source={{ uri: selectedZone.mapImage }} 
            style={styles.mapImage}
            resizeMode="contain"
            onError={(error) => {
              console.error('Errore caricamento immagine:', error);
              setMapLoadError(true);
            }}
            onLoad={() => {
              console.log('Immagine mappa caricata con successo');
              setMapLoadError(false);
            }}
          />
          {mapLoadError && (
            <View style={styles.fallbackMapContainer}>
              <View style={styles.fallbackMap}>
                <Text style={styles.fallbackMapText}>🗺️</Text>
                <Text style={styles.fallbackMapTitle}>Mappa Zona</Text>
                <Text style={styles.fallbackMapSubtitle}>{selectedZone.name}</Text>
                <Text style={styles.fallbackMapInfo}>Sottozona {selectedZonePart}</Text>
              </View>
            </View>
          )}
          {mapLoadError && (
            <View style={styles.mapErrorContainer}>
              <Text style={styles.mapErrorText}>⚠️ Errore caricamento mappa</Text>
              <Text style={styles.mapErrorSubtext}>Usando mappa di fallback</Text>
            </View>
          )}
          <View style={styles.mapOverlay}>
            <Text style={styles.mapInfo}>
              🗺️ Mappa {selectedZone.name} - Sottozona {selectedZonePart}
            </Text>
            <Text style={styles.mapDescription}>
              CTD Castel San Giovanni - Via Bellini 17, 29015 PC
            </Text>
            <Text style={styles.mapNote}>
              📍 Funzionalità GPS e ricerca fermate in arrivo
            </Text>
            <Text style={styles.mapDebug}>
              🔧 Debug: URL mappa: {selectedZone.mapImage}
            </Text>
          </View>
        </View>

        <View style={styles.mapActions}>
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionButtonText}>📍 Trova Fermate GPS</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionButtonText}>🗺️ Modalità Offline</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      
      <View style={styles.header}>
        <Text style={styles.title}>🗺️ Post-Man</Text>
        <Text style={styles.subtitle}>Gestione Percorsi Postali</Text>
        <Text style={styles.version}>{CTD_INFO.name}</Text>
        <Text style={styles.address}>{CTD_INFO.address}</Text>
      </View>

      {/* Tasto centrale Seleziona Zona */}
      <View style={styles.centralZoneContainer}>
        <TouchableOpacity style={styles.selectZoneButton} onPress={handleSelectZone}>
          <Text style={styles.selectZoneButtonText}>🎯 Seleziona Zona</Text>
          <Text style={styles.selectZoneSubtext}>Scegli zona 1-25 e parte A/B</Text>
        </TouchableOpacity>
      </View>

      {/* Menu laterale per liste fermate */}
      <View style={styles.sideMenu}>
        <TouchableOpacity 
          style={styles.sideMenuButton} 
          onPress={() => setShowStopListModal(true)}
        >
          <Text style={styles.sideMenuButtonText}>📋 Liste Fermate</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.sideMenuButton} 
          onPress={() => setShowCreateListModal(true)}
        >
          <Text style={styles.sideMenuButtonText}>➕ Crea Lista</Text>
        </TouchableOpacity>
      </View>

      {/* Modal selezione zona */}
      <Modal visible={showZoneModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Seleziona Zona</Text>
            <Text style={styles.modalSubtitle}>{CTD_INFO.name} - Zone 1-{CTD_INFO.totalZones}</Text>
            
            <ScrollView style={styles.zonesList}>
              {zoneData.map(zone => (
                <TouchableOpacity
                  key={zone.id}
                  style={styles.zoneItem}
                  onPress={() => handleZoneSelected(zone)}
                >
                  <Text style={styles.zoneName}>{zone.name}</Text>
                  <Text style={styles.zoneDescription}>{zone.description}</Text>
                  <Text style={styles.zoneArea}>{zone.area}</Text>
                  <Text style={styles.zoneStops}>~{zone.estimatedStops} fermate</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            
            <TouchableOpacity 
              style={styles.modalCloseButton} 
              onPress={() => setShowZoneModal(false)}
            >
              <Text style={styles.modalCloseButtonText}>Chiudi</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal selezione parte zona A/B */}
      <Modal visible={showZonePartModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Seleziona Sottozona</Text>
            <Text style={styles.modalSubtitle}>
              {selectedZone?.name} - Scegli tra Sottozona A e Sottozona B
            </Text>
            
            <View style={styles.zonePartContainer}>
              <TouchableOpacity
                style={styles.zonePartButton}
                onPress={() => {
                  console.log('Cliccato Zona A per zona:', selectedZone?.id);
                  handleZonePartConfirmedDirect(selectedZone, 'A');
                  setShowZonePartModal(false);
                }}
              >
                <Text style={styles.zonePartButtonText}>📍 Zona A</Text>
                <Text style={styles.zonePartButtonSubtext}>
                  {selectedZone ? Math.floor(selectedZone.estimatedStops / 2) : 0} fermate
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.zonePartButton}
                onPress={() => {
                  console.log('Cliccato Zona B per zona:', selectedZone?.id);
                  handleZonePartConfirmedDirect(selectedZone, 'B');
                  setShowZonePartModal(false);
                }}
              >
                <Text style={styles.zonePartButtonText}>📍 Zona B</Text>
                <Text style={styles.zonePartButtonSubtext}>
                  {selectedZone ? Math.ceil(selectedZone.estimatedStops / 2) : 0} fermate
                </Text>
              </TouchableOpacity>
            </View>
            
            <TouchableOpacity 
              style={styles.modalCloseButton} 
              onPress={() => {
                setShowZonePartModal(false);
                setSelectedZone(null);
              }}
            >
              <Text style={styles.modalCloseButtonText}>Annulla</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal liste fermate */}
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
              <Text style={styles.modalCloseButtonText}>Chiudi</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal crea lista */}
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
            
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={styles.modalButton} 
                onPress={handleCreateStopList}
              >
                <Text style={styles.modalButtonText}>Crea</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.modalButton, styles.modalButtonSecondary]} 
                onPress={() => setShowCreateListModal(false)}
              >
                <Text style={styles.modalButtonText}>Annulla</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Visualizzazione lista selezionata */}
      {selectedStopList && (
        <View style={styles.selectedListContainer}>
          <View style={styles.selectedListHeader}>
            <Text style={styles.selectedListTitle}>📋 {selectedStopList.name}</Text>
            <TouchableOpacity onPress={() => setSelectedStopList(null)}>
              <Text style={styles.closeListButton}>✕</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.stopsContainer}>
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

      {/* Dettagli fermata selezionata */}
      {selectedStop && (
        <View style={styles.selectedStopContainer}>
          <Text style={styles.selectedStopTitle}>📍 Fermata Selezionata</Text>
          <Text style={styles.selectedStopName}>{selectedStop.name}</Text>
          <Text style={styles.selectedStopAddress}>{selectedStop.address}</Text>
          {selectedStop.status === 'pending' && (
            <TouchableOpacity
              style={styles.completeButton}
              onPress={() => handleCompleteStop(selectedStop.id)}
            >
              <Text style={styles.completeButtonText}>✅ Completa Fermata</Text>
            </TouchableOpacity>
          )}
        </View>
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
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.9,
    marginBottom: 5,
  },
  version: {
    fontSize: 12,
    color: '#fff',
    opacity: 0.7,
    marginBottom: 2,
  },
  address: {
    fontSize: 10,
    color: '#fff',
    opacity: 0.6,
  },
  centralZoneContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  selectZoneButton: {
    backgroundColor: '#FFD800',
    paddingVertical: 20,
    paddingHorizontal: 40,
    borderRadius: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  selectZoneButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  selectZoneSubtext: {
    fontSize: 14,
    color: '#666',
  },
  sideMenu: {
    position: 'absolute',
    top: 100,
    right: 20,
    gap: 10,
  },
  sideMenuButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  sideMenuButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  zonesList: {
    maxHeight: 400,
  },
  zoneItem: {
    backgroundColor: '#f0f0f0',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  zoneName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  zoneDescription: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
  },
  zoneArea: {
    fontSize: 11,
    color: '#999',
    marginTop: 2,
  },
  zoneStops: {
    fontSize: 10,
    color: '#4CAF50',
    marginTop: 2,
    fontWeight: 'bold',
  },
  zonePartContainer: {
    marginVertical: 20,
  },
  zonePartButton: {
    backgroundColor: '#FFD800',
    padding: 20,
    borderRadius: 12,
    marginBottom: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  zonePartButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  zonePartButtonSubtext: {
    fontSize: 14,
    color: '#666',
  },
  modalCloseButton: {
    backgroundColor: '#2196F3',
    padding: 12,
    borderRadius: 8,
    marginTop: 20,
    alignItems: 'center',
  },
  modalCloseButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  stopListsContainer: {
    maxHeight: 400,
  },
  stopListItem: {
    backgroundColor: '#f0f0f0',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  stopListName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  stopListCount: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
    fontSize: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  modalButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  modalButtonSecondary: {
    backgroundColor: '#f44336',
  },
  modalButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  selectedListContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '60%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  selectedListHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  selectedListTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  closeListButton: {
    fontSize: 20,
    color: '#f44336',
    fontWeight: 'bold',
  },
  stopsContainer: {
    maxHeight: 300,
  },
  stopItem: {
    padding: 15,
    marginBottom: 10,
    borderRadius: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  stopName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  stopAddress: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.9,
    marginBottom: 5,
  },
  stopStatus: {
    fontSize: 12,
    color: '#fff',
    fontWeight: 'bold',
  },
  selectedStopContainer: {
    backgroundColor: '#e0f7fa',
    padding: 20,
    borderRadius: 10,
    margin: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  selectedStopTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007BFF',
    marginBottom: 10,
  },
  selectedStopName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  selectedStopAddress: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 15,
  },
  completeButton: {
    backgroundColor: '#4CAF50',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  completeButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  // Stili per la vista mappa
  mapHeader: {
    backgroundColor: '#2196F3',
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    backgroundColor: '#fff',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 8,
    marginRight: 15,
  },
  backButtonText: {
    color: '#2196F3',
    fontWeight: 'bold',
  },
  mapTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    flex: 1,
  },
  mapContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
  },
  mapImage: {
    width: '90%',
    height: '70%',
    borderRadius: 10,
  },
  mapOverlay: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(255,255,255,0.9)',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  mapInfo: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  mapDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
    textAlign: 'center',
  },
  mapNote: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
  },
  mapDebug: {
    fontSize: 10,
    color: '#666',
    textAlign: 'center',
    marginTop: 5,
    fontStyle: 'italic',
  },
  mapErrorContainer: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -100 }, { translateY: -50 }],
    backgroundColor: 'rgba(244, 67, 54, 0.9)',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  mapErrorText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  mapErrorSubtext: {
    color: '#fff',
    fontSize: 12,
    opacity: 0.8,
  },
  fallbackMapContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fallbackMap: {
    backgroundColor: '#f0f0f0',
    width: '80%',
    height: '60%',
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#ddd',
    borderStyle: 'dashed',
  },
  fallbackMapText: {
    fontSize: 60,
    marginBottom: 10,
  },
  fallbackMapTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  fallbackMapSubtitle: {
    fontSize: 18,
    color: '#2196F3',
    fontWeight: 'bold',
    marginBottom: 5,
  },
  fallbackMapInfo: {
    fontSize: 14,
    color: '#666',
  },
  mapActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 20,
    backgroundColor: '#fff',
  },
  actionButton: {
    backgroundColor: '#2196F3',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
});