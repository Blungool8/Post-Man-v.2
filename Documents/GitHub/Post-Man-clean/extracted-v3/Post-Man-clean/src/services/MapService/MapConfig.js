import MapView, { PROVIDER_GOOGLE } from 'react-native-maps';

export const MapConfig = {
  provider: PROVIDER_GOOGLE,
  performance: {
    updateInterval: 1000,
    distanceFilter: 2,
    maxZoomLevel: 18,
    minZoomLevel: 12
  },
  offline: {
    tileUrl: 'file:///android_asset/tiles/{z}/{x}/{y}.png',
    cacheSize: 100, // MB
    preloadRadius: 2 // tile radius for preloading
  }
};

export const simplifiedMapStyle = [
  // Style semplificato per performance massima
  {
    "elementType": "geometry",
    "stylers": [{ "color": "#f5f5f5" }]
  },
  {
    "elementType": "labels.icon",
    "stylers": [{ "visibility": "off" }]
  },
  {
    "elementType": "labels.text.fill",
    "stylers": [{ "color": "#616161" }]
  },
  {
    "elementType": "labels.text.stroke",
    "stylers": [{ "color": "#f5f5f5" }]
  },
  {
    "featureType": "administrative.land_parcel",
    "elementType": "labels.text.fill",
    "stylers": [{ "color": "#bdbdbd" }]
  },
  {
    "featureType": "poi",
    "elementType": "geometry",
    "stylers": [{ "color": "#eeeeee" }]
  },
  {
    "featureType": "poi",
    "elementType": "labels.text.fill",
    "stylers": [{ "color": "#757575" }]
  },
  {
    "featureType": "poi.park",
    "elementType": "geometry",
    "stylers": [{ "color": "#e5e5e5" }]
  },
  {
    "featureType": "poi.park",
    "elementType": "labels.text.fill",
    "stylers": [{ "color": "#9e9e9e" }]
  },
  {
    "featureType": "road",
    "elementType": "geometry",
    "stylers": [{ "color": "#ffffff" }]
  },
  {
    "featureType": "road.arterial",
    "elementType": "labels.text.fill",
    "stylers": [{ "color": "#757575" }]
  },
  {
    "featureType": "road.highway",
    "elementType": "geometry",
    "stylers": [{ "color": "#dadada" }]
  },
  {
    "featureType": "road.highway",
    "elementType": "labels.text.fill",
    "stylers": [{ "color": "#616161" }]
  },
  {
    "featureType": "road.local",
    "elementType": "labels.text.fill",
    "stylers": [{ "color": "#9e9e9e" }]
  },
  {
    "featureType": "transit.line",
    "elementType": "geometry",
    "stylers": [{ "color": "#e5e5e5" }]
  },
  {
    "featureType": "transit.station",
    "elementType": "geometry",
    "stylers": [{ "color": "#eeeeee" }]
  },
  {
    "featureType": "water",
    "elementType": "geometry",
    "stylers": [{ "color": "#c9c9c9" }]
  },
  {
    "featureType": "water",
    "elementType": "labels.text.fill",
    "stylers": [{ "color": "#9e9e9e" }]
  }
];

// Configurazione marker per fermate postali
export const StopMarkerConfig = {
  colors: {
    pending: '#FFD800',    // Giallo Poste
    completed: '#4CAF50',  // Verde successo
    failed: '#F44336',     // Rosso errore
    current: '#2196F3'     // Blu attuale
  },
  sizes: {
    min: 0.3,
    max: 1.0,
    default: 0.7
  },
  animation: {
    duration: 300,
    easing: 'spring'
  }
};

// Configurazione regioni per ottimizzazione rendering
export const RegionConfig = {
  defaultRegion: {
    latitude: 41.9028,  // Roma centro
    longitude: 12.4964,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  },
  maxVisibleRadius: 2000, // metri
  clusteringDistance: 100 // metri per clustering marker
};
