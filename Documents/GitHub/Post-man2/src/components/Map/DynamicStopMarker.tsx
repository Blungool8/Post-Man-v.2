/**
 * DynamicStopMarker - Marker per fermate che si ingrandisce/rimpicciolisce
 * in base alla distanza dalla posizione GPS dell'utente
 * 
 * Funzionalità:
 * - Scala dimensione in base a distanza
 * - Animazione smooth
 * - Design minimal e pulito
 */

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Marker } from 'react-native-maps';
import { Stop } from '../../services/KMLService/KMLParser';

interface DynamicStopMarkerProps {
  stop: Stop;
  userLocation: { latitude: number; longitude: number } | null;
  baseSize?: number; // dimensione base in pixel (default 30)
  maxScale?: number; // scala massima quando vicinissimo (default 2.5)
  minScale?: number; // scala minima quando lontano (default 0.5)
  maxDistance?: number; // distanza massima per scala minima in metri (default 500)
  onPress?: () => void;
}

const DynamicStopMarker: React.FC<DynamicStopMarkerProps> = ({
  stop,
  userLocation,
  baseSize = 30,
  maxScale = 2.5,
  minScale = 0.5,
  maxDistance = 500,
  onPress
}) => {
  const [scale] = useState(new Animated.Value(1));
  const [distance, setDistance] = useState<number | null>(null);
  const [currentScale, setCurrentScale] = useState<number>(1);

  useEffect(() => {
    if (!userLocation) {
      // Se non c'è posizione GPS, usa scala base
      Animated.spring(scale, {
        toValue: 1,
        useNativeDriver: true,
        friction: 5
      }).start();
      return;
    }

    // Calcola distanza dall'utente
    const dist = calculateDistance(
      userLocation.latitude,
      userLocation.longitude,
      stop.latitude,
      stop.longitude
    );
    
    setDistance(dist);

    // Calcola scala in base a distanza
    // Vicino = grande, lontano = piccolo
    let targetScale: number;
    
    if (dist <= 10) {
      // Vicinissimo (< 10m) = scala massima
      targetScale = maxScale;
    } else if (dist >= maxDistance) {
      // Lontano (> maxDistance) = scala minima
      targetScale = minScale;
    } else {
      // Interpolazione lineare tra minScale e maxScale
      const ratio = 1 - (dist / maxDistance);
      targetScale = minScale + (maxScale - minScale) * ratio;
    }

    // Animazione smooth
    Animated.spring(scale, {
      toValue: targetScale,
      useNativeDriver: true,
      friction: 7,
      tension: 40
    }).start();

    // Aggiorna il valore corrente della scala per il controllo della label
    setCurrentScale(targetScale);

  }, [userLocation, stop.latitude, stop.longitude, maxScale, minScale, maxDistance]);

  return (
    <Marker
      coordinate={{
        latitude: stop.latitude,
        longitude: stop.longitude
      }}
      onPress={onPress}
      tracksViewChanges={false} // Performance optimization
    >
      <Animated.View
        style={[
          styles.markerContainer,
          {
            transform: [{ scale }]
          }
        ]}
      >
        {/* Cerchio esterno */}
        <View style={[styles.markerOuter, { width: baseSize, height: baseSize }]}>
          {/* Cerchio interno */}
          <View style={styles.markerInner} />
        </View>
        
        {/* Label (visibile solo quando abbastanza grande) */}
        {currentScale > 1.2 && (
          <View style={styles.labelContainer}>
            <Text style={styles.labelText} numberOfLines={1}>
              {stop.name}
            </Text>
          </View>
        )}
      </Animated.View>
    </Marker>
  );
};

/**
 * Calcola distanza tra due coordinate (Haversine formula)
 * @returns distanza in metri
 */
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3; // Raggio Terra in metri
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

const styles = StyleSheet.create({
  markerContainer: {
    alignItems: 'center',
    justifyContent: 'center'
  },
  markerOuter: {
    backgroundColor: '#3B82F6', // Blue 500
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
    // Shadow per depth
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5
  },
  markerInner: {
    width: '40%',
    height: '40%',
    backgroundColor: '#FFFFFF',
    borderRadius: 100
  },
  labelContainer: {
    marginTop: 4,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB', // Gray 200
    // Shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2
  },
  labelText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#1F2937', // Gray 800
    textAlign: 'center',
    maxWidth: 120
  }
});

export default DynamicStopMarker;

