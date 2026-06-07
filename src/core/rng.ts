export class DeterministicRNG {
  private state: number;

  constructor(seed: number) {
    this.state = seed;
  }

  /**
   * Mulberry32 generator.
   * Ensures that a specific seed always generates the exact same sequence across all devices.
   */
  public next(): number {
    this.state |= 0;
    this.state = this.state + 0x6D2B79F5 | 0;
    let t = Math.imul(this.state ^ (this.state >>> 15), 1 | this.state);
    t = t + Math.imul(t ^ (t >>> 7), 61 | t) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  // Helper methods
  public nextInt(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }

  public nextFloat(min: number, max: number): number {
    return this.next() * (max - min) + min;
  }
}
