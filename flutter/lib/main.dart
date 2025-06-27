import 'package:flutter/material.dart';
import 'database.dart';

const Color primaryColor = Color(0xFFFF4500);
const Color secondaryColor = Color(0xFF00BFFF);

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await initDb();
  runApp(const SpixerApp());
}

class SpixerApp extends StatelessWidget {
  const SpixerApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Spixer',
      theme: ThemeData(
        primaryColor: primaryColor,
        colorScheme: ColorScheme.fromSeed(
          seedColor: primaryColor,
        ).copyWith(secondary: secondaryColor),
      ),
      home: const LoginPage(),
    );
  }
}

class LoginPage extends StatefulWidget {
  const LoginPage({super.key});

  @override
  State<LoginPage> createState() => _LoginPageState();
}

class _LoginPageState extends State<LoginPage> {
  final TextEditingController emailController = TextEditingController();
  final TextEditingController passwordController = TextEditingController();

  Future<void> _register() async {
    await createUser(emailController.text, passwordController.text);
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Registered')),
    );
  }

  Future<void> _login() async {
    final user = await getUser(emailController.text, passwordController.text);
    final msg = user == null ? 'Invalid credentials' : 'Login successful';
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(msg)),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Login')),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            TextField(
              controller: emailController,
              decoration: const InputDecoration(labelText: 'Email'),
            ),
            TextField(
              controller: passwordController,
              decoration: const InputDecoration(labelText: 'Password'),
              obscureText: true,
            ),
            const SizedBox(height: 20),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceEvenly,
              children: [
                ElevatedButton(
                  onPressed: _login,
                  child: const Text('Login'),
                ),
                ElevatedButton(
                  onPressed: _register,
                  child: const Text('Register'),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
