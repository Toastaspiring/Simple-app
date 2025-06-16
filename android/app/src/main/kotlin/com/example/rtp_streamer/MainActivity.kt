package com.example.rtp_streamer

import com.arthenica.ffmpegkit.FFmpegKit
import io.flutter.embedding.android.FlutterActivity
import io.flutter.embedding.engine.FlutterEngine
import io.flutter.plugin.common.MethodChannel

class MainActivity: FlutterActivity() {
    private val CHANNEL = "rtp.camera"

    override fun configureFlutterEngine(flutterEngine: FlutterEngine) {
        super.configureFlutterEngine(flutterEngine)
        MethodChannel(flutterEngine.dartExecutor.binaryMessenger, CHANNEL).setMethodCallHandler { call, result ->
            if (call.method == "startStream") {
                val ip = call.argument<String>("ip")!!
                val port = call.argument<String>("port")!!
                val command = "-f android_camera -i 0 -vcodec libx264 -preset ultrafast -f rtp rtp://$ip:$port"
                FFmpegKit.executeAsync(command)
                result.success("Streaming started")
            }
        }
    }
}
