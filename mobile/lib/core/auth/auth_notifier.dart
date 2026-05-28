import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'auth_service.dart';
import '../providers/settings_provider.dart';

final authStateProvider = NotifierProvider<AuthNotifier, bool>(AuthNotifier.new);

class AuthNotifier extends Notifier<bool> {
  @override
  bool build() {
    // 🚀 OFFLINE FIRST: Read from cache immediately
    final prefs = ref.read(sharedPreferencesProvider);
    final wasAuthenticated = prefs.getBool('is_authenticated') ?? false;
    
    // Validate in background
    checkStatus();
    
    return wasAuthenticated;
  }

  Future<void> checkStatus() async {
    final isAuthenticated = await ref.read(authServiceProvider).checkAuthStatus();
    state = isAuthenticated;
  }

  Future<void> signIn() async {
    final success = await ref.read(authServiceProvider).signInWithGoogle();
    if (success) {
      state = true;
    }
  }

  Future<bool> signInWithEmail(String email, String password) async {
    final success = await ref.read(authServiceProvider).signInWithEmailAndPassword(email, password);
    if (success) {
      state = true;
      return true;
    }
    return false;
  }

  Future<bool> signUpWithEmail(String name, String email, String password) async {
    return await ref.read(authServiceProvider).signUpWithEmailAndPassword(name, email, password);
  }

  Future<void> signOut() async {
    await ref.read(authServiceProvider).signOut();
    state = false;
  }
}
