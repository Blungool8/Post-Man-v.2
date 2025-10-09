/**
 * Type definitions for CustomStopMarker component
 */

import { ComponentType } from 'react';

export interface StopMarkerProps {
  stop: {
    id: string;
    name: string;
    latitude: number;
    longitude: number;
    status?: string;
    distance?: number;
    [key: string]: any;
  };
  size: number;
  onPress?: () => void;
  isNearest?: boolean;
}

declare const CustomStopMarker: ComponentType<StopMarkerProps>;

export default CustomStopMarker;

