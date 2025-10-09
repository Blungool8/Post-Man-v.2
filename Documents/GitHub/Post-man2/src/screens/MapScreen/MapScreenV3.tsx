/**
 * MapScreenV3 - Schermata mappa conforme a PRD v3
 * Milestone M2 - Integrazione completa
 * 
 * Regole PRD v3 implementate:
 * - Rendering polyline dal KML unico (T20)
 * - Marker GPS-driven: visibili solo con GPS ON e entro 200m (T21)
 * - Toggle "Mostra solo la mia posizione" (T22)
 * - Camera Fit automatico su bounds KML (T23)
 * - Cleanup quando si cambia zona (T24)
 */

import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Switch } from 'react-native';
import MapView from 'react-native-maps';
import RouteRenderer from '../../components/Map/RouteRenderer';
import CustomStopMarker from '../../components/Map/CustomStopMarker';
import LocationPermissionHandler from '../../components/LocationPermissionHandler';
import GPSStatusIndicator from '../../components/GPSStatusIndicator';
import { useZoneData } from '../../hooks/useZoneData';
import { useGPSDrivenMarkers } from '../../hooks/useGPSDrivenMarkers';
import { useMapCamera } from '../../hooks/useMapCamera';

interface MapScreenV3Props {
  zoneId: number;
  zonePart: 'A' | 'B';
  onBack?: () => void;
}

