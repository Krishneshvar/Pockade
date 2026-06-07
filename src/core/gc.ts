export interface DisposableSkiaObject {
  dispose: () => void;
}

class SkiaGarbageCollectorClass {
  private registry = new Set<DisposableSkiaObject>();

  /**
   * Register a native Skia object (like SkImage, SkTypeface, SkPath) 
   * so it can be explicitly destroyed later to prevent OOM errors.
   */
  register(obj: DisposableSkiaObject) {
    if (obj && typeof obj.dispose === 'function') {
      this.registry.add(obj);
    }
  }

  /**
   * Unregister an object if the game handles its own disposal before flush.
   */
  unregister(obj: DisposableSkiaObject) {
    this.registry.delete(obj);
  }

  /**
   * Explicitly flush all registered native Skia memory blocks.
   * This is triggered by the UI Shell when mounting/unmounting game engines
   * or when the OS transitions to a background state.
   */
  flush() {
    let disposedCount = 0;
    
    for (const obj of this.registry) {
      try {
        obj.dispose();
        disposedCount++;
      } catch (error) {
        console.warn('[GC] Failed to dispose native Skia object:', error);
      }
    }
    
    this.registry.clear();
    
    if (disposedCount > 0) {
      console.log(`[GC] Successfully flushed ${disposedCount} native Skia objects.`);
    }
  }
}

export const SkiaGarbageCollector = new SkiaGarbageCollectorClass();
