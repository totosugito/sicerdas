class ApiEndpoints {
  // Versioning & Sync
  static const String appLatest = '/api/app/app-latest';
  static const String periodicTable = '/api/app/periodic-table';

  // Authentication
  static const String getSession = '/api/auth/get-session';
  static const String signInSocial = '/api/auth/sign-in/social';
  static const String signOut = '/api/auth/sign-out';
  static const String signInEmail = '/api/auth/sign-in-email';
  static const String signUpEmail = '/api/auth/sign-up/email';

  // Books
  static const String listBook = '/api/book/list-book';
  static const String detailBook = '/api/book/detail-book';
  static const String bookInfo = '/api/app/book-info';
  static const String updateDownload = '/api/book/update-download';

  // Exams (Future)
  static const String listExam = '/api/exam/list-exam';
}
