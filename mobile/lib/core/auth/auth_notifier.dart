import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'auth_service.dart';

final authStateProvider = NotifierProvider<AuthNotifier, bool>(AuthNotifier.new);

class AuthNotifier extends Notifier<bool> {
  @override
  bool build() {
    checkStatus();
    return false;
  }

  Future<void> checkStatus() async {
    state = await ref.read(authServiceProvider).checkAuthStatus();
  }

  Future<void> signIn() async {
    final success = await ref.read(authServiceProvider).signInWithGoogle();
    if (success) {
      state = true;
    }
  }

  Future<void> signOut() async {
    await ref.read(authServiceProvider).signOut();
    state = false;
  }
}
