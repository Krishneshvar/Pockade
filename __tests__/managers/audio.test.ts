import { Audio } from 'expo-av';
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
    expect(Audio.setAudioModeAsync).toHaveBeenCalledWith(
      expect.objectContaining({
        shouldDuckAndroid: true,
        staysActiveInBackground: false,
      })
    );
  });

  it('preloads and plays SFX', async () => {
    await AudioEngine.preloadSFX('bell', 'dummy-source.mp3');
    expect(Audio.Sound.createAsync).toHaveBeenCalledWith('dummy-source.mp3');

    const soundMock = (await Audio.Sound.createAsync.mock.results[0].value).sound;

    await AudioEngine.playSFX('bell');
    expect(soundMock.replayAsync).toHaveBeenCalled();
  });

  it('does not play SFX if sfxEnabled is false', async () => {
    useThemeStore.setState({ sfxEnabled: false });
    await AudioEngine.preloadSFX('bell', 'dummy-source.mp3');
    
    const soundMock = (await Audio.Sound.createAsync.mock.results[0].value).sound;
    await AudioEngine.playSFX('bell');
    expect(soundMock.replayAsync).not.toHaveBeenCalled();
  });

  it('plays BGM and stops previous BGM', async () => {
    await AudioEngine.playBGM('theme', 'theme-source.mp3');
    expect(Audio.Sound.createAsync).toHaveBeenCalledWith('theme-source.mp3', expect.objectContaining({ isLooping: true }));

    const soundMock = (await Audio.Sound.createAsync.mock.results[0].value).sound;
    
    await AudioEngine.playBGM('battle', 'battle-source.mp3');
    expect(soundMock.stopAsync).toHaveBeenCalled();
    expect(soundMock.unloadAsync).toHaveBeenCalled();
  });

  it('pauses BGM when audio is disabled dynamically', async () => {
    await AudioEngine.playBGM('theme', 'theme-source.mp3');
    const soundMock = (await Audio.Sound.createAsync.mock.results[0].value).sound;

    useThemeStore.setState({ audioEnabled: false });
    // Theme subscription should trigger pauseBGM
    await Promise.resolve(); // flush microtasks
    expect(soundMock.pauseAsync).toHaveBeenCalled();
  });
});
