/**
 * @format
 */

import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import App from '../App';

jest.mock('../firebaseConfig', () => ({ auth: {} }))

jest.mock('firebase/auth', () => ({
  createUserWithEmailAndPassword: jest.fn(() => Promise.resolve()),
  signInWithEmailAndPassword: jest.fn(() => Promise.resolve()),
  onAuthStateChanged: jest.fn((_auth, cb) => cb(null)),
  signOut: jest.fn(() => Promise.resolve()),
}))

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
    TextInput: 'TextInput',
    Switch: 'Switch',
    StyleSheet: { create: () => ({}) },
    TouchableOpacity: 'TouchableOpacity',
    NativeModules: {
      CameraStreamer: {
        startStreaming: jest.fn(),
        stopStreaming: jest.fn(),
      },
    },
  }
})


test('renders correctly', async () => {
  await ReactTestRenderer.act(() => {
    ReactTestRenderer.create(<App />);
  });
});
