import 'dart:io';
import 'dart:convert';

import 'package:flutter/material.dart';

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'RTP Streamer',
      theme: ThemeData(primarySwatch: Colors.blue),
      home: const StreamPage(),
    );
  }
}

class StreamPage extends StatefulWidget {
  const StreamPage({super.key});

  @override
  State<StreamPage> createState() => _StreamPageState();
}

class _StreamPageState extends State<StreamPage> {
  final TextEditingController _ipController = TextEditingController();
  final TextEditingController _portController = TextEditingController();
  Process? _ffmpegProcess;

  bool get _isStreaming => _ffmpegProcess != null;

  Future<void> _startStream() async {
    final ip = _ipController.text.trim();
    final port = _portController.text.trim();
    if (ip.isEmpty || port.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Target IP and port are required')),
      );
      return;
    }

    final args = [
      '-f',
      'dshow',
      '-i',
      'video=Integrated Camera', // Change device name as needed
      '-vcodec',
      'libx264',
      '-f',
      'rtp',
      'rtp://$ip:$port',
    ];

    try {
      final process = await Process.start('ffmpeg', args);
      setState(() {
        _ffmpegProcess = process;
      });

      process.stderr.transform(utf8.decoder).listen((data) {
        debugPrint(data);
      });
      process.stdout.transform(utf8.decoder).listen((data) {
        debugPrint(data);
      });
      process.exitCode.then((_) {
        if (mounted) {
          setState(() {
            _ffmpegProcess = null;
          });
        }
      });
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Failed to start ffmpeg: $e')),
      );
    }
  }

  void _stopStream() {
    _ffmpegProcess?.kill(ProcessSignal.sigterm);
    setState(() {
      _ffmpegProcess = null;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('RTP H264 Streamer')),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            TextField(
              controller: _ipController,
              decoration: const InputDecoration(labelText: 'Target IP'),
            ),
            TextField(
              controller: _portController,
              decoration: const InputDecoration(labelText: 'Target Port'),
              keyboardType: TextInputType.number,
            ),
            const SizedBox(height: 20),
            ElevatedButton(
              onPressed: _isStreaming ? _stopStream : _startStream,
              child: Text(_isStreaming ? 'Stop Stream' : 'Start Stream'),
            ),
          ],
        ),
      ),
    );
  }
}
