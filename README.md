# Simple RTP Streamer

This Flutter application provides a basic interface to start an RTP (H264) video stream using an external `ffmpeg` executable. It contains two input fields for the target IP address and port. Both values are required before streaming.

## Installation

Follow these steps if you are new to Flutter and this project:

1. **Install Flutter** – Download and set up Flutter from the [official installation guide](https://flutter.dev/docs/get-started/install) for your operating system.
2. **Clone this repository** – `git clone <REPO_URL>` and change into the project directory.
3. **Fetch dependencies** – Run `flutter pub get` to install the required Dart packages.
4. **Install ffmpeg** – Make sure `ffmpeg` is available in your `PATH`. Windows users can grab a build from [ffmpeg.org](https://ffmpeg.org/download.html).
5. **Update the camera device name** – Edit `lib/main.dart` and adjust the `video=Integrated Camera` part if your webcam has a different name.
6. **Run the app** – Connect a device or start an emulator and execute `flutter run` from the project root.

## Usage

Once the app is running, enter the target IP and port and press **Start Stream**. The stream uses the command:

```bash
ffmpeg -f dshow -i video=<YOUR_CAMERA> -vcodec libx264 -f rtp rtp://<IP>:<PORT>
```

Press **Stop Stream** to terminate the process.
