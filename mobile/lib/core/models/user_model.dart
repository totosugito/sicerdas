import 'dart:convert';

class UserModel {
  final String id;
  final String email;
  final String? name;
  final String? image;
  final String? role;
  final bool showAds;
  final String? tierId;
  final String? school;
  final String? educationLevel;
  final String? grade;
  final String? phone;
  final String? address;
  final String? bio;
  final String? dateOfBirth;

  UserModel({
    required this.id,
    required this.email,
    this.name,
    this.image,
    this.role,
    this.showAds = true,
    this.tierId,
    this.school,
    this.educationLevel,
    this.grade,
    this.phone,
    this.address,
    this.bio,
    this.dateOfBirth,
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
      'school': school,
      'educationLevel': educationLevel,
      'grade': grade,
      'phone': phone,
      'address': address,
      'bio': bio,
      'dateOfBirth': dateOfBirth,
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
      school: map['school'],
      educationLevel: map['educationLevel'],
      grade: map['grade'],
      phone: map['phone'],
      address: map['address'],
      bio: map['bio'],
      dateOfBirth: map['dateOfBirth'],
    );
  }

  String toJson() => json.encode(toMap());

  factory UserModel.fromJson(String source) => UserModel.fromMap(json.decode(source));
}
