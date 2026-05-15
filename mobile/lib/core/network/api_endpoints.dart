class ApiEndpoints {
  // Versioning & Sync
  static const String appLatest = '/api/version/app-latest';

  // Authentication
  static const String getSession = '/api/auth/get-session';
  static const String signInSocial = '/api/auth/sign-in/social';
  static const String signOut = '/api/auth/sign-out';
  
  // Books
  static const String listBook = '/api/book/list-book';
  static const String detailBook = '/api/book/detail-book';

  // Exams (Future)
  static const String listExam = '/api/exam/list-exam';
}
