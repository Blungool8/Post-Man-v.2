/**
 * MapScreenV3Enhanced - Versione migliorata con routing su strada e database
 * 
 * Novità:
 * - Percorsi seguono strade reali (OpenRouteService)
 * - Marker dinamici basati su distanza GPS
 * - Integrazione database Supabase
 * - Salvataggio/caricamento percorsi
 */

import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Switch, ActivityIndicator, ScrollView } from 'react-native';
import MapView, { Polyline } from 'react-native-maps';
import DynamicStopMarker from '../../components/Map/DynamicStopMarker';
import LocationPermissionHandler from '../../components/LocationPermissionHandler';
import GPSStatusIndicator from '../../components/GPSStatusIndicator';
import { useZoneData } from '../../hooks/useZoneData';
import { useMapCamera } from '../../hooks/useMapCamera';
import { useRoadRouting } from '../../hooks/useRoadRouting';
import { useSupabaseRoutes } from '../../hooks/useSupabaseRoutes';
import config from '../../config/env';

interface MapScreenV3EnhancedProps {
  zoneId: number;
  zonePart: 'A' | 'B';
  onBack?: () => void;
}

const MapScreenV3Enhanced: React.FC<MapScreenV3EnhancedProps> = ({ zoneId, zonePart, onBack }) => {
  console.log(`[MapScreenV3Enhanced] RENDER - zoneId: ${zoneId}, zonePart: ${zonePart}`);
  
  // State locale
  const [userLocation, setUserLocation] = useState<any>(null);
  const [showOnlyMyPosition, setShowOnlyMyPosition] = useState(false);
  const [useRoadRoutes, setUseRoadRoutes] = useState(true);
  const [selectedRoute, setSelectedRoute] = useState<string | null>(null);
  const [showSavedRoutes, setShowSavedRoutes] = useState(false);

  // Hooks per gestione zona
  const {
    routes,
    stops,
    bounds,
    centerCoordinates,
    metadata,
    isLoading: isLoadingZone,
    error: zoneError,
    loadZone,
    cleanupZone,
    hasZoneLoaded
  } = useZoneData();

  // Hook per camera
  const { mapRef, fitToZone, centerOnUser } = useMapCamera();

  // Hook per routing su strada
  const {
    routedCoordinates,
    isLoading: isLoadingRoute,
    error: routingError,
    calculateRoadRoute,
    clearRoute
  } = useRoadRouting();

  // Hook per database Supabase
  const {
    routes: savedRoutes,
    isLoading: isLoadingDB,
    error: dbError,
    isAuthenticated,
    refreshRoutes,
    saveRoute: saveRouteDB,
    deleteRoute: deleteRouteDB
  } = useSupabaseRoutes();

  // Carica zona all'apertura
  useEffect(() => {
    console.log(`[MapScreenV3Enhanced] Montaggio per Zona ${zoneId} - ${zonePart}`);
    loadZone(zoneId, zonePart);

    return () => {
      console.log(`[MapScreenV3Enhanced] Smontaggio: CLEANUP Zona ${zoneId} - ${zonePart}`);
      cleanupZone();
      clearRoute();
    };
  }, [zoneId, zonePart]);

  // Calcola percorso su strada quando routes cambiano
  useEffect(() => {
    if (routes && routes.length > 0 && useRoadRoutes) {
      console.log('[MapScreenV3Enhanced] Calcolo percorso su strada...');
      
      // Prendi il primo percorso e calcola routing
      const firstRoute = routes[0];
      if (firstRoute && firstRoute.coordinates && firstRoute.coordinates.length > 0) {
        calculateRoadRoute(firstRoute.coordinates);
      }
    } else {
      clearRoute();
    }
  }, [routes, useRoadRoutes]);

  // Fit camera quando bounds disponibili
  useEffect(() => {
    if (bounds && hasZoneLoaded) {
      console.log('[MapScreenV3Enhanced] Bounds disponibili, fitting camera...');
      setTimeout(() => {
        fitToZone(bounds, centerCoordinates, true);
      }, 500);
    }
  }, [bounds, hasZoneLoaded]);

  // Handler GPS update
  const handleLocationUpdate = (location: any) => {
    setUserLocation(location);
  };

  // Toggle routing mode
  const toggleRoadRoutes = () => {
    setUseRoadRoutes(prev => !prev);
    console.log(`[MapScreenV3Enhanced] Routing mode: ${!useRoadRoutes ? 'STRADA' : 'LINEA RETTA'}`);
  };

  // Toggle "Mostra solo la mia posizione"
  const toggleShowOnlyMyPosition = () => {
    setShowOnlyMyPosition(prev => !prev);
    console.log(`[MapScreenV3Enhanced] Toggle "Mostra solo posizione": ${!showOnlyMyPosition}`);
  };

  // Salva percorso corrente
  const handleSaveRoute = async () => {
    if (!routes || routes.length === 0 || !stops) {
      alert('Nessun percorso da salvare');
      return;
    }

    if (!isAuthenticated) {
      alert('Devi effettuare il login per salvare percorsi');
      return;
    }

    try {
      const name = `Zona ${zoneId} - ${zonePart}`;
      const description = metadata?.documentName || '';
      await saveRouteDB(name, routes[0], stops, description);
      alert('✅ Percorso salvato!');
    } catch (error) {
      alert(`❌ Errore salvataggio: ${error instanceof Error ? error.message : 'Errore sconosciuto'}`);
    }
  };

  // Filtra marker visibili (GPS-driven)
  const visibleStops = showOnlyMyPosition && userLocation
    ? stops.filter(stop => {
        const distance = calculateDistance(
          userLocation.coords.latitude,
          userLocation.coords.longitude,
          stop.latitude,
          stop.longitude
        );
        return distance <= 200; // 200m radius
      })
    : stops;

  // Regione di default
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

  // Loading state
  if (isLoadingZone) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={styles.loadingText}>
          Caricamento Zona {zoneId} - Sottozona {zonePart}...
        </Text>
      </View>
    );
  }

  // Error state
  if (zoneError) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorTitle}>❌ Errore Caricamento</Text>
        <Text style={styles.errorText}>{zoneError}</Text>
        {onBack && (
          <TouchableOpacity style={styles.backButton} onPress={onBack}>
            <Text style={styles.backButtonText}>← Torna Indietro</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  // Coordinate da visualizzare (routed o originali)
  const displayCoordinates = useRoadRoutes && routedCoordinates 
    ? routedCoordinates 
    : routes?.[0]?.coordinates || [];

  return (
    <LocationPermissionHandler
      onLocationUpdate={handleLocationUpdate}
      onPermissionGranted={() => console.log('[MapScreenV3Enhanced] GPS permission granted')}
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
          {/* Polyline percorso */}
          {displayCoordinates.length > 0 && (
            <Polyline
              coordinates={displayCoordinates}
              strokeWidth={4}
              strokeColor={useRoadRoutes ? "#2196F3" : "#FF9800"}
              lineCap="round"
              lineJoin="round"
              zIndex={1}
            />
          )}

          {/* Marker dinamici GPS-driven */}
          {visibleStops.map((stop) => (
            <DynamicStopMarker
              key={stop.id}
              stop={stop}
              userLocation={userLocation?.coords || null}
              baseSize={config.markerBaseSize}
              maxScale={config.markerMaxScale}
              minScale={config.markerMinScale}
              maxDistance={config.markerMaxDistance}
              onPress={() => console.log('[MapScreenV3Enhanced] Stop pressed:', stop.name)}
            />
          ))}
        </MapView>

        {/* Indicatore GPS */}
        <GPSStatusIndicator
          userLocation={userLocation}
          locationError={null}
          isLocationEnabled={!!userLocation}
          isNavigationMode={false}
        />

        {/* Pannello controlli */}
        <View style={styles.controlPanel}>
          {/* Info zona */}
          <View style={styles.zoneInfo}>
            <Text style={styles.zoneTitle}>
              📍 Zona {zoneId} - Sottozona {zonePart}
            </Text>
            {metadata && (
              <Text style={styles.zoneSubtitle}>
                {metadata.documentName}
              </Text>
            )}
            <Text style={styles.statsText}>
              🛣️ {routes.length} percorsi • 📌 {stops.length} fermate
            </Text>
          </View>

          {/* Controlli routing */}
          <View style={styles.controlRow}>
            <Text style={styles.controlLabel}>Percorsi su strada</Text>
            <Switch
              value={useRoadRoutes}
              onValueChange={toggleRoadRoutes}
              trackColor={{ false: '#767577', true: '#3B82F6' }}
              thumbColor={useRoadRoutes ? '#FFFFFF' : '#f4f3f4'}
            />
          </View>

          {isLoadingRoute && (
            <View style={styles.routingStatusContainer}>
              <ActivityIndicator size="small" color="#3B82F6" />
              <Text style={styles.routingStatusText}>Calcolo percorso su strada...</Text>
            </View>
          )}

          {routingError && (
            <Text style={styles.errorBadge}>⚠️ {routingError}</Text>
          )}

          {/* Controllo mostra solo posizione */}
          <View style={styles.controlRow}>
            <Text style={styles.controlLabel}>Solo marker vicini</Text>
            <Switch
              value={showOnlyMyPosition}
              onValueChange={toggleShowOnlyMyPosition}
              trackColor={{ false: '#767577', true: '#3B82F6' }}
              thumbColor={showOnlyMyPosition ? '#FFFFFF' : '#f4f3f4'}
            />
          </View>

          {/* Info marker visibili */}
          <Text style={styles.infoText}>
            Marker visibili: {visibleStops.length}/{stops.length}
          </Text>

          {/* Pulsante salva percorso */}
          <TouchableOpacity 
            style={[styles.saveButton, !isAuthenticated && styles.saveButtonDisabled]}
            onPress={handleSaveRoute}
            disabled={!isAuthenticated}
          >
            <Text style={styles.saveButtonText}>
              {isAuthenticated ? '💾 Salva Percorso' : '🔒 Login richiesto'}
            </Text>
          </TouchableOpacity>

          {/* Database status */}
          {isAuthenticated && (
            <Text style={styles.dbStatusText}>
              ✅ Database connesso • {savedRoutes.length} percorsi salvati
            </Text>
          )}
          {dbError && (
            <Text style={styles.errorBadge}>⚠️ DB: {dbError}</Text>
          )}
        </View>

        {/* Controlli camera */}
        <View style={styles.cameraControls}>
          {bounds && (
            <TouchableOpacity
              style={styles.cameraButton}
              onPress={() => fitToZone(bounds, centerCoordinates, true)}
            >
              <Text style={styles.cameraButtonIcon}>🗺️</Text>
            </TouchableOpacity>
          )}

          {userLocation && (
            <TouchableOpacity
              style={styles.cameraButton}
              onPress={() => centerOnUser(userLocation, true)}
            >
              <Text style={styles.cameraButtonIcon}>📍</Text>
            </TouchableOpacity>
          )}
        </View>

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

// Utility: Calcola distanza tra due coordinate
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3;
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

MapScreenV3Enhanced.displayName = 'MapScreenV3Enhanced';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB'
  },
  map: {
    flex: 1
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB'
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500'
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    padding: 24
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#DC2626',
    marginBottom: 8
  },
  errorText: {
    fontSize: 14,
    color: '#991B1B',
    textAlign: 'center',
    marginBottom: 16
  },
  controlPanel: {
    position: 'absolute',
    top: 60,
    left: 16,
    right: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4
  },
  zoneInfo: {
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB'
  },
  zoneTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4
  },
  zoneSubtitle: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4
  },
  statsText: {
    fontSize: 12,
    color: '#6B7280'
  },
  controlRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },
  controlLabel: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500'
  },
  routingStatusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    backgroundColor: '#EFF6FF',
    borderRadius: 8,
    marginBottom: 8
  },
  routingStatusText: {
    marginLeft: 8,
    fontSize: 12,
    color: '#3B82F6'
  },
  infoText: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 8
  },
  saveButton: {
    backgroundColor: '#3B82F6',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8
  },
  saveButtonDisabled: {
    backgroundColor: '#9CA3AF'
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600'
  },
  dbStatusText: {
    fontSize: 11,
    color: '#059669',
    marginTop: 8,
    textAlign: 'center'
  },
  errorBadge: {
    fontSize: 11,
    color: '#DC2626',
    backgroundColor: '#FEE2E2',
    padding: 6,
    borderRadius: 6,
    marginBottom: 8,
    textAlign: 'center'
  },
  cameraControls: {
    position: 'absolute',
    right: 16,
    bottom: 120,
    gap: 12
  },
  cameraButton: {
    width: 48,
    height: 48,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  cameraButtonIcon: {
    fontSize: 24
  },
  backButton: {
    position: 'absolute',
    top: 16,
    left: 16,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2
  },
  backButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3B82F6'
  }
});

export default MapScreenV3Enhanced;

