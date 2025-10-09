import React, { useState, useCallback } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Alert } from 'react-native';

const MapScreenWeb = ({ route }) => {
  const stops = route.params?.stops || [];
  const userLocation = route.params?.userLocation;
  const isNavigationMode = route.params?.isNavigationMode || false;
  const isFullscreen = route.params?.isFullscreen || false;
  const onCompleteStop = route.params?.onCompleteStop;
  const onToggleNavigation = route.params?.onToggleNavigation;
  const nearestStop = route.params?.nearestStop;
  const directionToNearest = route.params?.directionToNearest;
  
  const [selectedStop, setSelectedStop] = useState(null);

  const handleStopPress = useCallback((stop) => {
    setSelectedStop(stop);
    Alert.alert(
      `Fermata: ${stop.name}`,
      `Indirizzo: ${stop.address || 'N/A'}\nStato: ${stop.status}`,
      [
        { text: 'Chiudi', style: 'cancel' },
        { text: 'Completa', onPress: () => handleCompleteStop(stop) }
      ]
    );
  }, []);

  const handleCompleteStop = useCallback((stop) => {
    console.log('Completando fermata:', stop.id);
    if (onCompleteStop) {
      onCompleteStop(stop.id);
    }
  }, [onCompleteStop]);

  const toggleNavigationMode = () => {
    if (onToggleNavigation) {
      onToggleNavigation();
    }
  };

  const getMarkerColor = (status) => {
    switch (status) {
      case 'completed': return '#4CAF50';
      case 'failed': return '#F44336';
      case 'current': return '#2196F3';
      default: return '#FFD800';
    }
  };

  const getMarkerIcon = (status) => {
    switch (status) {
      case 'completed': return '✓';
      case 'failed': return '✗';
      case 'current': return '●';
      default: return '○';
    }
  };

  return (
    <View style={styles.container}>
      {/* Mappa simulata per web */}
      <View style={styles.mapContainer}>
        <Text style={styles.mapTitle}>🗺️ Mappa Percorsi Postali</Text>
        <Text style={styles.mapSubtitle}>Versione Web - Demo</Text>
        
        {/* Informazioni posizione utente */}
        {userLocation && (
          <View style={styles.locationInfo}>
            <Text style={styles.locationTitle}>📍 Posizione Attuale</Text>
            <Text style={styles.locationText}>
              Lat: {userLocation.coords.latitude.toFixed(6)}
            </Text>
            <Text style={styles.locationText}>
              Lng: {userLocation.coords.longitude.toFixed(6)}
            </Text>
            <Text style={styles.locationText}>
              Precisione: ±{Math.round(userLocation.coords.accuracy)}m
            </Text>
          </View>
        )}

        {/* Fermata più vicina */}
        {nearestStop && (
          <View style={styles.nearestStopInfo}>
            <Text style={styles.nearestStopTitle}>🎯 Prossima Fermata</Text>
            <Text style={styles.nearestStopName}>{nearestStop.name}</Text>
            <Text style={styles.nearestStopDistance}>
              Distanza: {Math.round(nearestStop.distance)}m
            </Text>
            {directionToNearest && (
              <Text style={styles.nearestStopDirection}>
                Direzione: {Math.round(directionToNearest)}°
              </Text>
            )}
          </View>
        )}

        {/* Lista fermate */}
        <View style={styles.stopsList}>
          <Text style={styles.stopsTitle}>Fermate ({stops.length})</Text>
          {stops.map(stop => (
            <TouchableOpacity
              key={stop.id}
              style={[
                styles.stopItem,
                { backgroundColor: getMarkerColor(stop.status) }
              ]}
              onPress={() => handleStopPress(stop)}
            >
              <View style={styles.stopContent}>
                <Text style={styles.stopIcon}>{getMarkerIcon(stop.status)}</Text>
                <View style={styles.stopInfo}>
                  <Text style={styles.stopName}>{stop.name}</Text>
                  <Text style={styles.stopAddress}>{stop.address}</Text>
                  <Text style={styles.stopStatus}>Stato: {stop.status}</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Floating Action Button */}
      <TouchableOpacity
        style={[
          styles.fab,
          isNavigationMode && styles.fabActive
        ]}
        onPress={toggleNavigationMode}
      >
        <Text style={styles.fabText}>
          {isNavigationMode ? '📍' : '🧭'}
        </Text>
      </TouchableOpacity>

      {/* Status Bar */}
      {isNavigationMode && (
        <View style={styles.statusBar}>
          <Text style={styles.statusTitle}>Modalità Navigazione Attiva</Text>
          <Text style={styles.statusText}>
            {stops.filter(s => s.status === 'pending').length} fermate rimanenti
          </Text>
        </View>
      )}

      {/* Stop Info Panel */}
      {selectedStop && !isNavigationMode && (
        <View style={styles.stopInfoPanel}>
          <Text style={styles.stopInfoTitle}>{selectedStop.name}</Text>
          <Text style={styles.stopInfoAddress}>{selectedStop.address}</Text>
          <Text style={styles.stopInfoStatus}>Stato: {selectedStop.status}</Text>
          <TouchableOpacity 
            style={styles.closeButton}
            onPress={() => setSelectedStop(null)}
          >
            <Text style={styles.closeButtonText}>Chiudi</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  mapContainer: {
    flex: 1,
    padding: 20,
  },
  mapTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
    textAlign: 'center',
    marginBottom: 10,
  },
  mapSubtitle: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 30,
  },
  stopsList: {
    flex: 1,
  },
  stopsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 15,
  },
  stopItem: {
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  stopContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
  },
  stopIcon: {
    fontSize: 24,
    marginRight: 15,
    color: '#333333',
  },
  stopInfo: {
    flex: 1,
  },
  stopName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 5,
  },
  stopAddress: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 3,
  },
  stopStatus: {
    fontSize: 12,
    color: '#999999',
  },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FFD800',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  fabActive: {
    backgroundColor: '#4CAF50',
  },
  fabText: {
    fontSize: 24,
  },
  statusBar: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 10,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 5,
    textAlign: 'center',
  },
  statusText: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
  },
  stopInfoPanel: {
    position: 'absolute',
    bottom: 100,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 10,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  stopInfoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 5,
  },
  stopInfoAddress: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 5,
  },
  stopInfoStatus: {
    fontSize: 12,
    color: '#999999',
    marginBottom: 10,
  },
  closeButton: {
    backgroundColor: '#FFD800',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 5,
    alignSelf: 'flex-end',
  },
  closeButtonText: {
    color: '#333333',
    fontWeight: 'bold',
  },
  locationInfo: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  locationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 8,
  },
  locationText: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 3,
  },
  nearestStopInfo: {
    backgroundColor: 'rgba(76, 175, 80, 0.95)',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  nearestStopTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  nearestStopName: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginBottom: 5,
  },
  nearestStopDistance: {
    fontSize: 14,
    color: '#FFFFFF',
    marginBottom: 3,
  },
  nearestStopDirection: {
    fontSize: 14,
    color: '#FFFFFF',
  },
});

export default MapScreenWeb;
