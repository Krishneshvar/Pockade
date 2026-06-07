module.exports = {
  preset: 'jest-expo',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@sentry/react-native|native-base|react-native-svg)'
  ],
  testPathIgnorePatterns: ['/node_modules/', '/e2e/'],
  collectCoverageFrom: [
    'src/core/**/*.{ts,tsx}',
    'src/managers/**/*.{ts,tsx}',
    'src/ui/**/*.{ts,tsx}',
    'src/games/**/*.{ts,tsx}',
    '!src/**/index.ts',
    '!src/app/**/*.{ts,tsx}'
  ],
};
