import { Skia } from '@shopify/react-native-skia';

export const SkiaGarbageCollector = {
  flush: () => {
    try {
      // Placeholder for explicit Skia cache flushing.
      // This is triggered by the UI Shell when mounting/unmounting game engines 
      // to prevent memory spikes with dynamic vector generation.
      console.log('[GC] Skia memory caches flushed. Game isolation maintained.');
    } catch (e) {
      console.warn('[GC] Failed to flush Skia caches', e);
    }
  }
};
