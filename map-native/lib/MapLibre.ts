import React from 'react';
import { TurboModuleRegistry } from 'react-native';
import Constants, { ExecutionEnvironment } from 'expo-constants';
import MapLibreGL from "@maplibre/maplibre-react-native";

export interface MapLibreStatus {
  module: any | null;
  error?: string;
  isNativePresent: boolean;
  env: string;
  keys?: string;
  lastFailed?: string;
}

let lastFailedLookup: string | undefined;

/**
 * Stable v10 Loader
 * No proxy needed anymore as v10 has stable naming and refs.
 */
export const getMapLibreStatus = (): MapLibreStatus => {
  const env = Constants.executionEnvironment || 'unknown';
  const status: MapLibreStatus = {
    module: null,
    env,
    isNativePresent: false,
    lastFailed: lastFailedLookup
  };

  if (env === ExecutionEnvironment.StoreClient) {
    status.error = "Expo Go Detected";
    return status;
  }

  try {
    status.isNativePresent = 
      !!TurboModuleRegistry.get('MLRNCameraModule') || 
      !!TurboModuleRegistry.get('MLRNModule') ||
      !!TurboModuleRegistry.get('MLRNMapView');
  } catch (e) {
    status.error = "Registry check failed";
  }

  try {
    // In v10, we just use the default export
    status.module = MapLibreGL;
    status.keys = Object.keys(MapLibreGL).join(', ');
  } catch (e: any) {
    status.error = `Import failed: ${e.message}`;
  }

  return status;
};

/**
 * Bridge helper for layer styles (still useful in v10)
 */
export const splitStyle = (style: any) => {
  const layout: any = {};
  const paint: any = {};

  const layoutKeys = [
    'visibility', 'icon-image', 'icon-size', 'icon-anchor', 'icon-offset',
    'text-field', 'text-font', 'text-size', 'text-anchor', 'text-offset',
    'symbol-placement', 'line-cap', 'line-join'
  ];

  Object.keys(style || {}).forEach(key => {
    if (layoutKeys.includes(key)) {
      layout[key] = style[key];
    } else {
      paint[key] = style[key];
    }
  });

  return { layout, paint };
};

export default MapLibreGL;
