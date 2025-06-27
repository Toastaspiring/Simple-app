import 'package:sqflite/sqflite.dart';
import 'package:path/path.dart';

late Database db;

Future<void> initDb() async {
  db = await openDatabase(
    join(await getDatabasesPath(), 'spixer.db'),
    onCreate: (database, version) async {
      await database.execute(
        'CREATE TABLE users(id INTEGER PRIMARY KEY AUTOINCREMENT, email TEXT UNIQUE, password TEXT)',
      );
    },
    version: 1,
  );
}

Future<void> createUser(String email, String password) async {
  await db.insert(
    'users',
    {'email': email, 'password': password},
    conflictAlgorithm: ConflictAlgorithm.replace,
  );
}

Future<Map<String, Object?>?> getUser(String email, String password) async {
  final users = await db.query(
    'users',
    where: 'email = ? AND password = ?',
    whereArgs: [email, password],
  );
  return users.isNotEmpty ? users.first : null;
}
