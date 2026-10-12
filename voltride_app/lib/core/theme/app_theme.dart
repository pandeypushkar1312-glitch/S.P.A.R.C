import 'package:flutter/material.dart';

/// VOLTRIDE Dark Design Tokens & Luxury Electric Mobility Theme
class AppTheme {
  static const Color bgDark = Color(0xFF0B0D12);
  static const Color surface1 = Color(0xFF141821);
  static const Color surface2 = Color(0xFF1B2030);
  static const Color surface3 = Color(0xFF22293E);

  static const Color neonCyan = Color(0xFF00E5FF);
  static const Color neonViolet = Color(0xFF7C4DFF);
  static const Color success = Color(0xFF2EE6A6);
  static const Color warning = Color(0xFFFFB020);
  static const Color danger = Color(0xFFFF5470);

  static const LinearGradient primaryGradient = LinearGradient(
    colors: [neonCyan, neonViolet],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  static ThemeData get darkTheme {
    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.dark,
      scaffoldBackgroundColor: bgDark,
      colorScheme: const ColorScheme.dark(
        primary: neonCyan,
        secondary: neonViolet,
        surface: surface1,
        error: danger,
      ),
      cardTheme: CardThemeData(
        color: surface1,
        elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(24),
          side: const BorderSide(color: Color(0x14FFFFFF)),
        ),
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: neonCyan,
          foregroundColor: const Color(0xFF05060A),
          elevation: 0,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(16),
          ),
          minimumSize: const Size.fromHeight(52),
          textStyle: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
        ),
      ),
    );
  }
}
