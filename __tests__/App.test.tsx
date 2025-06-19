/**
 * @format
 */

import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import App from '../App';

jest.mock('react-native-vision-camera', () => {
  const Camera = () => null
  Camera.getAvailableCameraDevices = jest.fn(() => [{ position: 'back' }])
  return {
    Camera,
    useCameraDevices: () => [{ position: 'back' }],
  }
})

jest.mock('react-native', () => {
  return {
    PermissionsAndroid: {
      request: jest.fn(() => Promise.resolve('granted')),
      PERMISSIONS: { CAMERA: 'CAMERA', RECORD_AUDIO: 'RECORD_AUDIO' },
      RESULTS: { GRANTED: 'granted' },
    },
    View: 'View',
    Text: 'Text',
    StyleSheet: { create: () => ({}) },
    TouchableOpacity: 'TouchableOpacity',
    Alert: { alert: jest.fn() },
  }
})

jest.mock('ffmpeg-kit-react-native', () => ({
  FFmpegKit: { executeAsync: jest.fn() },
}))

test('renders correctly', async () => {
  await ReactTestRenderer.act(() => {
    ReactTestRenderer.create(<App />);
  });
});
