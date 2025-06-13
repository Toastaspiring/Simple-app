# Simple RTP Streamer

This Flutter application provides a basic interface to start an RTP (H264) video stream. It uses the [`ffmpeg_kit_flutter`](https://pub.dev/packages/ffmpeg_kit_flutter) package, making the same code work on Android, iOS and desktop platforms. It contains two input fields for the target IP address and port. Both values are required before streaming.

## Installation

Follow these steps if you are new to Flutter and this project:

1. **Install Flutter** – Download and set up Flutter from the [official installation guide](https://flutter.dev/docs/get-started/install) for your operating system.
2. **Clone this repository** – `git clone <REPO_URL>` and change into the project directory.
3. **Fetch dependencies** – Run `flutter pub get` to install the required Dart packages.
4. **Add ffmpeg_kit_flutter** – This package bundles FFmpeg for mobile. Add `ffmpeg_kit_flutter: ^6.0.3` to your `pubspec.yaml` and run `flutter pub get`.
5. **Update the camera device name or input** – Edit `lib/main.dart` and adjust the input device. For Android or iOS you may need to specify `android_camera` or `avfoundation` instead of `dshow`.
6. **Run the app** – Connect a device or start an emulator and execute `flutter run` from the project root.

## Usage

Once the app is running, enter the target IP and port and press **Start Stream**. The stream uses `ffmpeg_kit_flutter` under the hood with a command similar to:

```bash
ffmpeg -f dshow -i video=<YOUR_CAMERA> -vcodec libx264 -f rtp rtp://<IP>:<PORT>
```

On Android or iOS replace the `dshow` input with `android_camera` or `avfoundation` as appropriate.

Press **Stop Stream** to terminate the process.
