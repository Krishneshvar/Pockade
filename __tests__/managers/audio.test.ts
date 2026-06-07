import { createAudioPlayer, setAudioModeAsync } from 'expo-audio';
import { AudioEngine } from '../../src/managers/audio';
import { useThemeStore } from '../../src/core/themeStore';

describe('AudioEngine', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    useThemeStore.setState({ audioEnabled: true, sfxEnabled: true });
    await AudioEngine.unloadAll(); // Reset engine state
  });

  it('initializes the audio mode with ducking', async () => {
    await AudioEngine.initialize();
    expect(setAudioModeAsync).toHaveBeenCalledWith(
      expect.objectContaining({
        playsInSilentMode: true,
        interruptionMode: 'duckOthers',
      })
    );
  });

  it('preloads and plays SFX', async () => {
    await AudioEngine.preloadSFX('bell', 'dummy-source.mp3');
    expect(createAudioPlayer).toHaveBeenCalledWith('dummy-source.mp3');

    const playerMock = (createAudioPlayer as jest.Mock).mock.results[0].value;

    await AudioEngine.playSFX('bell');
    expect(playerMock.seekTo).toHaveBeenCalledWith(0);
    expect(playerMock.play).toHaveBeenCalled();
  });

  it('does not play SFX if sfxEnabled is false', async () => {
    useThemeStore.setState({ sfxEnabled: false });
    await AudioEngine.preloadSFX('bell', 'dummy-source.mp3');
    
    const playerMock = (createAudioPlayer as jest.Mock).mock.results[0].value;
    await AudioEngine.playSFX('bell');
    expect(playerMock.play).not.toHaveBeenCalled();
  });

  it('plays BGM and stops previous BGM', async () => {
    await AudioEngine.playBGM('theme', 'theme-source.mp3');
    expect(createAudioPlayer).toHaveBeenCalledWith('theme-source.mp3');

    const firstPlayerMock = (createAudioPlayer as jest.Mock).mock.results[0].value;
    expect(firstPlayerMock.loop).toBe(true);
    expect(firstPlayerMock.play).toHaveBeenCalled();

    await AudioEngine.playBGM('battle', 'battle-source.mp3');
    expect(firstPlayerMock.stop).toHaveBeenCalled();
    expect(firstPlayerMock.release).toHaveBeenCalled();
  });

  it('pauses BGM when audio is disabled dynamically', async () => {
    await AudioEngine.playBGM('theme', 'theme-source.mp3');
    const playerMock = (createAudioPlayer as jest.Mock).mock.results[0].value;

    useThemeStore.setState({ audioEnabled: false });
    // Theme subscription should trigger pauseBGM
    await Promise.resolve(); // flush microtasks
    expect(playerMock.pause).toHaveBeenCalled();
  });
});
