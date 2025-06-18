import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:permission_handler/permission_handler.dart';

void main() => runApp(MyApp());

class MyApp extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return MaterialApp(home: HomePage());
  }
}

class HomePage extends StatefulWidget {
  @override
  _HomePageState createState() => _HomePageState();
}

class _HomePageState extends State<HomePage> {
  final ipController = TextEditingController();
  final portController = TextEditingController();

  Future<void> startStreaming() async {
    await [Permission.camera, Permission.microphone].request();
    const platform = MethodChannel('rtp.camera');
    try {
      await platform.invokeMethod('startStream', {
        'ip': ipController.text,
        'port': portController.text,
      });
    } catch (e) {
      print('Error starting stream: \$e');
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('RTP Camera Streamer')),
      body: Padding(
        padding: EdgeInsets.all(16),
        child: Column(children: [
          TextField(controller: ipController, decoration: InputDecoration(labelText: 'Target IP')),
          TextField(controller: portController, decoration: InputDecoration(labelText: 'Target Port')),
          SizedBox(height: 20),
          ElevatedButton(onPressed: startStreaming, child: Text('Start Streaming')),
        ]),
      ),
    );
  }
}