const MapScreenV3: React.FC<MapScreenV3Props> = ({ zoneId, zonePart, onBack }) => {
  console.log(`[MapScreenV3] RENDER - zoneId: ${zoneId}, zonePart: ${zonePart}`);
  
  // State locale
  const [userLocation, setUserLocation] = useState<any>(null);
  const [showOnlyMyPosition, setShowOnlyMyPosition] = useState(false);

  // Hooks per gestione zona (T24: gating & cleanup)
  const {
    routes,
    stops,
    bounds,
    centerCoordinates,
    metadata,
    isLoading,
    error,
    loadZone,
    cleanupZone,
    hasZoneLoaded
  } = useZoneData();

  // Hook per camera (T22/T23: fit bounds)
  const { mapRef, fitToZone, centerOnUser } = useMapCamera();

  // Hook per marker GPS-driven (T21: visibili solo con GPS ON e entro 200m)
  const { visibleMarkers, nearestMarker, isGPSEnabled } = useGPSDrivenMarkers(
    stops,
    userLocation,
    {
      nearbyRadius: 200, // 200m come da PRD
      showOnlyMyPosition
    }
  );

  // Carica zona all'apertura
  useEffect(() => {
    console.log(`[MapScreenV3] Montaggio per Zona ${zoneId} - ${zonePart}`);
    loadZone(zoneId, zonePart);

    // Cleanup quando componente smontato o zona cambia (T24)
    return () => {
      console.log(`[MapScreenV3] Smontaggio: CLEANUP Zona ${zoneId} - ${zonePart}`);
      cleanupZone();
    };
  }, [zoneId, zonePart]); // Ricarica SOLO se zona/parte cambiano

  // Log dei dati caricati
  useEffect(() => {
    console.log(`[MapScreenV3] Dati caricati - Routes: ${routes?.length || 0}, Stops: ${stops?.length || 0}, Bounds:`, bounds);
    if (error) {
      console.error(`[MapScreenV3] Errore caricamento:`, error);
    }
  }, [routes, stops, bounds, error]);

  // Log quando il componente viene montato
  useEffect(() => {
    console.log(`[MapScreenV3] Componente montato - zoneId: ${zoneId}, zonePart: ${zonePart}`);
    console.log(`[MapScreenV3] Stato iniziale - isLoading: ${isLoading}, error: ${error}`);
  }, []);

  // Log quando cambia lo stato di loading
  useEffect(() => {
    console.log(`[MapScreenV3] Stato loading cambiato: ${isLoading}`);
  }, [isLoading]);

  // Log quando cambia l'errore
  useEffect(() => {
    if (error) {
      console.error(`[MapScreenV3] Errore cambiato:`, error);
    }
  }, [error]);

  // Fit camera quando bounds disponibili (T23)
  useEffect(() => {
    if (bounds && hasZoneLoaded) {
      console.log('[MapScreenV3] Bounds disponibili, fitting camera...');
      // Aspetta un tick per assicurarsi che MapView sia pronta
      setTimeout(() => {
        fitToZone(bounds, centerCoordinates, true);
      }, 500);
    }
  }, [bounds, hasZoneLoaded]);

  // Handler GPS update
  const handleLocationUpdate = (location: any) => {
    setUserLocation(location);
  };

  // Toggle "Mostra solo la mia posizione" (T22)
  const toggleShowOnlyMyPosition = () => {
    setShowOnlyMyPosition(prev => !prev);
    console.log(`[MapScreenV3] Toggle "Mostra solo posizione": ${!showOnlyMyPosition}`);
  };

  // Regione di default (fallback se bounds non disponibili)
  const defaultRegion = centerCoordinates
    ? {
        latitude: centerCoordinates.latitude,
        longitude: centerCoordinates.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05
      }
    : {
        latitude: 45.0526,
        longitude: 9.6934,
        latitudeDelta: 0.1,
        longitudeDelta: 0.1
      };

  if (isLoading) {
    console.log(`[MapScreenV3] Rendering loading - isLoading: ${isLoading}`);
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>
          Caricamento Zona {zoneId} - Sottozona {zonePart}...
        </Text>
      </View>
    );
  }

  if (error) {
    console.log(`[MapScreenV3] Rendering error: ${error}`);
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorTitle}>❌ Errore Caricamento</Text>
        <Text style={styles.errorText}>{error}</Text>
        {onBack && (
          <TouchableOpacity style={styles.backButton} onPress={onBack}>
            <Text style={styles.backButtonText}>← Torna Indietro</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  // Log prima del render principale
  console.log(`[MapScreenV3] Render principale - isLoading: ${isLoading}, error: ${error}, routes: ${routes?.length || 0}, stops: ${stops?.length || 0}`);
  console.log(`[MapScreenV3] Bounds:`, bounds);
  console.log(`[MapScreenV3] Center:`, centerCoordinates);

  return (
    <LocationPermissionHandler
      onLocationUpdate={handleLocationUpdate}
      onPermissionGranted={() => console.log('[MapScreenV3] GPS permission granted')}
    >
      <View style={styles.container}>
        {/* Mappa principale */}
        <MapView
          ref={mapRef}
          style={styles.map}
          initialRegion={defaultRegion}
          showsUserLocation={true}
          showsMyLocationButton={false}
          showsCompass={true}
          rotateEnabled={false}
          pitchEnabled={false}
          toolbarEnabled={false}
        >
          {/* T20: Rendering polyline dai percorsi KML */}
          <RouteRenderer
            routes={routes}
            strokeWidth={4}
            strokeColor="#2196F3"
            zIndex={1}
          />

          {/* T21: Marker GPS-driven (visibili solo con GPS ON e entro 200m) */}
          {visibleMarkers.map((stop) => (
            <CustomStopMarker
              key={stop.id}
              stop={stop}
              size={1}
              isNearest={nearestMarker?.id === stop.id}
              onPress={() => console.log('[MapScreenV3] Stop pressed:', stop.name)}
            />
          ))}
        </MapView>

        {/* Indicatore GPS */}
        <GPSStatusIndicator
          userLocation={userLocation}
          locationError={null}
          isLocationEnabled={isGPSEnabled}
          isNavigationMode={false}
        />

        {/* T22: Toggle "Mostra solo la mia posizione" */}
        <View style={styles.toggleContainer}>
          <Text style={styles.toggleLabel}>
            Mostra solo la mia posizione
          </Text>
          <Switch
            value={showOnlyMyPosition}
            onValueChange={toggleShowOnlyMyPosition}
            trackColor={{ false: '#767577', true: '#2196F3' }}
            thumbColor={showOnlyMyPosition ? '#FFFFFF' : '#f4f3f4'}
          />
        </View>

        {/* Info zona corrente */}
        <View style={styles.zoneInfoContainer}>
          <Text style={styles.zoneInfoText}>
            📍 Zona {zoneId} - Sottozona {zonePart}
          </Text>
          {metadata && (
            <Text style={styles.zoneInfoSubtext}>
              {metadata.documentName}
            </Text>
          )}
          <Text style={styles.routeInfoText}>
            🛣️ {routes.length} percorsi • 📌 {stops.length} fermate
          </Text>
        </View>

        {/* Controlli camera */}
        <View style={styles.cameraControls}>
          {/* Centra su bounds KML */}
          {bounds && (
            <TouchableOpacity
              style={styles.cameraButton}
              onPress={() => fitToZone(bounds, centerCoordinates, true)}
            >
              <Text style={styles.cameraButtonText}>🗺️</Text>
            </TouchableOpacity>
          )}

          {/* Centra su utente */}
          {userLocation && (
            <TouchableOpacity
              style={styles.cameraButton}
              onPress={() => centerOnUser(userLocation, true)}
            >
              <Text style={styles.cameraButtonText}>📍</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Info marker visibili (debug GPS-driven) */}
        {isGPSEnabled && (
          <View style={styles.markerInfoContainer}>
            <Text style={styles.markerInfoText}>
              Marker visibili: {visibleMarkers.length}/{stops.length}
              {nearestMarker && ` (più vicino: ${Math.round(nearestMarker.distance)}m)`}
            </Text>
          </View>
        )}

        {/* Pulsante indietro */}
        {onBack && (
          <TouchableOpacity style={styles.backButton} onPress={onBack}>
            <Text style={styles.backButtonText}>← Indietro</Text>
          </TouchableOpacity>
        )}
      </View>
    </LocationPermissionHandler>
  );
};

MapScreenV3.displayName = 'MapScreenV3';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff'
  },
  map: {
    flex: 1
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5'
  },
  loadingText: {
    fontSize: 16,
    color: '#666'
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20
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
  toggleContainer: {
    position: 'absolute',
    top: 60,
    right: 10,
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5
  },
  toggleLabel: {
    fontSize: 12,
    marginRight: 8,
    color: '#333'
  },
  zoneInfoContainer: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 8,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5
  },
  zoneInfoText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2196F3'
  },
  zoneInfoSubtext: {
    fontSize: 11,
    color: '#666',
    marginTop: 2
  },
  routeInfoText: {
    fontSize: 11,
    color: '#666',
    marginTop: 4
  },
  cameraControls: {
    position: 'absolute',
    bottom: 100,
    right: 10,
    gap: 10
  },
  cameraButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5
  },
  cameraButtonText: {
    fontSize: 24
  },
  markerInfoContainer: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    right: 10,
    backgroundColor: 'rgba(33, 150, 243, 0.9)',
    borderRadius: 8,
    padding: 10
  },
  markerInfoText: {
    fontSize: 12,
    color: 'white',
    textAlign: 'center',
    fontWeight: '600'
  },
  backButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'white',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5
  },
  backButtonText: {
    fontSize: 14,
    color: '#2196F3',
    fontWeight: '600'
  }
});

export default MapScreenV3;

