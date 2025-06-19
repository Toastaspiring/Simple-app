package com.rtpstreamer

import android.Manifest
import android.content.Context
import android.content.pm.PackageManager
import android.hardware.camera2.*
import android.media.MediaCodec
import android.media.MediaCodecInfo
import android.media.MediaFormat
import android.os.Handler
import android.os.HandlerThread
import android.util.Log
import android.view.Surface
import androidx.core.app.ActivityCompat
import com.facebook.react.bridge.*
import java.net.DatagramPacket
import java.net.DatagramSocket
import java.net.InetAddress

class CameraStreamerModule(private val reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext), LifecycleEventListener {

    companion object {
        private const val TAG = "CameraStreamer"
        private const val WIDTH = 640
        private const val HEIGHT = 480
        private const val FPS = 30
        private const val BITRATE = 2_000_000
        private const val RTP_HOST = "192.168.1.103"
        private const val RTP_PORT = 5002
    }

    private var cameraDevice: CameraDevice? = null
    private var captureSession: CameraCaptureSession? = null
    private var codec: MediaCodec? = null
    private var inputSurface: Surface? = null
    private var socket: DatagramSocket? = null
    private var handlerThread: HandlerThread? = null
    private var handler: Handler? = null
    private var sequenceNumber = 0
    private var rtpTimestamp = 0
    private var isStreaming = false

    init {
        reactContext.addLifecycleEventListener(this)
    }

    override fun getName() = "CameraStreamer"

    @ReactMethod
    fun startStreaming(promise: Promise) {
        if (isStreaming) {
            promise.resolve(null)
            return
        }
        if (ActivityCompat.checkSelfPermission(reactContext, Manifest.permission.CAMERA) != PackageManager.PERMISSION_GRANTED) {
            promise.reject("NO_PERMISSION", "Camera permission not granted")
            return
        }
        handlerThread = HandlerThread("CameraStreamerThread").also { it.start() }
        handler = Handler(handlerThread!!.looper)
        handler!!.post {
            try {
                socket = DatagramSocket()
                setupEncoder()
                openCamera()
                isStreaming = true
                Log.d(TAG, "Streaming started")
                promise.resolve(null)
            } catch (e: Exception) {
                Log.e(TAG, "Failed to start streaming", e)
                promise.reject("START_ERROR", e)
            }
        }
    }

    @ReactMethod
    fun stopStreaming(promise: Promise) {
        handler?.post {
            stopInternal()
            promise.resolve(null)
        } ?: run { promise.resolve(null) }
    }

    private fun stopInternal() {
        try {
            captureSession?.close()
            captureSession = null
            cameraDevice?.close()
            cameraDevice = null
            codec?.stop()
            codec?.release()
            codec = null
            inputSurface?.release()
            inputSurface = null
            socket?.close()
            socket = null
            Log.d(TAG, "Streaming stopped")
        } catch (e: Exception) {
            Log.e(TAG, "Error stopping streaming", e)
        } finally {
            handlerThread?.quitSafely()
            handlerThread = null
            handler = null
            sequenceNumber = 0
            rtpTimestamp = 0
            isStreaming = false
        }
    }

