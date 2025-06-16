package com.example.rtp_streamer

import android.os.Bundle
import io.flutter.embedding.android.FlutterActivity
import org.freedesktop.gstreamer.GStreamer

class MainActivity : FlutterActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        GStreamer.init(this)
    }
}
