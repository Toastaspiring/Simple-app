package com.rtpstreamer

import android.content.Context
import android.hardware.camera2.*
import android.media.MediaRecorder
import android.os.Handler
import android.os.HandlerThread
import com.facebook.react.bridge.*

class CameraStreamerModule(private val reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {
    private var cameraDevice: CameraDevice? = null
    private var captureSession: CameraCaptureSession? = null
    private var mediaRecorder: MediaRecorder? = null
    private var backgroundThread: HandlerThread? = null
    private var backgroundHandler: Handler? = null

    override fun getName() = "CameraStreamer"

    @ReactMethod
    fun startStreaming(promise: Promise) {
        val activity = currentActivity ?: run {
            promise.reject("NO_ACTIVITY", "Current activity is null")
            return
        }
        val manager = activity.getSystemService(Context.CAMERA_SERVICE) as CameraManager
        try {
            val cameraId = manager.cameraIdList.firstOrNull() ?: run {
                promise.reject("NO_CAMERA", "No camera found")
                return
            }

            startBackgroundThread()

            mediaRecorder = MediaRecorder().apply {
                setVideoSource(MediaRecorder.VideoSource.SURFACE)
                setOutputFormat(MediaRecorder.OutputFormat.MPEG_4)
                setVideoEncoder(MediaRecorder.VideoEncoder.H264)
                setVideoSize(640, 480)
                setVideoFrameRate(30)
                setVideoEncodingBitRate(1_000_000)
                setOutputFile("rtp://192.168.1.103:5002")
                prepare()
            }

            val surface = mediaRecorder!!.surface

            manager.openCamera(cameraId, object : CameraDevice.StateCallback() {
                override fun onOpened(device: CameraDevice) {
                    cameraDevice = device
                    device.createCaptureSession(listOf(surface), object : CameraCaptureSession.StateCallback() {
                        override fun onConfigured(session: CameraCaptureSession) {
                            captureSession = session
                            try {
                                val builder = device.createCaptureRequest(CameraDevice.TEMPLATE_RECORD)
                                builder.addTarget(surface)
                                session.setRepeatingRequest(builder.build(), null, backgroundHandler)
                                mediaRecorder?.start()
                                promise.resolve(null)
                            } catch (e: Exception) {
                                promise.reject("START_ERROR", e)
                            }
                        }

                        override fun onConfigureFailed(session: CameraCaptureSession) {
                            promise.reject("CONFIG_FAILED", "Configuration failed")
                        }
                    }, backgroundHandler)
                }

                override fun onDisconnected(device: CameraDevice) {
                    promise.reject("DISCONNECTED", "Camera disconnected")
                }

                override fun onError(device: CameraDevice, error: Int) {
                    promise.reject("CAMERA_ERROR", "Camera error: $error")
                }
            }, backgroundHandler)
        } catch (e: Exception) {
            promise.reject("ERROR", e)
        }
    }

    @ReactMethod
    fun stopStreaming(promise: Promise) {
        try {
            mediaRecorder?.apply {
                stop()
                reset()
                release()
            }
            captureSession?.close()
            cameraDevice?.close()
            stopBackgroundThread()
            mediaRecorder = null
            captureSession = null
            cameraDevice = null
            promise.resolve(null)
        } catch (e: Exception) {
            promise.reject("STOP_ERROR", e)
        }
    }

    private fun startBackgroundThread() {
        backgroundThread = HandlerThread("CameraBackground").also { it.start() }
        backgroundHandler = Handler(backgroundThread!!.looper)
    }

    private fun stopBackgroundThread() {
        backgroundThread?.quitSafely()
        backgroundThread = null
        backgroundHandler = null
    }
}
