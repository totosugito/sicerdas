import 'package:dio/dio.dart';
import 'package:dio_cookie_manager/dio_cookie_manager.dart';
import 'package:cookie_jar/cookie_jar.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:path_provider/path_provider.dart';
import 'package:logger/logger.dart';
import '../config/env_config.dart';

final dioProvider = Provider<Dio>((ref) {
  throw UnimplementedError();
});

final cookieJarProvider = Provider<PersistCookieJar>((ref) {
  throw UnimplementedError();
});

Future<Dio> createDioInstance() async {
  final appDocDir = await getApplicationDocumentsDirectory();
  final cookieJar = PersistCookieJar(storage: FileStorage("${appDocDir.path}/.cookies/"));

  final dio = Dio(
    BaseOptions(
      baseUrl: EnvConfig.apiUrl,
      connectTimeout: const Duration(seconds: 10),
      receiveTimeout: const Duration(seconds: 10),
      headers: {'Content-Type': 'application/json', 'Origin': EnvConfig.apiUrl},
    ),
  );

  dio.interceptors.add(CookieManager(cookieJar));

  if (!kReleaseMode) {
    final logger = Logger(printer: PrettyPrinter(methodCount: 0));
    dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (options, handler) {
          logger.d('[${options.method}] ${options.path}');
          if (options.data != null) {
            logger.d('Payload: ${options.data}');
          }
          return handler.next(options);
        },
        onResponse: (response, handler) {
          logger.i('[${response.statusCode}] ${response.requestOptions.path}');
          if (response.data != null) {
            logger.d('Response: ${response.data}');
          }
          return handler.next(response);
        },
        onError: (DioException e, handler) {
          logger.e('[${e.response?.statusCode ?? 'ERROR'}] ${e.requestOptions.path}');
          if (e.response?.data != null) {
            logger.e('Error Data: ${e.response?.data}');
          }
          return handler.next(e);
        },
      ),
    );
  }

  return dio;
}
