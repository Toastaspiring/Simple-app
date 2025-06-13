import 'package:ffmpeg_kit_flutter/ffmpeg_kit.dart';

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
  int? _sessionId;

  bool get _isStreaming => _sessionId != null;

  Future<void> _startStream() async {
    final ip = _ipController.text.trim();
    final port = _portController.text.trim();
    if (ip.isEmpty || port.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Target IP and port are required')),
      );
      return;
    }

    final command = [
      '-f',
      'dshow',
      '-i',
      'video=Integrated Camera', // Adjust or replace for mobile inputs
      '-vcodec',
      'libx264',
      '-f',
      'rtp',
      'rtp://$ip:$port'
    ].join(' ');

    try {
      final session = await FFmpegKit.executeAsync(command, (session) async {
        if (mounted) {
          setState(() {
            _sessionId = null;
          });
        }
      });
      setState(() {
        _sessionId = session.getSessionId();
      });
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Failed to start ffmpeg: $e')),
      );
    }
  }

  void _stopStream() {
    if (_sessionId != null) {
      FFmpegKit.cancel(_sessionId);
      setState(() {
        _sessionId = null;
      });
    }
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
