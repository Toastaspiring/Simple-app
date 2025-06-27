import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';

late SharedPreferences prefs;

Future<void> initDb() async {
  prefs = await SharedPreferences.getInstance();
}

Future<void> createUser(String email, String password) async {
  final users = prefs.getStringList('users') ?? <String>[];
  final encoded = jsonEncode({'email': email, 'password': password});
  // Remove existing user with same email if any
  users.removeWhere((u) => jsonDecode(u)['email'] == email);
  users.add(encoded);
  await prefs.setStringList('users', users);
}

Future<Map<String, String>?> getUser(String email, String password) async {
  final users = prefs.getStringList('users') ?? <String>[];
  for (final u in users) {
    final data = jsonDecode(u) as Map<String, dynamic>;
    if (data['email'] == email && data['password'] == password) {
      return {'email': data['email'], 'password': data['password']};
    }
  }
  return null;
}
