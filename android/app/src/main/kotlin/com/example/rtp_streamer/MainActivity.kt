package com.example.rtp_streamer

import android.util.Log
import com.arthenica.ffmpegkit.FFmpegKit
import com.arthenica.ffmpegkit.ReturnCode
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
                startStream(ip, port, result)
            } else {
                result.notImplemented()
            }
        }
    }

    private fun startStream(ip: String, port: String, result: MethodChannel.Result) {
        val command = "-f android_camera -i 0 -vcodec libx264 -preset ultrafast -f rtp rtp://$ip:$port"
        try {
            FFmpegKit.executeAsync("-version") { session ->
                val returnCode = session.returnCode
                val output = session.allLogsAsString
                if (ReturnCode.isSuccess(returnCode)) {
                    Log.i("FFmpegKit", "Command completed successfully\n$output")
                    result.success("Streaming started")
                } else {
                    Log.e(
                        "FFmpegKit",
                        "Command failed with state ${session.state} and rc $returnCode\n$output"
                    )
                    result.error("FFmpeg", "Command failed", null)
                }
            }
        } catch (e: Exception) {
            Log.e("FFmpegKit", "Exception executing command", e)
            result.error("FFmpeg", e.localizedMessage, null)
        }
    }
}
