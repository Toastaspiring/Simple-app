/**
 * @format
 */

import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import App from '../App';

jest.mock('react-native-vision-camera', () => {
  const Camera = () => null
  Camera.requestCameraPermission = jest.fn(() => Promise.resolve('granted'))
  Camera.requestMicrophonePermission = jest.fn(() => Promise.resolve('granted'))
  Camera.getAvailableCameraDevices = jest.fn(() => [{ position: 'back' }])
  return {
    Camera,
    useCameraDevices: () => [{ position: 'back' }],
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
