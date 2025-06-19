import React, { useEffect, useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  PermissionsAndroid,
  Platform,
  Alert,
} from 'react-native'
import { Camera, useCameraDevices } from 'react-native-vision-camera'
import { FFmpegKit } from 'ffmpeg-kit-react-native'
import type { CameraPermissionStatus } from 'react-native-vision-camera'

export default function App() {
  const [hasPermission, setHasPermission] = useState<boolean>(false)
  const [isStreaming, setIsStreaming] = useState<boolean>(false)
  const devices = useCameraDevices()
  const device = devices.find((d) => d.position === 'back')

  useEffect(() => {
    (async () => {
      const cameraPermission: CameraPermissionStatus = await Camera.requestCameraPermission()
      const micPermission: CameraPermissionStatus = await Camera.requestMicrophonePermission()

      if (Platform.OS === 'android') {
        const storagePermission = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        )

        setHasPermission(
          cameraPermission === 'granted' &&
            micPermission === 'granted' &&
            storagePermission === PermissionsAndroid.RESULTS.GRANTED,
        )
      } else {
        setHasPermission(
          cameraPermission === 'granted' && micPermission === 'granted',
        )
      }
    })()
  }, [])

  const startStreaming = async () => {
    setIsStreaming(true)

    // 🧪 Test source — replace with camera stream later
    const command = `-f lavfi -i testsrc=size=640x480:rate=25 -vcodec libx264 -f rtp rtp://192.168.1.5:1234`

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

  if (!device || !hasPermission) {
    return (
      <View style={styles.center}>
        <Text>Waiting for permissions or camera...</Text>
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
