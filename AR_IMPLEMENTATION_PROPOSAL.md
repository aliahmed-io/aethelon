# PROPOSAL: Native WebAR Integration ("Aethelon AR")

## Executive Summary
This document outlines the technical implementation for **Tier 1: "Atelier View" (Place in World)**. 
We will leverage the native AR capabilities of iOS (QuickLook) and Android (Scene Viewer) to allow users to place true-to-scale 3D models of Aethelon timepieces in their physical environment without installing any application.

---

## 1. Technical Architecture

### Core Component: `<model-viewer>`
We will migrate from a pure `react-three-fiber` canvas to Google's [`<model-viewer>`](https://modelviewer.dev/) web component for the mobile AR view. This component is the industry standard for e-commerce AR because:
1.  **Auto-Android Support**: It automatically handles the intent to launch Google Scene Viewer.
2.  **Auto-iOS Support**: It detects iOS devices and generates the necessary `.usdz` conversion blobs on the fly (or links to static ones).
3.  **Performance**: It uses the device's native renderer, which is often more performant for AR than a WebGL canvas.

### The Flow
1.  **Desktop**: Continues to use the existing `react-three-fiber` implementation for high-fidelity interactive orbiting (as it allows for better custom shaders and "luxury" post-processing).
2.  **Mobile**: We introduce an "View in Your Space" pill button.
3.  **Interaction**: 
    - User taps "View in Your Space".
    - Android: Launches Scene Viewer immediately using the generated `.glb`.
    - iOS: Launches AR QuickLook. Note: For iOS, we need to ensure the `.glb` is converted to `.usdz`.
    
---

## 2. Implementation Strategy

### Step 1: Dynamic Conversion (The Challenge)
iOS AR requires `.usdz` files. Meshy AI generates `.glb`. 
**Solution**: We will use an on-the-fly client-side converter or Model Viewer's auto-generation capability.
*   `<model-viewer>` has a built-in `ar-modes="webxr scene-viewer quick-look"` attribute.
*   Modern versions of `<model-viewer>` can often handle `.glb` on iOS automatically by generating a `.usdz` blob in memory, provided the file size is reasonable (<20MB, which our AI models are).

### Step 2: Component Upgrade (`ThreeDViewer.tsx`)

We will wrap the existing viewer with a new **AR Overlay**.

```tsx
// New Component: ARButton.tsx
import "@google/model-viewer"; // We import the web component

export function ARButton({ modelUrl, posterUrl }: { modelUrl: string, posterUrl: string }) {
  // We explicitly use the custom element
  return (
    <model-viewer
      src={modelUrl}
      ios-src="" // Left empty, model-viewer attempts auto-conversion or we provide a separate field if needed
      poster={posterUrl}
      alt="Aethelon Timepiece AR"
      shadow-intensity="1"
      camera-controls
      auto-rotate
      ar
      ar-modes="webxr scene-viewer quick-look"
      style={{ display: 'none' }} // Hidden, we only use it for the button trigger
      id="aethelon-ar-viewer"
    >
      <button slot="ar-button" id="ar-trigger">
        View in Your Space
      </button>
    </model-viewer>
  );
}
```

### Step 3: Triggering the Experience
We don't want to show the bulky default `<model-viewer>` UI. instead, we keep our custom React Three Fiber viewer, but when the user clicks our custom "View in AR" button, we programmatically trigger the hidden `<model-viewer>`'s AR mode.

```javascript
const openAR = () => {
  const viewer = document.querySelector("#aethelon-ar-viewer");
  viewer.activateAR();
}
```

---

## 3. Requirements

### Dependencies
No new heavy npm packages are strictly required if we load `<model-viewer>` via CDN script tag, but for type safety and bundling we can install:
`npm install @google/model-viewer`

### Asset Constraints
- **File Type**: `.glb` (Already provided by Meshy).
- **Size**: Must be under 20MB for stable AR (Meshy models are typically ~5-10MB).
- **Scale**: The model must be in **meters**. We may need to apply a scale factor (e.g., 0.01) if Meshy exports in centimeters, otherwise the watch will look like a building.

### Database Changes
None. We use the existing `modelUrl`.

---

## 4. Verification Plan

1.  **Android Test**: Open Product Page on Chrome Android -> Tap AR -> Verify Object Placement.
2.  **iOS Test**: Open on Safari iOS -> Tap AR -> Verify QuickLook launch.
3.  **Scale Check**: Ensure the watch appears as ~40mm, not 40 meters.

---

## Conclusion
This approach provides a "best of both worlds" solution: 
- **Desktop**: Cinematic, custom-lit WebGL (Aethelon style).
- **Mobile**: Native, highly optimzed OS-level AR (Apple/Google standard).

This is the exact method used by luxury brands like Shopify, Porsche, and others for their web-based AR.
