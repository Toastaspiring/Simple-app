# Spixer Flutter Prototype

This repository contains a minimal [Flutter](https://flutter.dev) prototype for the Spixer project. Previous React Native and web experiments have been removed in favor of a single Flutter code base.

The app stores user credentials locally using the `shared_preferences` package so it works across all Flutter platforms. No Firebase dependencies remain.

## Getting Started

1. Install Flutter by following the instructions at [flutter.dev](https://flutter.dev/docs/get-started/install).
2. From the `flutter` directory run `flutter pub get` to install dependencies.
3. Connect a device or start an emulator and run `flutter run`.
4. Flutter supports Android, iOS, Web, Windows, macOS and Linux. Use `flutter run -d <device>` to target a specific platform.

## Theming

Primary and secondary colors are defined in `lib/main.dart` using `primaryColor` and `secondaryColor` constants (default values: `#FF4500` and `#00BFFF`). Adjust them there to change the theme.

## Project Structure

```
flutter/
  lib/
    main.dart       # App entry with a basic login interface
    database.dart   # Cross-platform helpers for simple user storage
  pubspec.yaml      # Flutter dependencies
```

This is a very small prototype meant to demonstrate a Flutter setup with SQLite. Feel free to expand it to cover the full feature set of Spixer.
