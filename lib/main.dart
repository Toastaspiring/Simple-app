import 'package:flutter_gstreamer_player/flutter_gstreamer_player.dart';

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
  GstPlayerTextureController? _controller;
  int? _playerId;

  bool get _isStreaming => _playerId != null;

  Future<void> _startStream() async {
    final ip = _ipController.text.trim();
    final port = _portController.text.trim();
    if (ip.isEmpty || port.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Target IP and port are required')),
      );
      return;
    }

    final pipeline = [
      'autovideosrc',
      '!',
      'x264enc',
      'tune=zerolatency',
      'bitrate=800',
      'speed-preset=superfast',
      '!',
      'rtph264pay',
      '!',
      'udpsink',
      'host=$ip',
      'port=$port'
    ].join(' ');

    try {
      _controller = GstPlayerTextureController();
      final id = await _controller!.initialize(pipeline);
      setState(() {
        _playerId = id;
      });
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Failed to start GStreamer: $e')),
      );
    }
  }

  void _stopStream() {
    if (_controller != null) {
      _controller!.dispose();
      setState(() {
        _controller = null;
        _playerId = null;
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