    private fun setupEncoder() {
        codec = MediaCodec.createEncoderByType("video/avc")
        val format = MediaFormat.createVideoFormat("video/avc", WIDTH, HEIGHT)
        format.setInteger(MediaFormat.KEY_COLOR_FORMAT, MediaCodecInfo.CodecCapabilities.COLOR_FormatSurface)
        format.setInteger(MediaFormat.KEY_BIT_RATE, BITRATE)
        format.setInteger(MediaFormat.KEY_FRAME_RATE, FPS)
        format.setInteger(MediaFormat.KEY_I_FRAME_INTERVAL, 1)
        codec!!.setCallback(object : MediaCodec.Callback() {
            override fun onInputBufferAvailable(mc: MediaCodec, index: Int) {}
            override fun onOutputBufferAvailable(mc: MediaCodec, index: Int, info: MediaCodec.BufferInfo) {
                val buffer = mc.getOutputBuffer(index) ?: return
                val data = ByteArray(info.size)
                buffer.get(data)
                buffer.clear()
                sendRtpPacket(data)
                mc.releaseOutputBuffer(index, false)
            }
            override fun onOutputFormatChanged(mc: MediaCodec, format: MediaFormat) {
                Log.d(TAG, "Encoder format changed: $format")
            }
            override fun onError(mc: MediaCodec, e: MediaCodec.CodecException) {
                Log.e(TAG, "Encoder error", e)
            }
        }, handler)
        codec!!.configure(format, null, null, MediaCodec.CONFIGURE_FLAG_ENCODE)
        inputSurface = codec!!.createInputSurface()
        codec!!.start()
    }

    private fun openCamera() {
        val manager = reactContext.getSystemService(Context.CAMERA_SERVICE) as CameraManager
        val cameraId = manager.cameraIdList.firstOrNull { id ->
            val chars = manager.getCameraCharacteristics(id)
            chars.get(CameraCharacteristics.LENS_FACING) == CameraCharacteristics.LENS_FACING_BACK
        } ?: manager.cameraIdList.first()
        manager.openCamera(cameraId, object : CameraDevice.StateCallback() {
            override fun onOpened(device: CameraDevice) {
                cameraDevice = device
                createSession()
            }
            override fun onDisconnected(device: CameraDevice) {
                Log.e(TAG, "Camera disconnected")
                stopInternal()
            }
            override fun onError(device: CameraDevice, error: Int) {
                Log.e(TAG, "Camera error: $error")
                stopInternal()
            }
        }, handler)
    }

    private fun createSession() {
        val device = cameraDevice ?: return
        val surface = inputSurface ?: return
        device.createCaptureSession(listOf(surface), object : CameraCaptureSession.StateCallback() {
            override fun onConfigured(session: CameraCaptureSession) {
                captureSession = session
                val request = device.createCaptureRequest(CameraDevice.TEMPLATE_RECORD).apply {
                    addTarget(surface)
                    set(CaptureRequest.CONTROL_MODE, CameraMetadata.CONTROL_MODE_AUTO)
                }
                session.setRepeatingRequest(request.build(), null, handler)
            }
            override fun onConfigureFailed(session: CameraCaptureSession) {
                Log.e(TAG, "Capture session configuration failed")
            }
        }, handler)
    }

    private fun sendRtpPacket(payload: ByteArray) {
        try {
            val header = ByteArray(12)
            header[0] = 0x80.toByte()
            header[1] = 96.toByte()
            val seq = sequenceNumber++ and 0xffff
            header[2] = (seq shr 8).toByte()
            header[3] = seq.toByte()
            header[4] = (rtpTimestamp shr 24).toByte()
            header[5] = (rtpTimestamp shr 16).toByte()
            header[6] = (rtpTimestamp shr 8).toByte()
            header[7] = rtpTimestamp.toByte()
            val ssrc = 0x12345678
            header[8] = (ssrc shr 24).toByte()
            header[9] = (ssrc shr 16).toByte()
            header[10] = (ssrc shr 8).toByte()
            header[11] = ssrc.toByte()
            rtpTimestamp += 90000 / FPS
            val data = ByteArray(header.size + payload.size)
            System.arraycopy(header, 0, data, 0, header.size)
            System.arraycopy(payload, 0, data, header.size, payload.size)
            val packet = DatagramPacket(data, data.size, InetAddress.getByName(RTP_HOST), RTP_PORT)
            socket?.send(packet)
        } catch (e: Exception) {
            Log.e(TAG, "Failed to send RTP packet", e)
        }
    }

    override fun onHostResume() {}
    override fun onHostPause() {}
    override fun onHostDestroy() {
        stopInternal()
    }
}

