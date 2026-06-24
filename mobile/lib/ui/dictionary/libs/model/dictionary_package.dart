class DictionaryPackage {
  final int packId;
  final String packName;
  final String packReleaseDate;
  final int packFileSize;
  final String packTitle;
  final String packSource;
  final String packDesc;
  final String packUrl;
  final List<String> packWordInfo;
  final List<String> packSampleScreen;

  DictionaryPackage({
    required this.packId,
    required this.packName,
    required this.packReleaseDate,
    required this.packFileSize,
    required this.packTitle,
    required this.packSource,
    required this.packDesc,
    required this.packUrl,
    required this.packWordInfo,
    required this.packSampleScreen,
  });

  factory DictionaryPackage.fromJson(Map<String, dynamic> json) {
    return DictionaryPackage(
      packId: json['packId'] as int,
      packName: json['packName'] as String,
      packReleaseDate: json['packReleaseDate'] as String,
      packFileSize: json['packFileSize'] as int,
      packTitle: json['packTitle'] as String,
      packSource: json['packSource'] as String,
      packDesc: json['packDesc'] as String,
      packUrl: json['packUrl'] as String,
      packWordInfo: List<String>.from(json['packWordInfo'] ?? []),
      packSampleScreen: List<String>.from(json['packSampleScreen'] ?? []),
    );
  }
}
