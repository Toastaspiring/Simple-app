import React, { useEffect, useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native'
import { Camera, useCameraDevices } from 'react-native-vision-camera'
import { FFmpegKit } from 'ffmpeg-kit-react-native'
import type { CameraPermissionStatus } from 'react-native-vision-camera'

const STREAM_URL = 'rtp://192.168.1.5:1234'

export default function App() {
  const [hasPermission, setHasPermission] = useState<boolean>(false)
  const [cameraPermissionStatus, setCameraPermissionStatus] =
    useState<CameraPermissionStatus>('not-determined')
  const [microphonePermissionStatus, setMicrophonePermissionStatus] =
    useState<CameraPermissionStatus>('not-determined')
  const [isStreaming, setIsStreaming] = useState<boolean>(false)
  const devices = useCameraDevices()
  const device = devices.find((d) => d.position === 'back')

  useEffect(() => {
    ;(async () => {
      const camStatus: CameraPermissionStatus = await Camera.requestCameraPermission()
      const micStatus: CameraPermissionStatus = await Camera.requestMicrophonePermission()

      console.log(`Camera permission status: ${camStatus}`)
      console.log(`Microphone permission status: ${micStatus}`)

      setCameraPermissionStatus(camStatus)
      setMicrophonePermissionStatus(micStatus)
      const granted = camStatus === 'granted' && micStatus === 'granted'
      setHasPermission(granted)

      if (granted) {
        const available = await Camera.getAvailableCameraDevices()
        console.log('Devices after permission request:', available)
      }
    })()
  }, [])

  useEffect(() => {
    console.log('Available devices:', devices)
    console.log('Selected device:', device)
  }, [devices, device])

  const startStreaming = async () => {
    setIsStreaming(true)

    // 🧪 Test source — replace with camera stream later
    const command = `-f lavfi -i testsrc=size=640x480:rate=25 -vcodec libx264 -f rtp ${STREAM_URL}`

    FFmpegKit.executeAsync(command, async (session) => {
      const returnCode = await session.getReturnCode()
      setIsStreaming(false)

      if (returnCode?.isValueSuccess()) {
        Alert.alert('Streaming ended', 'RTP stream finished successfully.')
      } else {
        Alert.alert('Error', 'FFmpeg streaming failed.')
      }
    })
  }

  if (!hasPermission) {
    return (
      <View style={styles.center}>
        <Text>No camera or microphone permission.</Text>
      </View>
    )
  }

  if (!device) {
    return (
      <View style={styles.center}>
        <Text>No camera device found.</Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <Camera style={styles.camera} device={device} isActive={true} />
      <TouchableOpacity
        style={[styles.button, isStreaming && styles.buttonDisabled]}
        onPress={startStreaming}
        disabled={isStreaming}
      >
        <Text style={styles.buttonText}>
          {isStreaming ? 'Streaming...' : 'Start Streaming'}
        </Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    backgroundColor: '#1E90FF',
    padding: 15,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#555',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
})
