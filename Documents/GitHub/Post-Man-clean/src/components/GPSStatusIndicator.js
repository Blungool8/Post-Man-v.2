import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const GPSStatusIndicator = ({ 
  userLocation, 
  locationError, 
  isLocationEnabled,
  isNavigationMode = false 
}) => {
  const getGPSStatus = () => {
    if (locationError) return { status: 'error', text: 'GPS Errore', color: '#F44336' };
    if (!isLocationEnabled) return { status: 'disabled', text: 'GPS Disabilitato', color: '#FF9800' };
    if (!userLocation) return { status: 'searching', text: 'Ricerca GPS...', color: '#FFD800' };
    
    // Calcola qualità segnale basata su accuracy
    const accuracy = userLocation.coords?.accuracy || 0;
    if (accuracy < 5) return { status: 'excellent', text: 'GPS Eccellente', color: '#4CAF50' };
    if (accuracy < 10) return { status: 'good', text: 'GPS Buono', color: '#8BC34A' };
    if (accuracy < 20) return { status: 'fair', text: 'GPS Discreto', color: '#FFD800' };
    return { status: 'poor', text: 'GPS Scadente', color: '#FF9800' };
  };

  const gpsStatus = getGPSStatus();

  if (!isNavigationMode) return null;

  return (
    <View style={[styles.container, { backgroundColor: gpsStatus.color }]}>
      <View style={styles.content}>
        <Text style={styles.statusText}>{gpsStatus.text}</Text>
        {userLocation && (
          <Text style={styles.accuracyText}>
            ±{Math.round(userLocation.coords?.accuracy || 0)}m
          </Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 10,
    right: 10,
    borderRadius: 15,
    paddingHorizontal: 12,
    paddingVertical: 6,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  content: {
    alignItems: 'center',
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  accuracyText: {
    color: '#FFFFFF',
    fontSize: 10,
    opacity: 0.8,
  },
});

export default GPSStatusIndicator;


