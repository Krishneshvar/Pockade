import { DeterministicRNG } from '../../src/core/rng';

describe('DeterministicRNG', () => {
  it('should generate the exact same sequence for the same seed', () => {
    const rng1 = new DeterministicRNG(12345);
    const rng2 = new DeterministicRNG(12345);
    
    expect(rng1.next()).toBe(rng2.next());
    expect(rng1.next()).toBe(rng2.next());
    expect(rng1.nextInt(1, 100)).toBe(rng2.nextInt(1, 100));
  });

  it('should generate different sequences for different seeds', () => {
    const rng1 = new DeterministicRNG(12345);
    const rng2 = new DeterministicRNG(54321);
    
    expect(rng1.next()).not.toBe(rng2.next());
  });

  it('should handle zero and negative seeds', () => {
    const rng0 = new DeterministicRNG(0);
    const rngNeg = new DeterministicRNG(-1);

    expect(rng0.next()).toBeGreaterThanOrEqual(0);
    expect(rng0.next()).toBeLessThanOrEqual(1);

    expect(rngNeg.next()).toBeGreaterThanOrEqual(0);
    expect(rngNeg.next()).toBeLessThanOrEqual(1);
  });

  it('should bound nextInt correctly', () => {
    const rng = new DeterministicRNG(999);
    for (let i = 0; i < 50; i++) {
      const val = rng.nextInt(5, 10);
      expect(val).toBeGreaterThanOrEqual(5);
      expect(val).toBeLessThanOrEqual(10);
      expect(Number.isInteger(val)).toBe(true);
    }
  });

  it('should bound nextFloat correctly', () => {
    const rng = new DeterministicRNG(999);
    for (let i = 0; i < 50; i++) {
      const val = rng.nextFloat(5.5, 10.5);
      expect(val).toBeGreaterThanOrEqual(5.5);
      expect(val).toBeLessThanOrEqual(10.5);
    }
  });
});
