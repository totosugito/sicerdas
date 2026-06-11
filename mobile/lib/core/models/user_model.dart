import 'dart:convert';

class UserModel {
  final String id;
  final String email;
  final String? name;
  final String? image;
  final String? role;
  final bool showAds;
  final String? tierId;

  UserModel({
    required this.id,
    required this.email,
    this.name,
    this.image,
    this.role,
    this.showAds = true,
    this.tierId,
  });

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'email': email,
      'name': name,
      'image': image,
      'role': role,
      'showAds': showAds,
      'tierId': tierId,
    };
  }

  factory UserModel.fromMap(Map<String, dynamic> map) {
    return UserModel(
      id: map['id'] ?? '',
      email: map['email'] ?? '',
      name: map['name'],
      image: map['image'],
      role: map['role'],
      showAds: map['showAds'] ?? true,
      tierId: map['tierId'],
    );
  }

  String toJson() => json.encode(toMap());

  factory UserModel.fromJson(String source) => UserModel.fromMap(json.decode(source));
}
