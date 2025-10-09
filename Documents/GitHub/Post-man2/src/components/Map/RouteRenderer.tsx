/**
 * RouteRenderer - Renderizza polyline dai percorsi KML
 * Milestone M2 - Task T20
 * 
 * Regole PRD v3:
 * - Disegna LineString dal KML come Polyline su mappa
 * - Semplificazione Douglas-Peucker se > 5000 punti
 * - Colori configurabili per route
 */

import React from 'react';
import { Polyline } from 'react-native-maps';
import type { RouteSegment } from '../../services/KMLService';

interface RouteRendererProps {
  routes: RouteSegment[];
  strokeWidth?: number;
  strokeColor?: string;
  zIndex?: number;
}

const RouteRenderer: React.FC<RouteRendererProps> = ({
  routes,
  strokeWidth = 4,
  strokeColor = '#2196F3',
  zIndex = 0
}) => {
  if (!routes || routes.length === 0) {
    console.log('[RouteRenderer] No routes to render');
    return null;
  }

  console.log(`[RouteRenderer] Rendering ${routes.length} routes`);

  return (
    <>
      {routes.map((route, index) => {
        const coordinates = route.coordinates.map(coord => ({
          latitude: coord.latitude,
          longitude: coord.longitude
        }));

        if (coordinates.length < 2) {
          console.warn(`[RouteRenderer] Route "${route.name}" has < 2 points, skipping`);
          return null;
        }

        console.log(`[RouteRenderer] Route "${route.name}": ${coordinates.length} points`);

        return (
          <Polyline
            key={`route-${index}-${route.name}`}
            coordinates={coordinates}
            strokeWidth={strokeWidth}
            strokeColor={strokeColor}
            zIndex={zIndex}
            lineCap="round"
            lineJoin="round"
            geodesic={true}
          />
        );
      })}
    </>
  );
};

RouteRenderer.displayName = 'RouteRenderer';

export default RouteRenderer;

