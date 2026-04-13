# ParkAddis Native Map & Navigation Implementation

This directory contains a high-performance, native-adapted map and navigation system for the ParkAddis mobile application. It has been systematically ported from the web version to ensure feature parity while optimizing for the React Native/Expo environment.

## 1. Setup & Environment

### Dependencies
Ensure the following packages are installed in your mobile project:
```bash
npx expo install @maplibre/maplibre-react-native expo-location expo-sensors lucide-react-native
```

### Assets
Place your parking pin icon at `map-native/assets/parking-pin.png`. This is required for the `ParkingLayer` to register the custom icon.

### Permissions (`app.json`)
Configure your Expo app to request the necessary location and motion permissions:
```json
{
  "expo": {
    "ios": {
      "infoPlist": {
        "NSLocationWhenInUseUsageDescription": "ParkAddis needs your location to find nearby parking and provide navigation.",
        "NSMotionUsageDescription": "Allows the map to rotate according to your device orientation."
      }
    },
    "android": {
      "permissions": ["ACCESS_FINE_LOCATION", "ACCESS_COARSE_LOCATION"]
    }
  }
}
```

---

## 2. Directory Structure

- **`/` (Root)**
  - `MapProvider.tsx`: Core context providing safe navigation states and actions.
  - `MapRoot.tsx`: Base MapLibre container with predefined bounds and styles.
  - `MapView.tsx`: Main coordinator that combines all layers and UI overlays.
- **`hooks/`**
  - `useGeolocationWatcher.ts`: High-precision GPS and Orientation (Magnetometer) tracking.
  - `useNavigationState.ts`: State machine logic for IDLE, PREVIEW, and NAVIGATING modes.
  - `useBearingSmoothing.ts`: Low-pass filter for jitter-free camera rotation.
- **`layers/`**
  - `ParkingLayer.tsx`: Uses `ShapeSource` + `SymbolLayer` for optimized pin rendering.
  - `UserLayer.tsx`: Native "Blue Dot" using standard MapLibre GPS indicators.
  - `RouteLayer.tsx`: Dynamic GeoJSON line rendering for active navigation.
- **`navigation/`**
  - `NavigationCamera.tsx`: Controls the 3D perspective ($70^\circ$ pitch) and follow-logic.
  - `RouteManager.tsx`: Handles OSRM route fetching and metric updates.
- **`ui/`**
  - `ActiveReservationCard.tsx`: Floating navigation info card.
  - `MapControls.tsx`: Floating action buttons for GPS and layer toggles.

---

## 3. Integration Walkthrough

### Step 1: Wrap your App/Screen with the Provider
```tsx
import { MapProvider } from './map-native/MapProvider';

export default function App() {
  return (
    <MapProvider>
      <MainNavigator />
    </MapProvider>
  );
}
```

### Step 2: Use MapView in your Locations Screen
```tsx
import { MapView } from './map-native/MapView';

// Pass your parking locations (GeoJSON) and session data
<MapView 
  displayedLocations={locations} 
  onLocationClick={handleSelect}
  selectedLocation={selectedLoc}
  activeReservation={activeRes}
/>
```

### Step 3: Triggering Navigation
The system is built as a state machine. To start navigation, use the `actions` from `useMap()`:
- `actions.previewDestination(coords)`: Fetches route and fits bounds.
- `actions.startNavigation()`: Activates the 3D high-pitch camera follow-mode.
- `actions.clearNavigation()`: Returns the map to search mode.

---

## 4. Key Performance Optimizations

1.  **Symbol Layers**: Unlike individual markers, the `ParkingLayer` uses a single `SymbolLayer`. This remains fluid even if Addis Ababa has thousands of parking spots.
2.  **Sensor Fusion**: `useGeolocationWatcher` automatically switches between Magnetometer (compass) and GPS bearing based on movement speed to ensure the arrow always points the right way.
3.  **Camera Throttling**: The native camera updates are interpolated to ensure smooth transitions without draining battery life.
