import { SkiaGarbageCollector, DisposableSkiaObject } from '../../src/core/gc';

describe('SkiaGarbageCollector', () => {
  beforeEach(() => {
    // We clear registry internally before each test by flushing it
    SkiaGarbageCollector.flush();
    jest.clearAllMocks();
  });

  it('registers and disposes native objects on flush', () => {
    const mockImage: DisposableSkiaObject = {
      dispose: jest.fn(),
    };
    const mockFont: DisposableSkiaObject = {
      dispose: jest.fn(),
    };

    SkiaGarbageCollector.register(mockImage);
    SkiaGarbageCollector.register(mockFont);

    SkiaGarbageCollector.flush();

    expect(mockImage.dispose).toHaveBeenCalled();
    expect(mockFont.dispose).toHaveBeenCalled();
  });

  it('unregisters an object successfully', () => {
    const mockPath: DisposableSkiaObject = {
      dispose: jest.fn(),
    };

    SkiaGarbageCollector.register(mockPath);
    SkiaGarbageCollector.unregister(mockPath);

    SkiaGarbageCollector.flush();

    expect(mockPath.dispose).not.toHaveBeenCalled();
  });

  it('ignores invalid objects', () => {
    const invalidObj = {} as DisposableSkiaObject;

    SkiaGarbageCollector.register(invalidObj);
    expect(() => SkiaGarbageCollector.flush()).not.toThrow();
  });

  it('survives exceptions thrown during disposal', () => {
    const failingObj: DisposableSkiaObject = {
      dispose: jest.fn().mockImplementation(() => {
        throw new Error('Native exception');
      }),
    };
    const workingObj: DisposableSkiaObject = {
      dispose: jest.fn(),
    };

    SkiaGarbageCollector.register(failingObj);
    SkiaGarbageCollector.register(workingObj);

    expect(() => SkiaGarbageCollector.flush()).not.toThrow();
    
    // Ensure the loop continued despite the exception
    expect(failingObj.dispose).toHaveBeenCalled();
    expect(workingObj.dispose).toHaveBeenCalled();
  });
});
