# Simple RTP Streamer

This Flutter application provides a basic interface to start an RTP (H264) video
stream. It relies on the [`flutter_gstreamer_player`](https://pub.dev/packages/flutter_gstreamer_player)
package to run a GStreamer pipeline on Android, iOS and desktop. It contains two
input fields for the target IP address and port. Both values are required before
streaming.

## Installation

Follow these steps if you are new to Flutter and this project:

1. **Install Flutter** – Download and set up Flutter from the [official installation guide](https://flutter.dev/docs/get-started/install) for your operating system.
2. **Clone this repository** – `git clone <REPO_URL>` and change into the project directory.
3. **Fetch dependencies** – Run `flutter pub get` to install the required Dart packages.
4. **Add flutter_gstreamer_player** – This package provides GStreamer bindings
   for Flutter. Add `flutter_gstreamer_player: ^0.0.3` to your `pubspec.yaml`
   and run `flutter pub get`. To use GStreamer on mobile you need the prebuilt
   binaries from the [GStreamer downloads](https://gstreamer.freedesktop.org/download/).
   Link the frameworks (iOS) or native libraries (Android) as described in the
   plugin README. Android also requires initializing GStreamer in
   `MainActivity.kt`:

   ```kotlin
   class MainActivity : FlutterActivity() {
       override fun onCreate(savedInstanceState: Bundle?) {
           super.onCreate(savedInstanceState)
           GStreamer.init(this)
       }
   }
   ```
5. **Update the camera device name or input** – Edit `lib/main.dart` and adjust
   the input device used by the GStreamer pipeline.
6. **Run the app** – Connect a device or start an emulator and execute
   `flutter run` from the project root.

## Usage

Once the app is running, enter the target IP and port and press **Start Stream**.
The stream is executed via GStreamer with a pipeline similar to:

```bash
gst-launch-1.0 autovideosrc ! x264enc tune=zerolatency bitrate=800 speed-preset=superfast ! rtph264pay ! udpsink host=<IP> port=<PORT>
```

Adjust the video source element depending on your platform.

Press **Stop Stream** to terminate the process.
