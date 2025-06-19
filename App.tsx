import React, { useEffect, useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  PermissionsAndroid,
} from 'react-native'
import { Camera, useCameraDevices } from 'react-native-vision-camera'
import { FFmpegKit } from 'ffmpeg-kit-react-native'

const STREAM_URL = 'rtp://192.168.1.103:5002'

export default function App() {
  const [hasPermission, setHasPermission] = useState<boolean>(false)
  const [_cameraPermissionStatus, setCameraPermissionStatus] =
    useState<string>('not-determined')
  const [_microphonePermissionStatus, setMicrophonePermissionStatus] =
    useState<string>('not-determined')
  const [isStreaming, setIsStreaming] = useState<boolean>(false)
  const devices = useCameraDevices()
  const device = devices.find((d) => d.position === 'back')

  useEffect(() => {
    ;(async () => {
      try {
        const camStatus = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
        )
        const micStatus = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
        )

        console.log(`Camera permission status: ${camStatus}`)
        console.log(`Microphone permission status: ${micStatus}`)

        setCameraPermissionStatus(camStatus)
        setMicrophonePermissionStatus(micStatus)
        const granted =
          camStatus === PermissionsAndroid.RESULTS.GRANTED &&
          micStatus === PermissionsAndroid.RESULTS.GRANTED
        setHasPermission(granted)

        if (granted) {
          const available = await Camera.getAvailableCameraDevices()
          console.log('Devices after permission request:', available)
        }
      } catch (err) {
        console.warn(err)
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

    console.log(`Starting FFmpeg streaming to ${STREAM_URL}`)

    FFmpegKit.executeAsync(
      command,
      async (session) => {
        const returnCode = await session.getReturnCode()
        setIsStreaming(false)

        if (returnCode?.isValueSuccess()) {
          console.log('FFmpeg streaming finished successfully')
          Alert.alert('Streaming ended', 'RTP stream finished successfully.')
        } else {
          console.log(`FFmpeg streaming failed with return code ${returnCode?.getValue()}`)
          Alert.alert('Error', 'FFmpeg streaming failed.')
        }
      },
      (log) => {
        console.log('ffmpeg:', log.getMessage())
      },
    )
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
