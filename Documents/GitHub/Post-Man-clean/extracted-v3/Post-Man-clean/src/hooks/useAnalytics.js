import { useEffect, useRef } from 'react';
import { AppState } from 'react-native';
import analyticsService from '../services/AnalyticsService/AnalyticsService';

export const useAnalytics = () => {
  const appState = useRef(AppState.currentState);

  useEffect(() => {
    // Inizializza analytics
    const initializeAnalytics = async () => {
      try {
        await analyticsService.initialize();
        await analyticsService.trackAppStart();
      } catch (error) {
        console.error('Error initializing analytics:', error);
      }
    };

    initializeAnalytics();

    // Gestione cambio stato app
    const handleAppStateChange = (nextAppState) => {
      if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
        // App è tornata in foreground
        analyticsService.trackAppForeground();
      } else if (appState.current === 'active' && nextAppState.match(/inactive|background/)) {
        // App è andata in background
        analyticsService.trackAppBackground();
      }
      appState.current = nextAppState;
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    // Cleanup
    return () => {
      subscription?.remove();
      analyticsService.endSession();
    };
  }, []);

  return {
    trackEvent: analyticsService.trackEvent.bind(analyticsService),
    trackFeatureUsage: analyticsService.trackFeatureUsage.bind(analyticsService),
    trackPerformanceMetric: analyticsService.trackPerformanceMetric.bind(analyticsService),
    trackMapInteraction: analyticsService.trackMapInteraction.bind(analyticsService),
    trackGPSUpdate: analyticsService.trackGPSUpdate.bind(analyticsService),
    trackStopCompleted: analyticsService.trackStopCompleted.bind(analyticsService),
    trackRouteImported: analyticsService.trackRouteImported.bind(analyticsService),
    trackOfflineMapDownload: analyticsService.trackOfflineMapDownload.bind(analyticsService),
    trackNavigationMode: analyticsService.trackNavigationMode.bind(analyticsService),
    getUsageStats: analyticsService.getUsageStats.bind(analyticsService),
    exportAnalyticsData: analyticsService.exportAnalyticsData.bind(analyticsService)
  };
};

// Hook per tracking performance
export const usePerformanceTracking = () => {
  const trackStartupTime = () => {
    const startupTime = Date.now() - performance.now();
    analyticsService.trackPerformanceMetric('app_startup_time', startupTime, 'ms');
  };

  const trackMapLoadTime = (loadTime) => {
    analyticsService.trackPerformanceMetric('map_load_time', loadTime, 'ms');
  };

  const trackGPSAccuracy = (accuracy) => {
    analyticsService.trackPerformanceMetric('gps_accuracy', accuracy, 'm');
  };

  const trackMemoryUsage = () => {
    if (performance.memory) {
      const memoryMB = performance.memory.usedJSHeapSize / (1024 * 1024);
      analyticsService.trackPerformanceMetric('memory_usage', memoryMB, 'MB');
    }
  };

  return {
    trackStartupTime,
    trackMapLoadTime,
    trackGPSAccuracy,
    trackMemoryUsage
  };
};

// Hook per tracking feature usage
export const useFeatureTracking = (featureName) => {
  const startTime = useRef(null);

  const startTracking = () => {
    startTime.current = Date.now();
    analyticsService.trackFeatureUsage(featureName);
  };

  const endTracking = () => {
    if (startTime.current) {
      const duration = (Date.now() - startTime.current) / 1000;
      analyticsService.trackFeatureUsage(featureName, duration);
      startTime.current = null;
    }
  };

  const trackUsage = () => {
    analyticsService.trackFeatureUsage(featureName);
  };

  return {
    startTracking,
    endTracking,
    trackUsage
  };
};
