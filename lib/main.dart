import 'package:flutter/material.dart';
import 'package:sqflite/sqflite.dart';
import 'package:path/path.dart';
import 'src/web_view_stack.dart';
import 'package:webview_flutter/webview_flutter.dart';  

import 'src/navigation_controls.dart';  
void main() {
  runApp(MyApp());
}

class MyApp extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      home: AuthScreen(),
    );
  }
}

class AuthScreen extends StatefulWidget {
  @override
  _AuthScreenState createState() => _AuthScreenState();
}

class _AuthScreenState extends State<AuthScreen> {
  final TextEditingController _usernameController = TextEditingController();
  final TextEditingController _passwordController = TextEditingController();
  Database? _database;

  @override
  void initState() {
    super.initState();
    _initDatabase();
  }

  Future<void> _initDatabase() async {
    final dbPath = await getDatabasesPath();
    final path = join(dbPath, 'users.db');

    _database = await openDatabase(
      path,
      version: 1,
      onCreate: (db, version) {
        return db.execute(
          'CREATE TABLE users(id INTEGER PRIMARY KEY, username TEXT, password TEXT)',
        );
      },
    );
  }

  Future<void> _registerUser(String username, String password) async {
    if (_database == null) return;

    final existingUsers = await _database!.query(
      'users',
      where: 'username = ?',
      whereArgs: [username],
    );

    if (existingUsers.isNotEmpty) {
      _showMessage('Пользователь уже существует.');
      return;
    }

    await _database!.insert(
      'users',
      {'username': username, 'password': password},
    );
    _showMessage('Регистрация прошла успешно!');
  }

  Future<void> _loginUser(String username, String password) async {
    if (_database == null) return;

    final users = await _database!.query(
      'users',
      where: 'username = ? AND password = ?',
      whereArgs: [username, password],
    );

    if (users.isNotEmpty) {
      Navigator.push(
        this.context,
        MaterialPageRoute(
          builder: (context) => WebViewApp(username: username,),
        ),
      );
    } else {
      _showMessage('Неверное имя пользователя или пароль.');
    }
  }

  void _showMessage(String message) {
  showDialog(
    context: this.context, // Используем context из состояния виджета
    builder: (context) => AlertDialog(
      title: Text('Сообщение'),
      content: Text(message),
      actions: [
        TextButton(
          onPressed: () => Navigator.of(context).pop(),
          child: Text('OK'),
        ),
      ],
    ),
  );
}

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('Авторизация')),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            TextField(
              controller: _usernameController,
              decoration: InputDecoration(labelText: 'Имя пользователя'),
            ),
            TextField(
              controller: _passwordController,
              decoration: InputDecoration(labelText: 'Пароль'),
              obscureText: true,
            ),
            SizedBox(height: 20),
            Column(
              children: [
                ElevatedButton(
                  style: ElevatedButton.styleFrom(
                    minimumSize: Size(double.infinity, 50),
                    textStyle: TextStyle(fontSize: 18),
                  ),
                  onPressed: () => _registerUser(
                    _usernameController.text,
                    _passwordController.text,
                  ),
                  child: Text('Регистрация'),
                ),
                SizedBox(height: 10),
                ElevatedButton(
                  style: ElevatedButton.styleFrom(
                    minimumSize: Size(double.infinity, 50),
                    textStyle: TextStyle(fontSize: 18),
                  ),
                  onPressed: () => _loginUser(
                    _usernameController.text,
                    _passwordController.text,
                  ),
                  child: Text('Войти'),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
class WebViewApp extends StatefulWidget {
  final String username;

  const WebViewApp({Key? key, required this.username}) : super(key: key);

  @override
  State<WebViewApp> createState() => _WebViewAppState();
}

class _WebViewAppState extends State<WebViewApp> {
  late final WebViewController controller;

  @override
  void initState() {
    super.initState();
    controller = WebViewController()
      ..setJavaScriptMode(JavaScriptMode.unrestricted)
      ..loadRequest(
        Uri.parse('http://minesweeper.xx1.by/'),
      );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(widget.username),
        actions: [
          NavigationControls(controller: controller),
        ],
      ),
      body: WebViewStack(controller: controller),
    );
  }
}