package com.rtpstreamer

import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.Promise
import com.arthenica.ffmpegkit.FFmpegKit
import com.arthenica.ffmpegkit.FFmpegSession

class CameraStreamerModule(private val reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {
    private var session: FFmpegSession? = null

    override fun getName() = "CameraStreamer"

    @ReactMethod
    fun startStreaming(promise: Promise) {
        // Stream the first camera to the server using H264 over RTP
        val command = "-f android_camera -video_size 640x480 -framerate 30 -i 0 -c:v libx264 -preset ultrafast -tune zerolatency -f rtp rtp://192.168.1.103:5002"
        session = FFmpegKit.executeAsync(command)
        promise.resolve(null)
    }

    @ReactMethod
    fun stopStreaming(promise: Promise) {
        session?.let { FFmpegKit.cancel(it.sessionId) }
        session = null
        promise.resolve(null)
    }
}
