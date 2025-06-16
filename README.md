# Simple RTP Streamer

This Flutter application streams the device camera to an RTP endpoint using **FFmpegKit** on Android. The UI accepts the target IP address and port then invokes a native FFmpeg command via a platform channel.

## Installation

1. **Install Flutter** – Follow the [official installation guide](https://flutter.dev/docs/get-started/install).
2. **Clone this repository** and run `flutter pub get`.
3. **Android only** – The project depends on [FFmpegKit](https://github.com/arthenica/ffmpeg-kit). No additional Flutter plugins are required.

## Usage

1. Connect an Android device or start an emulator with camera support.
2. Run `flutter run` from the project root.
3. Enter the target IP and port then tap **Start Streaming**.
4. Verify RTP packets on the destination.

Camera permission is requested at runtime. Logs can be viewed with `adb logcat` to debug the FFmpeg process.
