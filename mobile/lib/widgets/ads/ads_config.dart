import 'package:flutter_riverpod/flutter_riverpod.dart';

enum AdProviderType {
  admob,
  // Future providers can be added here
  // unity,
  // appLovin,
}

final activeAdProvider = Provider<AdProviderType>((ref) {
  // Currently, only AdMob is supported and active
  return AdProviderType.admob;
});
