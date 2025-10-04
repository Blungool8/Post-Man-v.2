import React, { useState, useCallback, useRef } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Alert } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';

const MapScreenMobile = ({ route }) => {
  const stops = route.params?.stops || [];
  const userLocation = route.params?.userLocation;
  const isNavigationMode = route.params?.isNavigationMode || false;
  const isFullscreen = route.params?.isFullscreen || false;
  const onCompleteStop = route.params?.onCompleteStop;
  const onToggleNavigation = route.params?.onToggleNavigation;
  const nearestStop = route.params?.nearestStop;
  const directionToNearest = route.params?.directionToNearest;
  
  const [selectedStop, setSelectedStop] = useState(null);
  const mapRef = useRef(null);

  // Regione di default per Milano
  const defaultRegion = {
    latitude: 45.4642,
    longitude: 9.1900,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  };

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

  // Centra la mappa sulla fermata più vicina se disponibile
  const centerOnNearestStop = () => {
    if (nearestStop && mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: nearestStop.latitude,
        longitude: nearestStop.longitude,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
      }, 1000);
    }
  };

  return (
    <View style={styles.container}>
      {/* Mappa principale */}
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={defaultRegion}
        showsUserLocation={true}
        showsMyLocationButton={true}
        showsCompass={true}
        showsScale={true}
        mapType="standard"
      >
        {/* Marker per le fermate */}
        {stops.map(stop => (
          <Marker
            key={stop.id}
            coordinate={{
              latitude: stop.latitude,
              longitude: stop.longitude,
            }}
            title={stop.name}
            description={stop.address}
            pinColor={getMarkerColor(stop.status)}
            onPress={() => handleStopPress(stop)}
          >
            <View style={[styles.customMarker, { backgroundColor: getMarkerColor(stop.status) }]}>
              <Text style={styles.markerText}>{getMarkerIcon(stop.status)}</Text>
            </View>
          </Marker>
        ))}

        {/* Marker per la posizione utente se disponibile */}
        {userLocation && (
          <Marker
            coordinate={{
              latitude: userLocation.coords.latitude,
              longitude: userLocation.coords.longitude,
            }}
            title="La tua posizione"
            description="Posizione GPS attuale"
            pinColor="#2196F3"
          >
            <View style={styles.userLocationMarker}>
              <Text style={styles.userLocationText}>📍</Text>
            </View>
          </Marker>
        )}
      </MapView>

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
          <TouchableOpacity 
            style={styles.centerButton}
            onPress={centerOnNearestStop}
          >
            <Text style={styles.centerButtonText}>Centra sulla fermata</Text>
          </TouchableOpacity>
        </View>
      )}

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
  map: {
    flex: 1,
  },
  customMarker: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  markerText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  userLocationMarker: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#2196F3',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  userLocationText: {
    fontSize: 12,
  },
  locationInfo: {
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
    position: 'absolute',
    top: 200,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(76, 175, 80, 0.95)',
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
    marginBottom: 10,
  },
  centerButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 5,
    alignSelf: 'flex-start',
  },
  centerButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
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
});

export default MapScreenMobile;
