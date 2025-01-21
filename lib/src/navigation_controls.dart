import 'package:flutter/material.dart';
import 'package:webview_flutter/webview_flutter.dart';

class NavigationControls extends StatelessWidget {
  const NavigationControls({required this.controller, super.key});

  final WebViewController controller;

  @override
  Widget build(BuildContext context) {
    return Row(
      children: <Widget>[
        
        IconButton(
          icon: const Icon(Icons.warning),
          onPressed: () {
            showDialog(
              context: context, // Используем context из состояния виджета
              builder: (context) => AlertDialog(
                title: Text('О приложении'),
                content: Text('Автор: Константин Кулешов\nВерсия приложения: 0.0.1'),
                actions: [
                  TextButton(
                    onPressed: () => Navigator.of(context).pop(),
                    child: Text('OK'),
                  ),
                ],
              ),
            );
          },
        ),
        IconButton(
          icon: const Icon(Icons.replay),
          onPressed: () {
            controller.reload();
          },
        ),
      ],
    );
  }
}