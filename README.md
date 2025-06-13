# Simple RTP Streamer

This Flutter application provides a basic interface to start an RTP (H264) video stream using an external `ffmpeg` executable. It contains two input fields for the target IP address and port. Both values are required before streaming.

## Usage

1. Install [Flutter](https://flutter.dev/docs/get-started/install) on your machine.
2. Ensure `ffmpeg` is available in your system `PATH` (for Windows you can install a pre-built package from [ffmpeg.org](https://ffmpeg.org/download.html)).
3. Update the camera device name in `lib/main.dart` (`video=Integrated Camera`) if needed.
4. Run the application with `flutter run`.

Press the **Start Stream** button to begin streaming to the provided IP and port. The stream uses the command:

```bash
ffmpeg -f dshow -i video=<YOUR_CAMERA> -vcodec libx264 -f rtp rtp://<IP>:<PORT>
```

Press **Stop Stream** to terminate the process.
