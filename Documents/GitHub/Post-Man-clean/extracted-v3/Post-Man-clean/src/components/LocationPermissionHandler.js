import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import * as Location from 'expo-location';

const LocationPermissionHandler = ({ onPermissionGranted, onLocationUpdate, children }) => {
  const [permissionStatus, setPermissionStatus] = useState('checking');
  const [locationError, setLocationError] = useState(null);
  const [isLocationEnabled, setIsLocationEnabled] = useState(false);

  useEffect(() => {
    checkLocationPermission();
  }, []);

  const checkLocationPermission = async () => {
    try {
      const { status } = await Location.getForegroundPermissionsAsync();
      setPermissionStatus(status);
      
      if (status === 'granted') {
        await startLocationTracking();
      } else {
        setPermissionStatus('denied');
      }
    } catch (error) {
      console.error('Error checking location permission:', error);
      setLocationError('Errore nel controllo permessi');
    }
  };

  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      setPermissionStatus(status);
      
      if (status === 'granted') {
        await startLocationTracking();
        onPermissionGranted?.();
      } else {
        Alert.alert(
          'Permessi Richiesti',
          'Per utilizzare l\'app è necessario accedere alla posizione GPS. Abilita i permessi nelle impostazioni.',
          [
            { text: 'Annulla', style: 'cancel' },
            { text: 'Riprova', onPress: checkLocationPermission }
          ]
        );
      }
    } catch (error) {
      console.error('Error requesting location permission:', error);
      setLocationError('Errore nella richiesta permessi');
    }
  };

  const startLocationTracking = async () => {
    try {
      // Verifica se il GPS è abilitato
      const isEnabled = await Location.hasServicesEnabledAsync();
      setIsLocationEnabled(isEnabled);
      
      if (!isEnabled) {
        Alert.alert(
          'GPS Disabilitato',
          'Il GPS è disabilitato. Abilitalo nelle impostazioni per utilizzare l\'app.',
          [
            { text: 'OK', onPress: () => setIsLocationEnabled(false) }
          ]
        );
        return;
      }

      // Avvia il tracking della posizione
      await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.BestForNavigation,
          timeInterval: 1000,
          distanceInterval: 2
        },
        (location) => {
          setLocationError(null);
          onLocationUpdate?.(location);
        }
      );
    } catch (error) {
      console.error('Error starting location tracking:', error);
      setLocationError('Errore nel tracking GPS');
    }
  };

  const renderPermissionUI = () => {
    if (permissionStatus === 'checking') {
      return (
        <View style={styles.permissionContainer}>
          <Text style={styles.permissionText}>Controllo permessi GPS...</Text>
        </View>
      );
    }

    if (permissionStatus === 'denied') {
      return (
        <View style={styles.permissionContainer}>
          <Text style={styles.permissionTitle}>📍 Accesso alla Posizione</Text>
          <Text style={styles.permissionText}>
            Per utilizzare l'app è necessario accedere alla tua posizione GPS.
          </Text>
          <TouchableOpacity 
            style={styles.permissionButton}
            onPress={requestLocationPermission}
          >
            <Text style={styles.permissionButtonText}>Abilita GPS</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (locationError) {
      return (
        <View style={styles.permissionContainer}>
          <Text style={styles.errorTitle}>⚠️ Errore GPS</Text>
          <Text style={styles.errorText}>{locationError}</Text>
          <TouchableOpacity 
            style={styles.permissionButton}
            onPress={checkLocationPermission}
          >
            <Text style={styles.permissionButtonText}>Riprova</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (!isLocationEnabled) {
      return (
        <View style={styles.permissionContainer}>
          <Text style={styles.errorTitle}>📍 GPS Disabilitato</Text>
          <Text style={styles.errorText}>
            Il GPS è disabilitato. Abilitalo nelle impostazioni del dispositivo.
          </Text>
          <TouchableOpacity 
            style={styles.permissionButton}
            onPress={checkLocationPermission}
          >
            <Text style={styles.permissionButtonText}>Verifica GPS</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return null;
  };

  return (
    <View style={styles.container}>
      {children}
      {renderPermissionUI()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  permissionContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  permissionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 10,
    textAlign: 'center',
  },
  permissionText: {
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 24,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#F44336',
    marginBottom: 10,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 24,
  },
  permissionButton: {
    backgroundColor: '#FFD800',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  permissionButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
  },
});

export default LocationPermissionHandler;


