import React, { useEffect, useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  PermissionsAndroid,
  NativeModules,
  TextInput,
  Switch,
} from 'react-native'
import { Camera, useCameraDevices } from 'react-native-vision-camera'

const { CameraStreamer } = NativeModules


export default function App() {
  const [hasPermission, setHasPermission] = useState<boolean>(false)
  const [_cameraPermissionStatus, setCameraPermissionStatus] =
    useState<string>('not-determined')
  const [_microphonePermissionStatus, setMicrophonePermissionStatus] =
    useState<string>('not-determined')
  const [isStreaming, setIsStreaming] = useState<boolean>(false)
  const [streamUrl, setStreamUrl] = useState<string>('rtp://192.168.1.103:5002')
  const [cameraPosition, setCameraPosition] = useState<'back' | 'front'>('back')
  const devices = useCameraDevices()
  const device = devices.find((d) => d.position === cameraPosition)

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

  const logInterval = React.useRef<NodeJS.Timeout | null>(null)

  const startStreaming = () => {
    console.log(`Starting native streaming to ${streamUrl}`)
    setIsStreaming(true)
  }

  const stopStreaming = () => {
    console.log('Stopping native streaming')
    setIsStreaming(false)
  }

  useEffect(() => {
    if (isStreaming) {
      CameraStreamer.startStreaming()
      logInterval.current = setInterval(() => {
        console.log('Streaming frame at', new Date().toISOString())
      }, 1000)
    } else {
      CameraStreamer.stopStreaming()
      if (logInterval.current) {
        clearInterval(logInterval.current)
        logInterval.current = null
      }
    }
    return () => {
      if (logInterval.current) {
        clearInterval(logInterval.current)
        logInterval.current = null
      }
    }
  }, [isStreaming])

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
      <View style={styles.header}>
        <Text style={styles.headerText}>RTP Streamer</Text>
      </View>

      <View style={styles.content}>
        {!isStreaming && (
          <Camera style={styles.camera} device={device} isActive={true} />
        )}

        <View style={styles.statusRow}>
          <View
            style={[
              styles.statusDot,
              isStreaming ? styles.dotStreaming : styles.dotIdle,
            ]}
          />
          <Text style={styles.statusText}>
            {isStreaming ? 'Streaming' : 'Not streaming'}
          </Text>
        </View>

        <TextInput
          style={styles.input}
          value={streamUrl}
          onChangeText={setStreamUrl}
          placeholder="Stream URL"
          placeholderTextColor="#999"
        />

        <View style={styles.switchRow}>
          <Text style={styles.switchLabel}>Use front camera</Text>
          <Switch
            value={cameraPosition === 'front'}
            onValueChange={() =>
              setCameraPosition(cameraPosition === 'front' ? 'back' : 'front')
            }
          />
        </View>

        <View style={styles.controls}>
          <TouchableOpacity
            style={[styles.button, isStreaming && styles.buttonDisabled]}
            onPress={startStreaming}
            disabled={isStreaming}
          >
            <Text style={styles.buttonText}>Start</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, !isStreaming && styles.buttonDisabled]}
            onPress={stopStreaming}
            disabled={!isStreaming}
          >
            <Text style={styles.buttonText}>Stop</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    paddingVertical: 20,
    backgroundColor: '#1E90FF',
    alignItems: 'center',
  },
  headerText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
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
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 10,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  dotStreaming: {
    backgroundColor: '#ff3b30',
  },
  dotIdle: {
    backgroundColor: '#555',
  },
  statusText: {
    color: '#fff',
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#444',
    color: '#fff',
    marginHorizontal: 20,
    marginBottom: 10,
    padding: 10,
    borderRadius: 4,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 20,
    marginBottom: 10,
  },
  switchLabel: {
    color: '#fff',
    fontSize: 16,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 20,
  },
})
