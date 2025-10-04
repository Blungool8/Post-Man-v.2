import React, { memo } from 'react';
import { Marker } from 'react-native-maps';
import { View, StyleSheet, Animated, Text } from 'react-native';
import { StopMarkerConfig } from '../../services/MapService/MapConfig';

const CustomStopMarker = memo(({ stop, size, onPress, isNearest = false }) => {
  // Animazione per transizioni fluide
  const scaleAnim = React.useRef(new Animated.Value(size)).current;
  const pulseAnim = React.useRef(new Animated.Value(1)).current;
  
  React.useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: size,
      useNativeDriver: true,
      friction: 8,
      tension: 40
    }).start();
  }, [size]);

  // Animazione pulse per fermata più vicina
  React.useEffect(() => {
    if (isNearest && size > 0) {
      const pulseAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      );
      pulseAnimation.start();
      
      return () => pulseAnimation.stop();
    }
  }, [isNearest, size]);

  if (size === 0) return null; // Nascondi marker se size = 0

  const getMarkerColor = () => {
    switch (stop.status) {
      case 'completed':
        return StopMarkerConfig.colors.completed;
      case 'failed':
        return StopMarkerConfig.colors.failed;
      case 'current':
        return StopMarkerConfig.colors.current;
      default:
        return StopMarkerConfig.colors.pending;
    }
  };

  const getMarkerIcon = () => {
    switch (stop.status) {
      case 'completed':
        return '✓';
      case 'failed':
        return '✗';
      case 'current':
        return '●';
      default:
        return '○';
    }
  };

  return (
    <Marker
      coordinate={{
        latitude: stop.latitude,
        longitude: stop.longitude
      }}
      onPress={onPress}
      tracksViewChanges={false} // Performance optimization
    >
      <Animated.View style={[
        styles.marker,
        {
          transform: [
            { scale: scaleAnim },
            ...(isNearest ? [{ scale: pulseAnim }] : [])
          ],
          opacity: size
        }
      ]}>
        <View style={[
          styles.markerInner,
          { 
            backgroundColor: getMarkerColor(),
            borderColor: isNearest ? '#333333' : '#FFFFFF',
            borderWidth: isNearest ? 3 : 2
          }
        ]}>
          <Text style={[
            styles.markerIcon,
            { 
              color: stop.status === 'completed' ? '#FFFFFF' : '#333333',
              fontSize: Math.max(8, 12 * size)
            }
          ]}>
            {getMarkerIcon()}
          </Text>
        </View>
        
        {/* Indicatore distanza per fermata più vicina */}
        {isNearest && stop.distance && (
          <View style={styles.distanceIndicator}>
            <Text style={styles.distanceText}>
              {stop.distance < 1000 
                ? `${Math.round(stop.distance)}m` 
                : `${(stop.distance / 1000).toFixed(1)}km`
              }
            </Text>
          </View>
        )}
      </Animated.View>
    </Marker>
  );
});

const styles = StyleSheet.create({
  marker: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  markerInner: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  markerIcon: {
    fontWeight: 'bold',
    textAlign: 'center',
  },
  distanceIndicator: {
    position: 'absolute',
    top: -8,
    backgroundColor: '#333333',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    minWidth: 30,
    alignItems: 'center',
  },
  distanceText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
});

export default CustomStopMarker;
