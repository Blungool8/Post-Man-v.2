import React from 'react';
import { View, StyleSheet } from 'react-native';
import MapScreen from '../screens/MapScreen/MapScreen';

// Dati di esempio per testare l'architettura mappa
const exampleStops = [
  {
    id: '1',
    name: 'Via Roma 123',
    address: 'Via Roma 123, Roma, RM 00100',
    latitude: 41.9028,
    longitude: 12.4964,
    status: 'pending'
  },
  {
    id: '2',
    name: 'Piazza Navona 45',
    address: 'Piazza Navona 45, Roma, RM 00186',
    latitude: 41.8992,
    longitude: 12.4730,
    status: 'pending'
  },
  {
    id: '3',
    name: 'Via del Corso 78',
    address: 'Via del Corso 78, Roma, RM 00187',
    latitude: 41.9056,
    longitude: 12.4822,
    status: 'completed'
  },
  {
    id: '4',
    name: 'Trastevere 12',
    address: 'Via di Trastevere 12, Roma, RM 00153',
    latitude: 41.8897,
    longitude: 12.4694,
    status: 'pending'
  },
  {
    id: '5',
    name: 'Colosseo 1',
    address: 'Piazza del Colosseo 1, Roma, RM 00184',
    latitude: 41.8902,
    longitude: 12.4922,
    status: 'current'
  }
];

const MapScreenExample = () => {
  return (
    <View style={styles.container}>
      <MapScreen 
        route={{ 
          params: { 
            stops: exampleStops 
          } 
        }} 
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default MapScreenExample;
