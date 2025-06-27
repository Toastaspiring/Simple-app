import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:spixer/main.dart';

void main() {
  testWidgets('Login page renders', (WidgetTester tester) async {
    await tester.pumpWidget(const SpixerApp());

    expect(find.text('Login'), findsWidgets);
  });
}
