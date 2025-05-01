// Object pool for memory efficiency
export class ObjectPool<T> {
  private pool: T[] = [];
  private factory: () => T;

  constructor(factory: () => T, initialSize = 10) {
    this.factory = factory;
    // Pre-populate the pool
    for (let i = 0; i < initialSize; i++) {
      this.pool.push(factory());
    }
  }

  get(): T {
    return this.pool.length > 0 ? this.pool.pop()! : this.factory();
  }

  release(object: T): void {
    this.pool.push(object);
  }
}

// Dirty rectangle tracking for optimized rendering
export class DirtyRegionManager {
  private dirtyRegions: DOMRect[] = [];

  addDirtyRegion(x: number, y: number, width: number, height: number): void {
    this.dirtyRegions.push(new DOMRect(x, y, width, height));
  }

  getDirtyRegions(): DOMRect[] {
    return this.dirtyRegions;
  }

  clearDirtyRegions(): void {
    this.dirtyRegions = [];
  }

  // Merge overlapping regions for efficiency
  optimize(): void {
    // Simple implementation - can be optimized further
    const merged: DOMRect[] = [];
    for (const region of this.dirtyRegions) {
      let didMerge = false;
      for (let i = 0; i < merged.length; i++) {
        if (this.intersects(region, merged[i])) {
          merged[i] = this.union(region, merged[i]);
          didMerge = true;
          break;
        }
      }
      if (!didMerge) {
        merged.push(region);
      }
    }
    this.dirtyRegions = merged;
  }

  private intersects(r1: DOMRect, r2: DOMRect): boolean {
    return !(
      r1.right < r2.left ||
      r1.left > r2.right ||
      r1.bottom < r2.top ||
      r1.top > r2.bottom
    );
  }

  private union(r1: DOMRect, r2: DOMRect): DOMRect {
    const left = Math.min(r1.left, r2.left);
    const top = Math.min(r1.top, r2.top);
    const right = Math.max(r1.right, r2.right);
    const bottom = Math.max(r1.bottom, r2.bottom);
    return new DOMRect(left, top, right - left, bottom - top);
  }
}
