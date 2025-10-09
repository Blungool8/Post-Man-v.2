import React, { useState, useCallback } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Alert } from 'react-native';
import MapView from 'react-native-maps';
import { useDynamicNavigation, useNavigationMode } from '../../hooks/useDynamicNavigation';
import CustomStopMarker from '../../components/Map/CustomStopMarker';
import LocationPermissionHandler from '../../components/LocationPermissionHandler';
import GPSStatusIndicator from '../../components/GPSStatusIndicator';
import { MapConfig, simplifiedMapStyle, RegionConfig } from '../../services/MapService/MapConfig';

const MapScreen = ({ route }) => {
  const stops = route.params?.stops || [];
  const { 
    userLocation, 
    optimizedMarkers, 
    nearestStop, 
    directionToNearest,
    locationError,
    isLocationEnabled,
    handleLocationUpdate,
    handleLocationError
  } = useDynamicNavigation(stops);
  const { isNavigationMode, isFullscreen, toggleNavigationMode } = useNavigationMode();
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
    // TODO: Implementare logica completamento fermata
    console.log('Completando fermata:', stop.id);
  }, []);

  const getDirectionArrow = (bearing) => {
    if (!bearing) return '?';
    
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    const index = Math.round(bearing / 45) % 8;
    return directions[index];
  };

  return (
    <LocationPermissionHandler
      onLocationUpdate={handleLocationUpdate}
      onPermissionGranted={() => console.log('Location permission granted')}
    >
      <View style={[styles.container, isFullscreen && styles.fullscreenContainer]}>
        <MapView
          provider={MapConfig.provider}
          style={styles.map}
          customMapStyle={simplifiedMapStyle}
          showsUserLocation={true}
          followsUserLocation={isNavigationMode}
          rotateEnabled={false}
          cacheEnabled={true}
          maxZoomLevel={MapConfig.performance.maxZoomLevel}
          minZoomLevel={MapConfig.performance.minZoomLevel}
          region={userLocation ? {
            latitude: userLocation.coords.latitude,
            longitude: userLocation.coords.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          } : RegionConfig.defaultRegion}
        >
          {optimizedMarkers.map(marker => (
            <CustomStopMarker
              key={marker.id}
              stop={marker}
              size={marker.size}
              isNearest={nearestStop?.id === marker.id}
              onPress={() => handleStopPress(marker)}
            />
          ))}
        </MapView>
      
      {/* Indicatore stato GPS */}
      <GPSStatusIndicator
        userLocation={userLocation}
        locationError={locationError}
        isLocationEnabled={isLocationEnabled}
        isNavigationMode={isNavigationMode}
      />

      {/* Floating Action Button per modalità navigazione */}
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

      {/* Status Bar con informazioni navigazione */}
      {isNavigationMode && nearestStop && (
        <View style={styles.statusBar}>
          <View style={styles.statusContent}>
            <Text style={styles.statusTitle}>Prossima Fermata</Text>
            <Text style={styles.statusStopName}>{nearestStop.name}</Text>
            <View style={styles.statusDetails}>
              <Text style={styles.statusDistance}>
                {nearestStop.distance < 1000 
                  ? `${Math.round(nearestStop.distance)}m` 
                  : `${(nearestStop.distance / 1000).toFixed(1)}km`
                }
              </Text>
              <Text style={styles.statusDirection}>
                {getDirectionArrow(directionToNearest)} {directionToNearest?.toFixed(0)}°
              </Text>
            </View>
          </View>
        </View>
      )}

      {/* Pannello informazioni fermata selezionata */}
      {selectedStop && !isFullscreen && (
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
    </LocationPermissionHandler>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  fullscreenContainer: {
    backgroundColor: '#000000',
  },
  map: {
    flex: 1,
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
  statusContent: {
    alignItems: 'center',
  },
  statusTitle: {
    fontSize: 12,
    color: '#666666',
    marginBottom: 5,
  },
  statusStopName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 8,
    textAlign: 'center',
  },
  statusDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  statusDistance: {
    fontSize: 14,
    color: '#FFD800',
    fontWeight: 'bold',
  },
  statusDirection: {
    fontSize: 14,
    color: '#333333',
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

export default MapScreen;
