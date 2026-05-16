// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'database.dart';

// ignore_for_file: type=lint
class $AppVersionsTable extends AppVersions
    with TableInfo<$AppVersionsTable, AppVersion> {
  @override
  final GeneratedDatabase attachedDatabase;
  final String? _alias;
  $AppVersionsTable(this.attachedDatabase, [this._alias]);
  static const VerificationMeta _idMeta = const VerificationMeta('id');
  @override
  late final GeneratedColumn<int> id = GeneratedColumn<int>(
    'id',
    aliasedName,
    false,
    type: DriftSqlType.int,
    requiredDuringInsert: false,
  );
  static const VerificationMeta _appVersionMeta = const VerificationMeta(
    'appVersion',
  );
  @override
  late final GeneratedColumn<int> appVersion = GeneratedColumn<int>(
    'app_version',
    aliasedName,
    false,
    type: DriftSqlType.int,
    requiredDuringInsert: true,
  );
  static const VerificationMeta _dbVersionMeta = const VerificationMeta(
    'dbVersion',
  );
  @override
  late final GeneratedColumn<int> dbVersion = GeneratedColumn<int>(
    'db_version',
    aliasedName,
    false,
    type: DriftSqlType.int,
    requiredDuringInsert: true,
  );
  static const VerificationMeta _dataTypeMeta = const VerificationMeta(
    'dataType',
  );
  @override
  late final GeneratedColumn<String> dataType = GeneratedColumn<String>(
    'data_type',
    aliasedName,
    false,
    type: DriftSqlType.string,
    requiredDuringInsert: true,
  );
  static const VerificationMeta _statusMeta = const VerificationMeta('status');
  @override
  late final GeneratedColumn<String> status = GeneratedColumn<String>(
    'status',
    aliasedName,
    false,
    type: DriftSqlType.string,
    requiredDuringInsert: true,
  );
  static const VerificationMeta _nameMeta = const VerificationMeta('name');
  @override
  late final GeneratedColumn<String> name = GeneratedColumn<String>(
    'name',
    aliasedName,
    false,
    type: DriftSqlType.string,
    requiredDuringInsert: false,
    defaultValue: const Constant(''),
  );
  static const VerificationMeta _htmlNoteMeta = const VerificationMeta(
    'htmlNote',
  );
  @override
  late final GeneratedColumn<String> htmlNote = GeneratedColumn<String>(
    'html_note',
    aliasedName,
    false,
    type: DriftSqlType.string,
    requiredDuringInsert: false,
    defaultValue: const Constant(''),
  );
  static const VerificationMeta _extraMeta = const VerificationMeta('extra');
  @override
  late final GeneratedColumn<String> extra = GeneratedColumn<String>(
    'extra',
    aliasedName,
    false,
    type: DriftSqlType.string,
    requiredDuringInsert: false,
    defaultValue: const Constant('{}'),
  );
  static const VerificationMeta _createdAtMeta = const VerificationMeta(
    'createdAt',
  );
  @override
  late final GeneratedColumn<DateTime> createdAt = GeneratedColumn<DateTime>(
    'created_at',
    aliasedName,
    false,
    type: DriftSqlType.dateTime,
    requiredDuringInsert: false,
    defaultValue: currentDateAndTime,
  );
  @override
  List<GeneratedColumn> get $columns => [
    id,
    appVersion,
    dbVersion,
    dataType,
    status,
    name,
    htmlNote,
    extra,
    createdAt,
  ];
  @override
  String get aliasedName => _alias ?? actualTableName;
  @override
  String get actualTableName => $name;
  static const String $name = 'app_versions';
  @override
  VerificationContext validateIntegrity(
    Insertable<AppVersion> instance, {
    bool isInserting = false,
  }) {
    final context = VerificationContext();
    final data = instance.toColumns(true);
    if (data.containsKey('id')) {
      context.handle(_idMeta, id.isAcceptableOrUnknown(data['id']!, _idMeta));
    }
    if (data.containsKey('app_version')) {
      context.handle(
        _appVersionMeta,
        appVersion.isAcceptableOrUnknown(data['app_version']!, _appVersionMeta),
      );
    } else if (isInserting) {
      context.missing(_appVersionMeta);
    }
    if (data.containsKey('db_version')) {
      context.handle(
        _dbVersionMeta,
        dbVersion.isAcceptableOrUnknown(data['db_version']!, _dbVersionMeta),
      );
    } else if (isInserting) {
      context.missing(_dbVersionMeta);
    }
    if (data.containsKey('data_type')) {
      context.handle(
        _dataTypeMeta,
        dataType.isAcceptableOrUnknown(data['data_type']!, _dataTypeMeta),
      );
    } else if (isInserting) {
      context.missing(_dataTypeMeta);
    }
    if (data.containsKey('status')) {
      context.handle(
        _statusMeta,
        status.isAcceptableOrUnknown(data['status']!, _statusMeta),
      );
    } else if (isInserting) {
      context.missing(_statusMeta);
    }
    if (data.containsKey('name')) {
      context.handle(
        _nameMeta,
        name.isAcceptableOrUnknown(data['name']!, _nameMeta),
      );
    }
    if (data.containsKey('html_note')) {
      context.handle(
        _htmlNoteMeta,
        htmlNote.isAcceptableOrUnknown(data['html_note']!, _htmlNoteMeta),
      );
    }
    if (data.containsKey('extra')) {
      context.handle(
        _extraMeta,
        extra.isAcceptableOrUnknown(data['extra']!, _extraMeta),
      );
    }
    if (data.containsKey('created_at')) {
      context.handle(
        _createdAtMeta,
        createdAt.isAcceptableOrUnknown(data['created_at']!, _createdAtMeta),
      );
    }
    return context;
  }

  @override
  Set<GeneratedColumn> get $primaryKey => {id};
  @override
  AppVersion map(Map<String, dynamic> data, {String? tablePrefix}) {
    final effectivePrefix = tablePrefix != null ? '$tablePrefix.' : '';
    return AppVersion(
      id: attachedDatabase.typeMapping.read(
        DriftSqlType.int,
        data['${effectivePrefix}id'],
      )!,
      appVersion: attachedDatabase.typeMapping.read(
        DriftSqlType.int,
        data['${effectivePrefix}app_version'],
      )!,
      dbVersion: attachedDatabase.typeMapping.read(
        DriftSqlType.int,
        data['${effectivePrefix}db_version'],
      )!,
      dataType: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}data_type'],
      )!,
      status: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}status'],
      )!,
      name: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}name'],
      )!,
      htmlNote: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}html_note'],
      )!,
      extra: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}extra'],
      )!,
      createdAt: attachedDatabase.typeMapping.read(
        DriftSqlType.dateTime,
        data['${effectivePrefix}created_at'],
      )!,
    );
  }

  @override
  $AppVersionsTable createAlias(String alias) {
    return $AppVersionsTable(attachedDatabase, alias);
  }
}

class AppVersion extends DataClass implements Insertable<AppVersion> {
  final int id;
  final int appVersion;
  final int dbVersion;
  final String dataType;
  final String status;
  final String name;
  final String htmlNote;
  final String extra;
  final DateTime createdAt;
  const AppVersion({
    required this.id,
    required this.appVersion,
    required this.dbVersion,
    required this.dataType,
    required this.status,
    required this.name,
    required this.htmlNote,
    required this.extra,
    required this.createdAt,
  });
  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    map['id'] = Variable<int>(id);
    map['app_version'] = Variable<int>(appVersion);
    map['db_version'] = Variable<int>(dbVersion);
    map['data_type'] = Variable<String>(dataType);
    map['status'] = Variable<String>(status);
    map['name'] = Variable<String>(name);
    map['html_note'] = Variable<String>(htmlNote);
    map['extra'] = Variable<String>(extra);
    map['created_at'] = Variable<DateTime>(createdAt);
    return map;
  }

  AppVersionsCompanion toCompanion(bool nullToAbsent) {
    return AppVersionsCompanion(
      id: Value(id),
      appVersion: Value(appVersion),
      dbVersion: Value(dbVersion),
      dataType: Value(dataType),
      status: Value(status),
      name: Value(name),
      htmlNote: Value(htmlNote),
      extra: Value(extra),
      createdAt: Value(createdAt),
    );
  }

  factory AppVersion.fromJson(
    Map<String, dynamic> json, {
    ValueSerializer? serializer,
  }) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return AppVersion(
      id: serializer.fromJson<int>(json['id']),
      appVersion: serializer.fromJson<int>(json['appVersion']),
      dbVersion: serializer.fromJson<int>(json['dbVersion']),
      dataType: serializer.fromJson<String>(json['dataType']),
      status: serializer.fromJson<String>(json['status']),
      name: serializer.fromJson<String>(json['name']),
      htmlNote: serializer.fromJson<String>(json['htmlNote']),
      extra: serializer.fromJson<String>(json['extra']),
      createdAt: serializer.fromJson<DateTime>(json['createdAt']),
    );
  }
  @override
  Map<String, dynamic> toJson({ValueSerializer? serializer}) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return <String, dynamic>{
      'id': serializer.toJson<int>(id),
      'appVersion': serializer.toJson<int>(appVersion),
      'dbVersion': serializer.toJson<int>(dbVersion),
      'dataType': serializer.toJson<String>(dataType),
      'status': serializer.toJson<String>(status),
      'name': serializer.toJson<String>(name),
      'htmlNote': serializer.toJson<String>(htmlNote),
      'extra': serializer.toJson<String>(extra),
      'createdAt': serializer.toJson<DateTime>(createdAt),
    };
  }

  AppVersion copyWith({
    int? id,
    int? appVersion,
    int? dbVersion,
    String? dataType,
    String? status,
    String? name,
    String? htmlNote,
    String? extra,
    DateTime? createdAt,
  }) => AppVersion(
    id: id ?? this.id,
    appVersion: appVersion ?? this.appVersion,
    dbVersion: dbVersion ?? this.dbVersion,
    dataType: dataType ?? this.dataType,
    status: status ?? this.status,
    name: name ?? this.name,
    htmlNote: htmlNote ?? this.htmlNote,
    extra: extra ?? this.extra,
    createdAt: createdAt ?? this.createdAt,
  );
  AppVersion copyWithCompanion(AppVersionsCompanion data) {
    return AppVersion(
      id: data.id.present ? data.id.value : this.id,
      appVersion: data.appVersion.present
          ? data.appVersion.value
          : this.appVersion,
      dbVersion: data.dbVersion.present ? data.dbVersion.value : this.dbVersion,
      dataType: data.dataType.present ? data.dataType.value : this.dataType,
      status: data.status.present ? data.status.value : this.status,
      name: data.name.present ? data.name.value : this.name,
      htmlNote: data.htmlNote.present ? data.htmlNote.value : this.htmlNote,
      extra: data.extra.present ? data.extra.value : this.extra,
      createdAt: data.createdAt.present ? data.createdAt.value : this.createdAt,
    );
  }

  @override
  String toString() {
    return (StringBuffer('AppVersion(')
          ..write('id: $id, ')
          ..write('appVersion: $appVersion, ')
          ..write('dbVersion: $dbVersion, ')
          ..write('dataType: $dataType, ')
          ..write('status: $status, ')
          ..write('name: $name, ')
          ..write('htmlNote: $htmlNote, ')
          ..write('extra: $extra, ')
          ..write('createdAt: $createdAt')
          ..write(')'))
        .toString();
  }

  @override
  int get hashCode => Object.hash(
    id,
    appVersion,
    dbVersion,
    dataType,
    status,
    name,
    htmlNote,
    extra,
    createdAt,
  );
  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      (other is AppVersion &&
          other.id == this.id &&
          other.appVersion == this.appVersion &&
          other.dbVersion == this.dbVersion &&
          other.dataType == this.dataType &&
          other.status == this.status &&
          other.name == this.name &&
          other.htmlNote == this.htmlNote &&
          other.extra == this.extra &&
          other.createdAt == this.createdAt);
}

class AppVersionsCompanion extends UpdateCompanion<AppVersion> {
  final Value<int> id;
  final Value<int> appVersion;
  final Value<int> dbVersion;
  final Value<String> dataType;
  final Value<String> status;
  final Value<String> name;
  final Value<String> htmlNote;
  final Value<String> extra;
  final Value<DateTime> createdAt;
  const AppVersionsCompanion({
    this.id = const Value.absent(),
    this.appVersion = const Value.absent(),
    this.dbVersion = const Value.absent(),
    this.dataType = const Value.absent(),
    this.status = const Value.absent(),
    this.name = const Value.absent(),
    this.htmlNote = const Value.absent(),
    this.extra = const Value.absent(),
    this.createdAt = const Value.absent(),
  });
  AppVersionsCompanion.insert({
    this.id = const Value.absent(),
    required int appVersion,
    required int dbVersion,
    required String dataType,
    required String status,
    this.name = const Value.absent(),
    this.htmlNote = const Value.absent(),
    this.extra = const Value.absent(),
    this.createdAt = const Value.absent(),
  }) : appVersion = Value(appVersion),
       dbVersion = Value(dbVersion),
       dataType = Value(dataType),
       status = Value(status);
  static Insertable<AppVersion> custom({
    Expression<int>? id,
    Expression<int>? appVersion,
    Expression<int>? dbVersion,
    Expression<String>? dataType,
    Expression<String>? status,
    Expression<String>? name,
    Expression<String>? htmlNote,
    Expression<String>? extra,
    Expression<DateTime>? createdAt,
  }) {
    return RawValuesInsertable({
      if (id != null) 'id': id,
      if (appVersion != null) 'app_version': appVersion,
      if (dbVersion != null) 'db_version': dbVersion,
      if (dataType != null) 'data_type': dataType,
      if (status != null) 'status': status,
      if (name != null) 'name': name,
      if (htmlNote != null) 'html_note': htmlNote,
      if (extra != null) 'extra': extra,
      if (createdAt != null) 'created_at': createdAt,
    });
  }

  AppVersionsCompanion copyWith({
    Value<int>? id,
    Value<int>? appVersion,
    Value<int>? dbVersion,
    Value<String>? dataType,
    Value<String>? status,
    Value<String>? name,
    Value<String>? htmlNote,
    Value<String>? extra,
    Value<DateTime>? createdAt,
  }) {
    return AppVersionsCompanion(
      id: id ?? this.id,
      appVersion: appVersion ?? this.appVersion,
      dbVersion: dbVersion ?? this.dbVersion,
      dataType: dataType ?? this.dataType,
      status: status ?? this.status,
      name: name ?? this.name,
      htmlNote: htmlNote ?? this.htmlNote,
      extra: extra ?? this.extra,
      createdAt: createdAt ?? this.createdAt,
    );
  }

  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    if (id.present) {
      map['id'] = Variable<int>(id.value);
    }
    if (appVersion.present) {
      map['app_version'] = Variable<int>(appVersion.value);
    }
    if (dbVersion.present) {
      map['db_version'] = Variable<int>(dbVersion.value);
    }
    if (dataType.present) {
      map['data_type'] = Variable<String>(dataType.value);
    }
    if (status.present) {
      map['status'] = Variable<String>(status.value);
    }
    if (name.present) {
      map['name'] = Variable<String>(name.value);
    }
    if (htmlNote.present) {
      map['html_note'] = Variable<String>(htmlNote.value);
    }
    if (extra.present) {
      map['extra'] = Variable<String>(extra.value);
    }
    if (createdAt.present) {
      map['created_at'] = Variable<DateTime>(createdAt.value);
    }
    return map;
  }

  @override
  String toString() {
    return (StringBuffer('AppVersionsCompanion(')
          ..write('id: $id, ')
          ..write('appVersion: $appVersion, ')
          ..write('dbVersion: $dbVersion, ')
          ..write('dataType: $dataType, ')
          ..write('status: $status, ')
          ..write('name: $name, ')
          ..write('htmlNote: $htmlNote, ')
          ..write('extra: $extra, ')
          ..write('createdAt: $createdAt')
          ..write(')'))
        .toString();
  }
}

class $CategoriesTable extends Categories
    with TableInfo<$CategoriesTable, Category> {
  @override
  final GeneratedDatabase attachedDatabase;
  final String? _alias;
  $CategoriesTable(this.attachedDatabase, [this._alias]);
  static const VerificationMeta _idMeta = const VerificationMeta('id');
  @override
  late final GeneratedColumn<int> id = GeneratedColumn<int>(
    'id',
    aliasedName,
    false,
    type: DriftSqlType.int,
    requiredDuringInsert: false,
  );
  static const VerificationMeta _nameMeta = const VerificationMeta('name');
  @override
  late final GeneratedColumn<String> name = GeneratedColumn<String>(
    'name',
    aliasedName,
    false,
    type: DriftSqlType.string,
    requiredDuringInsert: true,
  );
  static const VerificationMeta _keyMeta = const VerificationMeta('key');
  @override
  late final GeneratedColumn<String> key = GeneratedColumn<String>(
    'key',
    aliasedName,
    false,
    type: DriftSqlType.string,
    requiredDuringInsert: true,
  );
  static const VerificationMeta _descriptionMeta = const VerificationMeta(
    'description',
  );
  @override
  late final GeneratedColumn<String> description = GeneratedColumn<String>(
    'description',
    aliasedName,
    true,
    type: DriftSqlType.string,
    requiredDuringInsert: false,
  );
  @override
  List<GeneratedColumn> get $columns => [id, name, key, description];
  @override
  String get aliasedName => _alias ?? actualTableName;
  @override
  String get actualTableName => $name;
  static const String $name = 'categories';
  @override
  VerificationContext validateIntegrity(
    Insertable<Category> instance, {
    bool isInserting = false,
  }) {
    final context = VerificationContext();
    final data = instance.toColumns(true);
    if (data.containsKey('id')) {
      context.handle(_idMeta, id.isAcceptableOrUnknown(data['id']!, _idMeta));
    }
    if (data.containsKey('name')) {
      context.handle(
        _nameMeta,
        name.isAcceptableOrUnknown(data['name']!, _nameMeta),
      );
    } else if (isInserting) {
      context.missing(_nameMeta);
    }
    if (data.containsKey('key')) {
      context.handle(
        _keyMeta,
        key.isAcceptableOrUnknown(data['key']!, _keyMeta),
      );
    } else if (isInserting) {
      context.missing(_keyMeta);
    }
    if (data.containsKey('description')) {
      context.handle(
        _descriptionMeta,
        description.isAcceptableOrUnknown(
          data['description']!,
          _descriptionMeta,
        ),
      );
    }
    return context;
  }

  @override
  Set<GeneratedColumn> get $primaryKey => {id};
  @override
  List<Set<GeneratedColumn>> get uniqueKeys => [
    {key},
  ];
  @override
  Category map(Map<String, dynamic> data, {String? tablePrefix}) {
    final effectivePrefix = tablePrefix != null ? '$tablePrefix.' : '';
    return Category(
      id: attachedDatabase.typeMapping.read(
        DriftSqlType.int,
        data['${effectivePrefix}id'],
      )!,
      name: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}name'],
      )!,
      key: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}key'],
      )!,
      description: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}description'],
      ),
    );
  }

  @override
  $CategoriesTable createAlias(String alias) {
    return $CategoriesTable(attachedDatabase, alias);
  }
}

class Category extends DataClass implements Insertable<Category> {
  final int id;
  final String name;
  final String key;
  final String? description;
  const Category({
    required this.id,
    required this.name,
    required this.key,
    this.description,
  });
  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    map['id'] = Variable<int>(id);
    map['name'] = Variable<String>(name);
    map['key'] = Variable<String>(key);
    if (!nullToAbsent || description != null) {
      map['description'] = Variable<String>(description);
    }
    return map;
  }

  CategoriesCompanion toCompanion(bool nullToAbsent) {
    return CategoriesCompanion(
      id: Value(id),
      name: Value(name),
      key: Value(key),
      description: description == null && nullToAbsent
          ? const Value.absent()
          : Value(description),
    );
  }

  factory Category.fromJson(
    Map<String, dynamic> json, {
    ValueSerializer? serializer,
  }) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return Category(
      id: serializer.fromJson<int>(json['id']),
      name: serializer.fromJson<String>(json['name']),
      key: serializer.fromJson<String>(json['key']),
      description: serializer.fromJson<String?>(json['description']),
    );
  }
  @override
  Map<String, dynamic> toJson({ValueSerializer? serializer}) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return <String, dynamic>{
      'id': serializer.toJson<int>(id),
      'name': serializer.toJson<String>(name),
      'key': serializer.toJson<String>(key),
      'description': serializer.toJson<String?>(description),
    };
  }

  Category copyWith({
    int? id,
    String? name,
    String? key,
    Value<String?> description = const Value.absent(),
  }) => Category(
    id: id ?? this.id,
    name: name ?? this.name,
    key: key ?? this.key,
    description: description.present ? description.value : this.description,
  );
  Category copyWithCompanion(CategoriesCompanion data) {
    return Category(
      id: data.id.present ? data.id.value : this.id,
      name: data.name.present ? data.name.value : this.name,
      key: data.key.present ? data.key.value : this.key,
      description: data.description.present
          ? data.description.value
          : this.description,
    );
  }

  @override
  String toString() {
    return (StringBuffer('Category(')
          ..write('id: $id, ')
          ..write('name: $name, ')
          ..write('key: $key, ')
          ..write('description: $description')
          ..write(')'))
        .toString();
  }

  @override
  int get hashCode => Object.hash(id, name, key, description);
  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      (other is Category &&
          other.id == this.id &&
          other.name == this.name &&
          other.key == this.key &&
          other.description == this.description);
}

class CategoriesCompanion extends UpdateCompanion<Category> {
  final Value<int> id;
  final Value<String> name;
  final Value<String> key;
  final Value<String?> description;
  const CategoriesCompanion({
    this.id = const Value.absent(),
    this.name = const Value.absent(),
    this.key = const Value.absent(),
    this.description = const Value.absent(),
  });
  CategoriesCompanion.insert({
    this.id = const Value.absent(),
    required String name,
    required String key,
    this.description = const Value.absent(),
  }) : name = Value(name),
       key = Value(key);
  static Insertable<Category> custom({
    Expression<int>? id,
    Expression<String>? name,
    Expression<String>? key,
    Expression<String>? description,
  }) {
    return RawValuesInsertable({
      if (id != null) 'id': id,
      if (name != null) 'name': name,
      if (key != null) 'key': key,
      if (description != null) 'description': description,
    });
  }

  CategoriesCompanion copyWith({
    Value<int>? id,
    Value<String>? name,
    Value<String>? key,
    Value<String?>? description,
  }) {
    return CategoriesCompanion(
      id: id ?? this.id,
      name: name ?? this.name,
      key: key ?? this.key,
      description: description ?? this.description,
    );
  }

  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    if (id.present) {
      map['id'] = Variable<int>(id.value);
    }
    if (name.present) {
      map['name'] = Variable<String>(name.value);
    }
    if (key.present) {
      map['key'] = Variable<String>(key.value);
    }
    if (description.present) {
      map['description'] = Variable<String>(description.value);
    }
    return map;
  }

  @override
  String toString() {
    return (StringBuffer('CategoriesCompanion(')
          ..write('id: $id, ')
          ..write('name: $name, ')
          ..write('key: $key, ')
          ..write('description: $description')
          ..write(')'))
        .toString();
  }
}

class $BookGroupsTable extends BookGroups
    with TableInfo<$BookGroupsTable, BookGroup> {
  @override
  final GeneratedDatabase attachedDatabase;
  final String? _alias;
  $BookGroupsTable(this.attachedDatabase, [this._alias]);
  static const VerificationMeta _idMeta = const VerificationMeta('id');
  @override
  late final GeneratedColumn<int> id = GeneratedColumn<int>(
    'id',
    aliasedName,
    false,
    type: DriftSqlType.int,
    requiredDuringInsert: false,
  );
  static const VerificationMeta _versionIdMeta = const VerificationMeta(
    'versionId',
  );
  @override
  late final GeneratedColumn<int> versionId = GeneratedColumn<int>(
    'version_id',
    aliasedName,
    false,
    type: DriftSqlType.int,
    requiredDuringInsert: true,
    defaultConstraints: GeneratedColumn.constraintIsAlways(
      'REFERENCES app_versions (id)',
    ),
  );
  static const VerificationMeta _categoryIdMeta = const VerificationMeta(
    'categoryId',
  );
  @override
  late final GeneratedColumn<int> categoryId = GeneratedColumn<int>(
    'category_id',
    aliasedName,
    false,
    type: DriftSqlType.int,
    requiredDuringInsert: true,
    defaultConstraints: GeneratedColumn.constraintIsAlways(
      'REFERENCES categories (id)',
    ),
  );
  static const VerificationMeta _nameMeta = const VerificationMeta('name');
  @override
  late final GeneratedColumn<String> name = GeneratedColumn<String>(
    'name',
    aliasedName,
    false,
    type: DriftSqlType.string,
    requiredDuringInsert: true,
  );
  static const VerificationMeta _shortNameMeta = const VerificationMeta(
    'shortName',
  );
  @override
  late final GeneratedColumn<String> shortName = GeneratedColumn<String>(
    'short_name',
    aliasedName,
    false,
    type: DriftSqlType.string,
    requiredDuringInsert: true,
  );
  static const VerificationMeta _descMeta = const VerificationMeta('desc');
  @override
  late final GeneratedColumn<String> desc = GeneratedColumn<String>(
    'desc',
    aliasedName,
    true,
    type: DriftSqlType.string,
    requiredDuringInsert: false,
  );
  static const VerificationMeta _bookTotalMeta = const VerificationMeta(
    'bookTotal',
  );
  @override
  late final GeneratedColumn<int> bookTotal = GeneratedColumn<int>(
    'book_total',
    aliasedName,
    true,
    type: DriftSqlType.int,
    requiredDuringInsert: false,
  );
  @override
  List<GeneratedColumn> get $columns => [
    id,
    versionId,
    categoryId,
    name,
    shortName,
    desc,
    bookTotal,
  ];
  @override
  String get aliasedName => _alias ?? actualTableName;
  @override
  String get actualTableName => $name;
  static const String $name = 'book_groups';
  @override
  VerificationContext validateIntegrity(
    Insertable<BookGroup> instance, {
    bool isInserting = false,
  }) {
    final context = VerificationContext();
    final data = instance.toColumns(true);
    if (data.containsKey('id')) {
      context.handle(_idMeta, id.isAcceptableOrUnknown(data['id']!, _idMeta));
    }
    if (data.containsKey('version_id')) {
      context.handle(
        _versionIdMeta,
        versionId.isAcceptableOrUnknown(data['version_id']!, _versionIdMeta),
      );
    } else if (isInserting) {
      context.missing(_versionIdMeta);
    }
    if (data.containsKey('category_id')) {
      context.handle(
        _categoryIdMeta,
        categoryId.isAcceptableOrUnknown(data['category_id']!, _categoryIdMeta),
      );
    } else if (isInserting) {
      context.missing(_categoryIdMeta);
    }
    if (data.containsKey('name')) {
      context.handle(
        _nameMeta,
        name.isAcceptableOrUnknown(data['name']!, _nameMeta),
      );
    } else if (isInserting) {
      context.missing(_nameMeta);
    }
    if (data.containsKey('short_name')) {
      context.handle(
        _shortNameMeta,
        shortName.isAcceptableOrUnknown(data['short_name']!, _shortNameMeta),
      );
    } else if (isInserting) {
      context.missing(_shortNameMeta);
    }
    if (data.containsKey('desc')) {
      context.handle(
        _descMeta,
        desc.isAcceptableOrUnknown(data['desc']!, _descMeta),
      );
    }
    if (data.containsKey('book_total')) {
      context.handle(
        _bookTotalMeta,
        bookTotal.isAcceptableOrUnknown(data['book_total']!, _bookTotalMeta),
      );
    }
    return context;
  }

  @override
  Set<GeneratedColumn> get $primaryKey => {id};
  @override
  BookGroup map(Map<String, dynamic> data, {String? tablePrefix}) {
    final effectivePrefix = tablePrefix != null ? '$tablePrefix.' : '';
    return BookGroup(
      id: attachedDatabase.typeMapping.read(
        DriftSqlType.int,
        data['${effectivePrefix}id'],
      )!,
      versionId: attachedDatabase.typeMapping.read(
        DriftSqlType.int,
        data['${effectivePrefix}version_id'],
      )!,
      categoryId: attachedDatabase.typeMapping.read(
        DriftSqlType.int,
        data['${effectivePrefix}category_id'],
      )!,
      name: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}name'],
      )!,
      shortName: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}short_name'],
      )!,
      desc: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}desc'],
      ),
      bookTotal: attachedDatabase.typeMapping.read(
        DriftSqlType.int,
        data['${effectivePrefix}book_total'],
      ),
    );
  }

  @override
  $BookGroupsTable createAlias(String alias) {
    return $BookGroupsTable(attachedDatabase, alias);
  }
}

class BookGroup extends DataClass implements Insertable<BookGroup> {
  final int id;
  final int versionId;
  final int categoryId;
  final String name;
  final String shortName;
  final String? desc;
  final int? bookTotal;
  const BookGroup({
    required this.id,
    required this.versionId,
    required this.categoryId,
    required this.name,
    required this.shortName,
    this.desc,
    this.bookTotal,
  });
  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    map['id'] = Variable<int>(id);
    map['version_id'] = Variable<int>(versionId);
    map['category_id'] = Variable<int>(categoryId);
    map['name'] = Variable<String>(name);
    map['short_name'] = Variable<String>(shortName);
    if (!nullToAbsent || desc != null) {
      map['desc'] = Variable<String>(desc);
    }
    if (!nullToAbsent || bookTotal != null) {
      map['book_total'] = Variable<int>(bookTotal);
    }
    return map;
  }

  BookGroupsCompanion toCompanion(bool nullToAbsent) {
    return BookGroupsCompanion(
      id: Value(id),
      versionId: Value(versionId),
      categoryId: Value(categoryId),
      name: Value(name),
      shortName: Value(shortName),
      desc: desc == null && nullToAbsent ? const Value.absent() : Value(desc),
      bookTotal: bookTotal == null && nullToAbsent
          ? const Value.absent()
          : Value(bookTotal),
    );
  }

  factory BookGroup.fromJson(
    Map<String, dynamic> json, {
    ValueSerializer? serializer,
  }) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return BookGroup(
      id: serializer.fromJson<int>(json['id']),
      versionId: serializer.fromJson<int>(json['versionId']),
      categoryId: serializer.fromJson<int>(json['categoryId']),
      name: serializer.fromJson<String>(json['name']),
      shortName: serializer.fromJson<String>(json['shortName']),
      desc: serializer.fromJson<String?>(json['desc']),
      bookTotal: serializer.fromJson<int?>(json['bookTotal']),
    );
  }
  @override
  Map<String, dynamic> toJson({ValueSerializer? serializer}) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return <String, dynamic>{
      'id': serializer.toJson<int>(id),
      'versionId': serializer.toJson<int>(versionId),
      'categoryId': serializer.toJson<int>(categoryId),
      'name': serializer.toJson<String>(name),
      'shortName': serializer.toJson<String>(shortName),
      'desc': serializer.toJson<String?>(desc),
      'bookTotal': serializer.toJson<int?>(bookTotal),
    };
  }

  BookGroup copyWith({
    int? id,
    int? versionId,
    int? categoryId,
    String? name,
    String? shortName,
    Value<String?> desc = const Value.absent(),
    Value<int?> bookTotal = const Value.absent(),
  }) => BookGroup(
    id: id ?? this.id,
    versionId: versionId ?? this.versionId,
    categoryId: categoryId ?? this.categoryId,
    name: name ?? this.name,
    shortName: shortName ?? this.shortName,
    desc: desc.present ? desc.value : this.desc,
    bookTotal: bookTotal.present ? bookTotal.value : this.bookTotal,
  );
  BookGroup copyWithCompanion(BookGroupsCompanion data) {
    return BookGroup(
      id: data.id.present ? data.id.value : this.id,
      versionId: data.versionId.present ? data.versionId.value : this.versionId,
      categoryId: data.categoryId.present
          ? data.categoryId.value
          : this.categoryId,
      name: data.name.present ? data.name.value : this.name,
      shortName: data.shortName.present ? data.shortName.value : this.shortName,
      desc: data.desc.present ? data.desc.value : this.desc,
      bookTotal: data.bookTotal.present ? data.bookTotal.value : this.bookTotal,
    );
  }

  @override
  String toString() {
    return (StringBuffer('BookGroup(')
          ..write('id: $id, ')
          ..write('versionId: $versionId, ')
          ..write('categoryId: $categoryId, ')
          ..write('name: $name, ')
          ..write('shortName: $shortName, ')
          ..write('desc: $desc, ')
          ..write('bookTotal: $bookTotal')
          ..write(')'))
        .toString();
  }

  @override
  int get hashCode =>
      Object.hash(id, versionId, categoryId, name, shortName, desc, bookTotal);
  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      (other is BookGroup &&
          other.id == this.id &&
          other.versionId == this.versionId &&
          other.categoryId == this.categoryId &&
          other.name == this.name &&
          other.shortName == this.shortName &&
          other.desc == this.desc &&
          other.bookTotal == this.bookTotal);
}

class BookGroupsCompanion extends UpdateCompanion<BookGroup> {
  final Value<int> id;
  final Value<int> versionId;
  final Value<int> categoryId;
  final Value<String> name;
  final Value<String> shortName;
  final Value<String?> desc;
  final Value<int?> bookTotal;
  const BookGroupsCompanion({
    this.id = const Value.absent(),
    this.versionId = const Value.absent(),
    this.categoryId = const Value.absent(),
    this.name = const Value.absent(),
    this.shortName = const Value.absent(),
    this.desc = const Value.absent(),
    this.bookTotal = const Value.absent(),
  });
  BookGroupsCompanion.insert({
    this.id = const Value.absent(),
    required int versionId,
    required int categoryId,
    required String name,
    required String shortName,
    this.desc = const Value.absent(),
    this.bookTotal = const Value.absent(),
  }) : versionId = Value(versionId),
       categoryId = Value(categoryId),
       name = Value(name),
       shortName = Value(shortName);
  static Insertable<BookGroup> custom({
    Expression<int>? id,
    Expression<int>? versionId,
    Expression<int>? categoryId,
    Expression<String>? name,
    Expression<String>? shortName,
    Expression<String>? desc,
    Expression<int>? bookTotal,
  }) {
    return RawValuesInsertable({
      if (id != null) 'id': id,
      if (versionId != null) 'version_id': versionId,
      if (categoryId != null) 'category_id': categoryId,
      if (name != null) 'name': name,
      if (shortName != null) 'short_name': shortName,
      if (desc != null) 'desc': desc,
      if (bookTotal != null) 'book_total': bookTotal,
    });
  }

  BookGroupsCompanion copyWith({
    Value<int>? id,
    Value<int>? versionId,
    Value<int>? categoryId,
    Value<String>? name,
    Value<String>? shortName,
    Value<String?>? desc,
    Value<int?>? bookTotal,
  }) {
    return BookGroupsCompanion(
      id: id ?? this.id,
      versionId: versionId ?? this.versionId,
      categoryId: categoryId ?? this.categoryId,
      name: name ?? this.name,
      shortName: shortName ?? this.shortName,
      desc: desc ?? this.desc,
      bookTotal: bookTotal ?? this.bookTotal,
    );
  }

  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    if (id.present) {
      map['id'] = Variable<int>(id.value);
    }
    if (versionId.present) {
      map['version_id'] = Variable<int>(versionId.value);
    }
    if (categoryId.present) {
      map['category_id'] = Variable<int>(categoryId.value);
    }
    if (name.present) {
      map['name'] = Variable<String>(name.value);
    }
    if (shortName.present) {
      map['short_name'] = Variable<String>(shortName.value);
    }
    if (desc.present) {
      map['desc'] = Variable<String>(desc.value);
    }
    if (bookTotal.present) {
      map['book_total'] = Variable<int>(bookTotal.value);
    }
    return map;
  }

  @override
  String toString() {
    return (StringBuffer('BookGroupsCompanion(')
          ..write('id: $id, ')
          ..write('versionId: $versionId, ')
          ..write('categoryId: $categoryId, ')
          ..write('name: $name, ')
          ..write('shortName: $shortName, ')
          ..write('desc: $desc, ')
          ..write('bookTotal: $bookTotal')
          ..write(')'))
        .toString();
  }
}

class $EducationGradesTable extends EducationGrades
    with TableInfo<$EducationGradesTable, EducationGrade> {
  @override
  final GeneratedDatabase attachedDatabase;
  final String? _alias;
  $EducationGradesTable(this.attachedDatabase, [this._alias]);
  static const VerificationMeta _idMeta = const VerificationMeta('id');
  @override
  late final GeneratedColumn<int> id = GeneratedColumn<int>(
    'id',
    aliasedName,
    false,
    type: DriftSqlType.int,
    requiredDuringInsert: false,
  );
  static const VerificationMeta _gradeMeta = const VerificationMeta('grade');
  @override
  late final GeneratedColumn<String> grade = GeneratedColumn<String>(
    'grade',
    aliasedName,
    false,
    type: DriftSqlType.string,
    requiredDuringInsert: true,
  );
  static const VerificationMeta _nameMeta = const VerificationMeta('name');
  @override
  late final GeneratedColumn<String> name = GeneratedColumn<String>(
    'name',
    aliasedName,
    false,
    type: DriftSqlType.string,
    requiredDuringInsert: true,
  );
  static const VerificationMeta _descMeta = const VerificationMeta('desc');
  @override
  late final GeneratedColumn<String> desc = GeneratedColumn<String>(
    'desc',
    aliasedName,
    true,
    type: DriftSqlType.string,
    requiredDuringInsert: false,
  );
  @override
  List<GeneratedColumn> get $columns => [id, grade, name, desc];
  @override
  String get aliasedName => _alias ?? actualTableName;
  @override
  String get actualTableName => $name;
  static const String $name = 'education_grades';
  @override
  VerificationContext validateIntegrity(
    Insertable<EducationGrade> instance, {
    bool isInserting = false,
  }) {
    final context = VerificationContext();
    final data = instance.toColumns(true);
    if (data.containsKey('id')) {
      context.handle(_idMeta, id.isAcceptableOrUnknown(data['id']!, _idMeta));
    }
    if (data.containsKey('grade')) {
      context.handle(
        _gradeMeta,
        grade.isAcceptableOrUnknown(data['grade']!, _gradeMeta),
      );
    } else if (isInserting) {
      context.missing(_gradeMeta);
    }
    if (data.containsKey('name')) {
      context.handle(
        _nameMeta,
        name.isAcceptableOrUnknown(data['name']!, _nameMeta),
      );
    } else if (isInserting) {
      context.missing(_nameMeta);
    }
    if (data.containsKey('desc')) {
      context.handle(
        _descMeta,
        desc.isAcceptableOrUnknown(data['desc']!, _descMeta),
      );
    }
    return context;
  }

  @override
  Set<GeneratedColumn> get $primaryKey => {id};
  @override
  List<Set<GeneratedColumn>> get uniqueKeys => [
    {grade},
  ];
  @override
  EducationGrade map(Map<String, dynamic> data, {String? tablePrefix}) {
    final effectivePrefix = tablePrefix != null ? '$tablePrefix.' : '';
    return EducationGrade(
      id: attachedDatabase.typeMapping.read(
        DriftSqlType.int,
        data['${effectivePrefix}id'],
      )!,
      grade: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}grade'],
      )!,
      name: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}name'],
      )!,
      desc: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}desc'],
      ),
    );
  }

  @override
  $EducationGradesTable createAlias(String alias) {
    return $EducationGradesTable(attachedDatabase, alias);
  }
}

class EducationGrade extends DataClass implements Insertable<EducationGrade> {
  final int id;
  final String grade;
  final String name;
  final String? desc;
  const EducationGrade({
    required this.id,
    required this.grade,
    required this.name,
    this.desc,
  });
  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    map['id'] = Variable<int>(id);
    map['grade'] = Variable<String>(grade);
    map['name'] = Variable<String>(name);
    if (!nullToAbsent || desc != null) {
      map['desc'] = Variable<String>(desc);
    }
    return map;
  }

  EducationGradesCompanion toCompanion(bool nullToAbsent) {
    return EducationGradesCompanion(
      id: Value(id),
      grade: Value(grade),
      name: Value(name),
      desc: desc == null && nullToAbsent ? const Value.absent() : Value(desc),
    );
  }

  factory EducationGrade.fromJson(
    Map<String, dynamic> json, {
    ValueSerializer? serializer,
  }) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return EducationGrade(
      id: serializer.fromJson<int>(json['id']),
      grade: serializer.fromJson<String>(json['grade']),
      name: serializer.fromJson<String>(json['name']),
      desc: serializer.fromJson<String?>(json['desc']),
    );
  }
  @override
  Map<String, dynamic> toJson({ValueSerializer? serializer}) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return <String, dynamic>{
      'id': serializer.toJson<int>(id),
      'grade': serializer.toJson<String>(grade),
      'name': serializer.toJson<String>(name),
      'desc': serializer.toJson<String?>(desc),
    };
  }

  EducationGrade copyWith({
    int? id,
    String? grade,
    String? name,
    Value<String?> desc = const Value.absent(),
  }) => EducationGrade(
    id: id ?? this.id,
    grade: grade ?? this.grade,
    name: name ?? this.name,
    desc: desc.present ? desc.value : this.desc,
  );
  EducationGrade copyWithCompanion(EducationGradesCompanion data) {
    return EducationGrade(
      id: data.id.present ? data.id.value : this.id,
      grade: data.grade.present ? data.grade.value : this.grade,
      name: data.name.present ? data.name.value : this.name,
      desc: data.desc.present ? data.desc.value : this.desc,
    );
  }

  @override
  String toString() {
    return (StringBuffer('EducationGrade(')
          ..write('id: $id, ')
          ..write('grade: $grade, ')
          ..write('name: $name, ')
          ..write('desc: $desc')
          ..write(')'))
        .toString();
  }

  @override
  int get hashCode => Object.hash(id, grade, name, desc);
  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      (other is EducationGrade &&
          other.id == this.id &&
          other.grade == this.grade &&
          other.name == this.name &&
          other.desc == this.desc);
}

class EducationGradesCompanion extends UpdateCompanion<EducationGrade> {
  final Value<int> id;
  final Value<String> grade;
  final Value<String> name;
  final Value<String?> desc;
  const EducationGradesCompanion({
    this.id = const Value.absent(),
    this.grade = const Value.absent(),
    this.name = const Value.absent(),
    this.desc = const Value.absent(),
  });
  EducationGradesCompanion.insert({
    this.id = const Value.absent(),
    required String grade,
    required String name,
    this.desc = const Value.absent(),
  }) : grade = Value(grade),
       name = Value(name);
  static Insertable<EducationGrade> custom({
    Expression<int>? id,
    Expression<String>? grade,
    Expression<String>? name,
    Expression<String>? desc,
  }) {
    return RawValuesInsertable({
      if (id != null) 'id': id,
      if (grade != null) 'grade': grade,
      if (name != null) 'name': name,
      if (desc != null) 'desc': desc,
    });
  }

  EducationGradesCompanion copyWith({
    Value<int>? id,
    Value<String>? grade,
    Value<String>? name,
    Value<String?>? desc,
  }) {
    return EducationGradesCompanion(
      id: id ?? this.id,
      grade: grade ?? this.grade,
      name: name ?? this.name,
      desc: desc ?? this.desc,
    );
  }

  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    if (id.present) {
      map['id'] = Variable<int>(id.value);
    }
    if (grade.present) {
      map['grade'] = Variable<String>(grade.value);
    }
    if (name.present) {
      map['name'] = Variable<String>(name.value);
    }
    if (desc.present) {
      map['desc'] = Variable<String>(desc.value);
    }
    return map;
  }

  @override
  String toString() {
    return (StringBuffer('EducationGradesCompanion(')
          ..write('id: $id, ')
          ..write('grade: $grade, ')
          ..write('name: $name, ')
          ..write('desc: $desc')
          ..write(')'))
        .toString();
  }
}

class $BooksTable extends Books with TableInfo<$BooksTable, Book> {
  @override
  final GeneratedDatabase attachedDatabase;
  final String? _alias;
  $BooksTable(this.attachedDatabase, [this._alias]);
  static const VerificationMeta _idMeta = const VerificationMeta('id');
  @override
  late final GeneratedColumn<String> id = GeneratedColumn<String>(
    'id',
    aliasedName,
    false,
    type: DriftSqlType.string,
    requiredDuringInsert: true,
  );
  static const VerificationMeta _bookIdMeta = const VerificationMeta('bookId');
  @override
  late final GeneratedColumn<int> bookId = GeneratedColumn<int>(
    'book_id',
    aliasedName,
    false,
    type: DriftSqlType.int,
    requiredDuringInsert: true,
  );
  static const VerificationMeta _versionIdMeta = const VerificationMeta(
    'versionId',
  );
  @override
  late final GeneratedColumn<int> versionId = GeneratedColumn<int>(
    'version_id',
    aliasedName,
    false,
    type: DriftSqlType.int,
    requiredDuringInsert: true,
    defaultConstraints: GeneratedColumn.constraintIsAlways(
      'REFERENCES app_versions (id)',
    ),
  );
  static const VerificationMeta _titleMeta = const VerificationMeta('title');
  @override
  late final GeneratedColumn<String> title = GeneratedColumn<String>(
    'title',
    aliasedName,
    false,
    type: DriftSqlType.string,
    requiredDuringInsert: true,
  );
  static const VerificationMeta _descriptionMeta = const VerificationMeta(
    'description',
  );
  @override
  late final GeneratedColumn<String> description = GeneratedColumn<String>(
    'description',
    aliasedName,
    true,
    type: DriftSqlType.string,
    requiredDuringInsert: false,
  );
  static const VerificationMeta _authorMeta = const VerificationMeta('author');
  @override
  late final GeneratedColumn<String> author = GeneratedColumn<String>(
    'author',
    aliasedName,
    true,
    type: DriftSqlType.string,
    requiredDuringInsert: false,
  );
  static const VerificationMeta _publishedYearMeta = const VerificationMeta(
    'publishedYear',
  );
  @override
  late final GeneratedColumn<String> publishedYear = GeneratedColumn<String>(
    'published_year',
    aliasedName,
    false,
    type: DriftSqlType.string,
    requiredDuringInsert: true,
  );
  static const VerificationMeta _totalPagesMeta = const VerificationMeta(
    'totalPages',
  );
  @override
  late final GeneratedColumn<int> totalPages = GeneratedColumn<int>(
    'total_pages',
    aliasedName,
    false,
    type: DriftSqlType.int,
    requiredDuringInsert: true,
  );
  static const VerificationMeta _sizeMeta = const VerificationMeta('size');
  @override
  late final GeneratedColumn<int> size = GeneratedColumn<int>(
    'size',
    aliasedName,
    false,
    type: DriftSqlType.int,
    requiredDuringInsert: true,
  );
  static const VerificationMeta _statusMeta = const VerificationMeta('status');
  @override
  late final GeneratedColumn<String> status = GeneratedColumn<String>(
    'status',
    aliasedName,
    false,
    type: DriftSqlType.string,
    requiredDuringInsert: true,
  );
  static const VerificationMeta _bookGroupIdMeta = const VerificationMeta(
    'bookGroupId',
  );
  @override
  late final GeneratedColumn<int> bookGroupId = GeneratedColumn<int>(
    'book_group_id',
    aliasedName,
    false,
    type: DriftSqlType.int,
    requiredDuringInsert: true,
    defaultConstraints: GeneratedColumn.constraintIsAlways(
      'REFERENCES book_groups (id)',
    ),
  );
  static const VerificationMeta _educationGradeIdMeta = const VerificationMeta(
    'educationGradeId',
  );
  @override
  late final GeneratedColumn<int> educationGradeId = GeneratedColumn<int>(
    'education_grade_id',
    aliasedName,
    false,
    type: DriftSqlType.int,
    requiredDuringInsert: true,
    defaultConstraints: GeneratedColumn.constraintIsAlways(
      'REFERENCES education_grades (id)',
    ),
  );
  @override
  List<GeneratedColumn> get $columns => [
    id,
    bookId,
    versionId,
    title,
    description,
    author,
    publishedYear,
    totalPages,
    size,
    status,
    bookGroupId,
    educationGradeId,
  ];
  @override
  String get aliasedName => _alias ?? actualTableName;
  @override
  String get actualTableName => $name;
  static const String $name = 'books';
  @override
  VerificationContext validateIntegrity(
    Insertable<Book> instance, {
    bool isInserting = false,
  }) {
    final context = VerificationContext();
    final data = instance.toColumns(true);
    if (data.containsKey('id')) {
      context.handle(_idMeta, id.isAcceptableOrUnknown(data['id']!, _idMeta));
    } else if (isInserting) {
      context.missing(_idMeta);
    }
    if (data.containsKey('book_id')) {
      context.handle(
        _bookIdMeta,
        bookId.isAcceptableOrUnknown(data['book_id']!, _bookIdMeta),
      );
    } else if (isInserting) {
      context.missing(_bookIdMeta);
    }
    if (data.containsKey('version_id')) {
      context.handle(
        _versionIdMeta,
        versionId.isAcceptableOrUnknown(data['version_id']!, _versionIdMeta),
      );
    } else if (isInserting) {
      context.missing(_versionIdMeta);
    }
    if (data.containsKey('title')) {
      context.handle(
        _titleMeta,
        title.isAcceptableOrUnknown(data['title']!, _titleMeta),
      );
    } else if (isInserting) {
      context.missing(_titleMeta);
    }
    if (data.containsKey('description')) {
      context.handle(
        _descriptionMeta,
        description.isAcceptableOrUnknown(
          data['description']!,
          _descriptionMeta,
        ),
      );
    }
    if (data.containsKey('author')) {
      context.handle(
        _authorMeta,
        author.isAcceptableOrUnknown(data['author']!, _authorMeta),
      );
    }
    if (data.containsKey('published_year')) {
      context.handle(
        _publishedYearMeta,
        publishedYear.isAcceptableOrUnknown(
          data['published_year']!,
          _publishedYearMeta,
        ),
      );
    } else if (isInserting) {
      context.missing(_publishedYearMeta);
    }
    if (data.containsKey('total_pages')) {
      context.handle(
        _totalPagesMeta,
        totalPages.isAcceptableOrUnknown(data['total_pages']!, _totalPagesMeta),
      );
    } else if (isInserting) {
      context.missing(_totalPagesMeta);
    }
    if (data.containsKey('size')) {
      context.handle(
        _sizeMeta,
        size.isAcceptableOrUnknown(data['size']!, _sizeMeta),
      );
    } else if (isInserting) {
      context.missing(_sizeMeta);
    }
    if (data.containsKey('status')) {
      context.handle(
        _statusMeta,
        status.isAcceptableOrUnknown(data['status']!, _statusMeta),
      );
    } else if (isInserting) {
      context.missing(_statusMeta);
    }
    if (data.containsKey('book_group_id')) {
      context.handle(
        _bookGroupIdMeta,
        bookGroupId.isAcceptableOrUnknown(
          data['book_group_id']!,
          _bookGroupIdMeta,
        ),
      );
    } else if (isInserting) {
      context.missing(_bookGroupIdMeta);
    }
    if (data.containsKey('education_grade_id')) {
      context.handle(
        _educationGradeIdMeta,
        educationGradeId.isAcceptableOrUnknown(
          data['education_grade_id']!,
          _educationGradeIdMeta,
        ),
      );
    } else if (isInserting) {
      context.missing(_educationGradeIdMeta);
    }
    return context;
  }

  @override
  Set<GeneratedColumn> get $primaryKey => {id};
  @override
  Book map(Map<String, dynamic> data, {String? tablePrefix}) {
    final effectivePrefix = tablePrefix != null ? '$tablePrefix.' : '';
    return Book(
      id: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}id'],
      )!,
      bookId: attachedDatabase.typeMapping.read(
        DriftSqlType.int,
        data['${effectivePrefix}book_id'],
      )!,
      versionId: attachedDatabase.typeMapping.read(
        DriftSqlType.int,
        data['${effectivePrefix}version_id'],
      )!,
      title: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}title'],
      )!,
      description: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}description'],
      ),
      author: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}author'],
      ),
      publishedYear: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}published_year'],
      )!,
      totalPages: attachedDatabase.typeMapping.read(
        DriftSqlType.int,
        data['${effectivePrefix}total_pages'],
      )!,
      size: attachedDatabase.typeMapping.read(
        DriftSqlType.int,
        data['${effectivePrefix}size'],
      )!,
      status: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}status'],
      )!,
      bookGroupId: attachedDatabase.typeMapping.read(
        DriftSqlType.int,
        data['${effectivePrefix}book_group_id'],
      )!,
      educationGradeId: attachedDatabase.typeMapping.read(
        DriftSqlType.int,
        data['${effectivePrefix}education_grade_id'],
      )!,
    );
  }

  @override
  $BooksTable createAlias(String alias) {
    return $BooksTable(attachedDatabase, alias);
  }
}

class Book extends DataClass implements Insertable<Book> {
  final String id;
  final int bookId;
  final int versionId;
  final String title;
  final String? description;
  final String? author;
  final String publishedYear;
  final int totalPages;
  final int size;
  final String status;
  final int bookGroupId;
  final int educationGradeId;
  const Book({
    required this.id,
    required this.bookId,
    required this.versionId,
    required this.title,
    this.description,
    this.author,
    required this.publishedYear,
    required this.totalPages,
    required this.size,
    required this.status,
    required this.bookGroupId,
    required this.educationGradeId,
  });
  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    map['id'] = Variable<String>(id);
    map['book_id'] = Variable<int>(bookId);
    map['version_id'] = Variable<int>(versionId);
    map['title'] = Variable<String>(title);
    if (!nullToAbsent || description != null) {
      map['description'] = Variable<String>(description);
    }
    if (!nullToAbsent || author != null) {
      map['author'] = Variable<String>(author);
    }
    map['published_year'] = Variable<String>(publishedYear);
    map['total_pages'] = Variable<int>(totalPages);
    map['size'] = Variable<int>(size);
    map['status'] = Variable<String>(status);
    map['book_group_id'] = Variable<int>(bookGroupId);
    map['education_grade_id'] = Variable<int>(educationGradeId);
    return map;
  }

  BooksCompanion toCompanion(bool nullToAbsent) {
    return BooksCompanion(
      id: Value(id),
      bookId: Value(bookId),
      versionId: Value(versionId),
      title: Value(title),
      description: description == null && nullToAbsent
          ? const Value.absent()
          : Value(description),
      author: author == null && nullToAbsent
          ? const Value.absent()
          : Value(author),
      publishedYear: Value(publishedYear),
      totalPages: Value(totalPages),
      size: Value(size),
      status: Value(status),
      bookGroupId: Value(bookGroupId),
      educationGradeId: Value(educationGradeId),
    );
  }

  factory Book.fromJson(
    Map<String, dynamic> json, {
    ValueSerializer? serializer,
  }) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return Book(
      id: serializer.fromJson<String>(json['id']),
      bookId: serializer.fromJson<int>(json['bookId']),
      versionId: serializer.fromJson<int>(json['versionId']),
      title: serializer.fromJson<String>(json['title']),
      description: serializer.fromJson<String?>(json['description']),
      author: serializer.fromJson<String?>(json['author']),
      publishedYear: serializer.fromJson<String>(json['publishedYear']),
      totalPages: serializer.fromJson<int>(json['totalPages']),
      size: serializer.fromJson<int>(json['size']),
      status: serializer.fromJson<String>(json['status']),
      bookGroupId: serializer.fromJson<int>(json['bookGroupId']),
      educationGradeId: serializer.fromJson<int>(json['educationGradeId']),
    );
  }
  @override
  Map<String, dynamic> toJson({ValueSerializer? serializer}) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return <String, dynamic>{
      'id': serializer.toJson<String>(id),
      'bookId': serializer.toJson<int>(bookId),
      'versionId': serializer.toJson<int>(versionId),
      'title': serializer.toJson<String>(title),
      'description': serializer.toJson<String?>(description),
      'author': serializer.toJson<String?>(author),
      'publishedYear': serializer.toJson<String>(publishedYear),
      'totalPages': serializer.toJson<int>(totalPages),
      'size': serializer.toJson<int>(size),
      'status': serializer.toJson<String>(status),
      'bookGroupId': serializer.toJson<int>(bookGroupId),
      'educationGradeId': serializer.toJson<int>(educationGradeId),
    };
  }

  Book copyWith({
    String? id,
    int? bookId,
    int? versionId,
    String? title,
    Value<String?> description = const Value.absent(),
    Value<String?> author = const Value.absent(),
    String? publishedYear,
    int? totalPages,
    int? size,
    String? status,
    int? bookGroupId,
    int? educationGradeId,
  }) => Book(
    id: id ?? this.id,
    bookId: bookId ?? this.bookId,
    versionId: versionId ?? this.versionId,
    title: title ?? this.title,
    description: description.present ? description.value : this.description,
    author: author.present ? author.value : this.author,
    publishedYear: publishedYear ?? this.publishedYear,
    totalPages: totalPages ?? this.totalPages,
    size: size ?? this.size,
    status: status ?? this.status,
    bookGroupId: bookGroupId ?? this.bookGroupId,
    educationGradeId: educationGradeId ?? this.educationGradeId,
  );
  Book copyWithCompanion(BooksCompanion data) {
    return Book(
      id: data.id.present ? data.id.value : this.id,
      bookId: data.bookId.present ? data.bookId.value : this.bookId,
      versionId: data.versionId.present ? data.versionId.value : this.versionId,
      title: data.title.present ? data.title.value : this.title,
      description: data.description.present
          ? data.description.value
          : this.description,
      author: data.author.present ? data.author.value : this.author,
      publishedYear: data.publishedYear.present
          ? data.publishedYear.value
          : this.publishedYear,
      totalPages: data.totalPages.present
          ? data.totalPages.value
          : this.totalPages,
      size: data.size.present ? data.size.value : this.size,
      status: data.status.present ? data.status.value : this.status,
      bookGroupId: data.bookGroupId.present
          ? data.bookGroupId.value
          : this.bookGroupId,
      educationGradeId: data.educationGradeId.present
          ? data.educationGradeId.value
          : this.educationGradeId,
    );
  }

  @override
  String toString() {
    return (StringBuffer('Book(')
          ..write('id: $id, ')
          ..write('bookId: $bookId, ')
          ..write('versionId: $versionId, ')
          ..write('title: $title, ')
          ..write('description: $description, ')
          ..write('author: $author, ')
          ..write('publishedYear: $publishedYear, ')
          ..write('totalPages: $totalPages, ')
          ..write('size: $size, ')
          ..write('status: $status, ')
          ..write('bookGroupId: $bookGroupId, ')
          ..write('educationGradeId: $educationGradeId')
          ..write(')'))
        .toString();
  }

  @override
  int get hashCode => Object.hash(
    id,
    bookId,
    versionId,
    title,
    description,
    author,
    publishedYear,
    totalPages,
    size,
    status,
    bookGroupId,
    educationGradeId,
  );
  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      (other is Book &&
          other.id == this.id &&
          other.bookId == this.bookId &&
          other.versionId == this.versionId &&
          other.title == this.title &&
          other.description == this.description &&
          other.author == this.author &&
          other.publishedYear == this.publishedYear &&
          other.totalPages == this.totalPages &&
          other.size == this.size &&
          other.status == this.status &&
          other.bookGroupId == this.bookGroupId &&
          other.educationGradeId == this.educationGradeId);
}

class BooksCompanion extends UpdateCompanion<Book> {
  final Value<String> id;
  final Value<int> bookId;
  final Value<int> versionId;
  final Value<String> title;
  final Value<String?> description;
  final Value<String?> author;
  final Value<String> publishedYear;
  final Value<int> totalPages;
  final Value<int> size;
  final Value<String> status;
  final Value<int> bookGroupId;
  final Value<int> educationGradeId;
  final Value<int> rowid;
  const BooksCompanion({
    this.id = const Value.absent(),
    this.bookId = const Value.absent(),
    this.versionId = const Value.absent(),
    this.title = const Value.absent(),
    this.description = const Value.absent(),
    this.author = const Value.absent(),
    this.publishedYear = const Value.absent(),
    this.totalPages = const Value.absent(),
    this.size = const Value.absent(),
    this.status = const Value.absent(),
    this.bookGroupId = const Value.absent(),
    this.educationGradeId = const Value.absent(),
    this.rowid = const Value.absent(),
  });
  BooksCompanion.insert({
    required String id,
    required int bookId,
    required int versionId,
    required String title,
    this.description = const Value.absent(),
    this.author = const Value.absent(),
    required String publishedYear,
    required int totalPages,
    required int size,
    required String status,
    required int bookGroupId,
    required int educationGradeId,
    this.rowid = const Value.absent(),
  }) : id = Value(id),
       bookId = Value(bookId),
       versionId = Value(versionId),
       title = Value(title),
       publishedYear = Value(publishedYear),
       totalPages = Value(totalPages),
       size = Value(size),
       status = Value(status),
       bookGroupId = Value(bookGroupId),
       educationGradeId = Value(educationGradeId);
  static Insertable<Book> custom({
    Expression<String>? id,
    Expression<int>? bookId,
    Expression<int>? versionId,
    Expression<String>? title,
    Expression<String>? description,
    Expression<String>? author,
    Expression<String>? publishedYear,
    Expression<int>? totalPages,
    Expression<int>? size,
    Expression<String>? status,
    Expression<int>? bookGroupId,
    Expression<int>? educationGradeId,
    Expression<int>? rowid,
  }) {
    return RawValuesInsertable({
      if (id != null) 'id': id,
      if (bookId != null) 'book_id': bookId,
      if (versionId != null) 'version_id': versionId,
      if (title != null) 'title': title,
      if (description != null) 'description': description,
      if (author != null) 'author': author,
      if (publishedYear != null) 'published_year': publishedYear,
      if (totalPages != null) 'total_pages': totalPages,
      if (size != null) 'size': size,
      if (status != null) 'status': status,
      if (bookGroupId != null) 'book_group_id': bookGroupId,
      if (educationGradeId != null) 'education_grade_id': educationGradeId,
      if (rowid != null) 'rowid': rowid,
    });
  }

  BooksCompanion copyWith({
    Value<String>? id,
    Value<int>? bookId,
    Value<int>? versionId,
    Value<String>? title,
    Value<String?>? description,
    Value<String?>? author,
    Value<String>? publishedYear,
    Value<int>? totalPages,
    Value<int>? size,
    Value<String>? status,
    Value<int>? bookGroupId,
    Value<int>? educationGradeId,
    Value<int>? rowid,
  }) {
    return BooksCompanion(
      id: id ?? this.id,
      bookId: bookId ?? this.bookId,
      versionId: versionId ?? this.versionId,
      title: title ?? this.title,
      description: description ?? this.description,
      author: author ?? this.author,
      publishedYear: publishedYear ?? this.publishedYear,
      totalPages: totalPages ?? this.totalPages,
      size: size ?? this.size,
      status: status ?? this.status,
      bookGroupId: bookGroupId ?? this.bookGroupId,
      educationGradeId: educationGradeId ?? this.educationGradeId,
      rowid: rowid ?? this.rowid,
    );
  }

  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    if (id.present) {
      map['id'] = Variable<String>(id.value);
    }
    if (bookId.present) {
      map['book_id'] = Variable<int>(bookId.value);
    }
    if (versionId.present) {
      map['version_id'] = Variable<int>(versionId.value);
    }
    if (title.present) {
      map['title'] = Variable<String>(title.value);
    }
    if (description.present) {
      map['description'] = Variable<String>(description.value);
    }
    if (author.present) {
      map['author'] = Variable<String>(author.value);
    }
    if (publishedYear.present) {
      map['published_year'] = Variable<String>(publishedYear.value);
    }
    if (totalPages.present) {
      map['total_pages'] = Variable<int>(totalPages.value);
    }
    if (size.present) {
      map['size'] = Variable<int>(size.value);
    }
    if (status.present) {
      map['status'] = Variable<String>(status.value);
    }
    if (bookGroupId.present) {
      map['book_group_id'] = Variable<int>(bookGroupId.value);
    }
    if (educationGradeId.present) {
      map['education_grade_id'] = Variable<int>(educationGradeId.value);
    }
    if (rowid.present) {
      map['rowid'] = Variable<int>(rowid.value);
    }
    return map;
  }

  @override
  String toString() {
    return (StringBuffer('BooksCompanion(')
          ..write('id: $id, ')
          ..write('bookId: $bookId, ')
          ..write('versionId: $versionId, ')
          ..write('title: $title, ')
          ..write('description: $description, ')
          ..write('author: $author, ')
          ..write('publishedYear: $publishedYear, ')
          ..write('totalPages: $totalPages, ')
          ..write('size: $size, ')
          ..write('status: $status, ')
          ..write('bookGroupId: $bookGroupId, ')
          ..write('educationGradeId: $educationGradeId, ')
          ..write('rowid: $rowid')
          ..write(')'))
        .toString();
  }
}

abstract class _$AppDatabase extends GeneratedDatabase {
  _$AppDatabase(QueryExecutor e) : super(e);
  $AppDatabaseManager get managers => $AppDatabaseManager(this);
  late final $AppVersionsTable appVersions = $AppVersionsTable(this);
  late final $CategoriesTable categories = $CategoriesTable(this);
  late final $BookGroupsTable bookGroups = $BookGroupsTable(this);
  late final $EducationGradesTable educationGrades = $EducationGradesTable(
    this,
  );
  late final $BooksTable books = $BooksTable(this);
  late final Index booksTitleIdx = Index(
    'books_title_idx',
    'CREATE INDEX books_title_idx ON books (title)',
  );
  late final Index booksAuthorIdx = Index(
    'books_author_idx',
    'CREATE INDEX books_author_idx ON books (author)',
  );
  late final Index booksGroupIdx = Index(
    'books_group_idx',
    'CREATE INDEX books_group_idx ON books (book_group_id)',
  );
  late final Index booksGradeIdx = Index(
    'books_grade_idx',
    'CREATE INDEX books_grade_idx ON books (education_grade_id)',
  );
  late final Index booksVersionIdx = Index(
    'books_version_idx',
    'CREATE INDEX books_version_idx ON books (version_id)',
  );
  late final Index bookGroupsCategoryIdx = Index(
    'book_groups_category_idx',
    'CREATE INDEX book_groups_category_idx ON book_groups (category_id)',
  );
  late final Index bookGroupsVersionIdx = Index(
    'book_groups_version_idx',
    'CREATE INDEX book_groups_version_idx ON book_groups (version_id)',
  );
  @override
  Iterable<TableInfo<Table, Object?>> get allTables =>
      allSchemaEntities.whereType<TableInfo<Table, Object?>>();
  @override
  List<DatabaseSchemaEntity> get allSchemaEntities => [
    appVersions,
    categories,
    bookGroups,
    educationGrades,
    books,
    booksTitleIdx,
    booksAuthorIdx,
    booksGroupIdx,
    booksGradeIdx,
    booksVersionIdx,
    bookGroupsCategoryIdx,
    bookGroupsVersionIdx,
  ];
}

typedef $$AppVersionsTableCreateCompanionBuilder =
    AppVersionsCompanion Function({
      Value<int> id,
      required int appVersion,
      required int dbVersion,
      required String dataType,
      required String status,
      Value<String> name,
      Value<String> htmlNote,
      Value<String> extra,
      Value<DateTime> createdAt,
    });
typedef $$AppVersionsTableUpdateCompanionBuilder =
    AppVersionsCompanion Function({
      Value<int> id,
      Value<int> appVersion,
      Value<int> dbVersion,
      Value<String> dataType,
      Value<String> status,
      Value<String> name,
      Value<String> htmlNote,
      Value<String> extra,
      Value<DateTime> createdAt,
    });

final class $$AppVersionsTableReferences
    extends BaseReferences<_$AppDatabase, $AppVersionsTable, AppVersion> {
  $$AppVersionsTableReferences(super.$_db, super.$_table, super.$_typedResult);

  static MultiTypedResultKey<$BookGroupsTable, List<BookGroup>>
  _bookGroupsRefsTable(_$AppDatabase db) => MultiTypedResultKey.fromTable(
    db.bookGroups,
    aliasName: $_aliasNameGenerator(db.appVersions.id, db.bookGroups.versionId),
  );

  $$BookGroupsTableProcessedTableManager get bookGroupsRefs {
    final manager = $$BookGroupsTableTableManager(
      $_db,
      $_db.bookGroups,
    ).filter((f) => f.versionId.id.sqlEquals($_itemColumn<int>('id')!));

    final cache = $_typedResult.readTableOrNull(_bookGroupsRefsTable($_db));
    return ProcessedTableManager(
      manager.$state.copyWith(prefetchedData: cache),
    );
  }

  static MultiTypedResultKey<$BooksTable, List<Book>> _booksRefsTable(
    _$AppDatabase db,
  ) => MultiTypedResultKey.fromTable(
    db.books,
    aliasName: $_aliasNameGenerator(db.appVersions.id, db.books.versionId),
  );

  $$BooksTableProcessedTableManager get booksRefs {
    final manager = $$BooksTableTableManager(
      $_db,
      $_db.books,
    ).filter((f) => f.versionId.id.sqlEquals($_itemColumn<int>('id')!));

    final cache = $_typedResult.readTableOrNull(_booksRefsTable($_db));
    return ProcessedTableManager(
      manager.$state.copyWith(prefetchedData: cache),
    );
  }
}

class $$AppVersionsTableFilterComposer
    extends Composer<_$AppDatabase, $AppVersionsTable> {
  $$AppVersionsTableFilterComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  ColumnFilters<int> get id => $composableBuilder(
    column: $table.id,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<int> get appVersion => $composableBuilder(
    column: $table.appVersion,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<int> get dbVersion => $composableBuilder(
    column: $table.dbVersion,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get dataType => $composableBuilder(
    column: $table.dataType,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get status => $composableBuilder(
    column: $table.status,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get name => $composableBuilder(
    column: $table.name,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get htmlNote => $composableBuilder(
    column: $table.htmlNote,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get extra => $composableBuilder(
    column: $table.extra,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<DateTime> get createdAt => $composableBuilder(
    column: $table.createdAt,
    builder: (column) => ColumnFilters(column),
  );

  Expression<bool> bookGroupsRefs(
    Expression<bool> Function($$BookGroupsTableFilterComposer f) f,
  ) {
    final $$BookGroupsTableFilterComposer composer = $composerBuilder(
      composer: this,
      getCurrentColumn: (t) => t.id,
      referencedTable: $db.bookGroups,
      getReferencedColumn: (t) => t.versionId,
      builder:
          (
            joinBuilder, {
            $addJoinBuilderToRootComposer,
            $removeJoinBuilderFromRootComposer,
          }) => $$BookGroupsTableFilterComposer(
            $db: $db,
            $table: $db.bookGroups,
            $addJoinBuilderToRootComposer: $addJoinBuilderToRootComposer,
            joinBuilder: joinBuilder,
            $removeJoinBuilderFromRootComposer:
                $removeJoinBuilderFromRootComposer,
          ),
    );
    return f(composer);
  }

  Expression<bool> booksRefs(
    Expression<bool> Function($$BooksTableFilterComposer f) f,
  ) {
    final $$BooksTableFilterComposer composer = $composerBuilder(
      composer: this,
      getCurrentColumn: (t) => t.id,
      referencedTable: $db.books,
      getReferencedColumn: (t) => t.versionId,
      builder:
          (
            joinBuilder, {
            $addJoinBuilderToRootComposer,
            $removeJoinBuilderFromRootComposer,
          }) => $$BooksTableFilterComposer(
            $db: $db,
            $table: $db.books,
            $addJoinBuilderToRootComposer: $addJoinBuilderToRootComposer,
            joinBuilder: joinBuilder,
            $removeJoinBuilderFromRootComposer:
                $removeJoinBuilderFromRootComposer,
          ),
    );
    return f(composer);
  }
}

class $$AppVersionsTableOrderingComposer
    extends Composer<_$AppDatabase, $AppVersionsTable> {
  $$AppVersionsTableOrderingComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  ColumnOrderings<int> get id => $composableBuilder(
    column: $table.id,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<int> get appVersion => $composableBuilder(
    column: $table.appVersion,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<int> get dbVersion => $composableBuilder(
    column: $table.dbVersion,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get dataType => $composableBuilder(
    column: $table.dataType,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get status => $composableBuilder(
    column: $table.status,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get name => $composableBuilder(
    column: $table.name,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get htmlNote => $composableBuilder(
    column: $table.htmlNote,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get extra => $composableBuilder(
    column: $table.extra,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<DateTime> get createdAt => $composableBuilder(
    column: $table.createdAt,
    builder: (column) => ColumnOrderings(column),
  );
}

class $$AppVersionsTableAnnotationComposer
    extends Composer<_$AppDatabase, $AppVersionsTable> {
  $$AppVersionsTableAnnotationComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  GeneratedColumn<int> get id =>
      $composableBuilder(column: $table.id, builder: (column) => column);

  GeneratedColumn<int> get appVersion => $composableBuilder(
    column: $table.appVersion,
    builder: (column) => column,
  );

  GeneratedColumn<int> get dbVersion =>
      $composableBuilder(column: $table.dbVersion, builder: (column) => column);

  GeneratedColumn<String> get dataType =>
      $composableBuilder(column: $table.dataType, builder: (column) => column);

  GeneratedColumn<String> get status =>
      $composableBuilder(column: $table.status, builder: (column) => column);

  GeneratedColumn<String> get name =>
      $composableBuilder(column: $table.name, builder: (column) => column);

  GeneratedColumn<String> get htmlNote =>
      $composableBuilder(column: $table.htmlNote, builder: (column) => column);

  GeneratedColumn<String> get extra =>
      $composableBuilder(column: $table.extra, builder: (column) => column);

  GeneratedColumn<DateTime> get createdAt =>
      $composableBuilder(column: $table.createdAt, builder: (column) => column);

  Expression<T> bookGroupsRefs<T extends Object>(
    Expression<T> Function($$BookGroupsTableAnnotationComposer a) f,
  ) {
    final $$BookGroupsTableAnnotationComposer composer = $composerBuilder(
      composer: this,
      getCurrentColumn: (t) => t.id,
      referencedTable: $db.bookGroups,
      getReferencedColumn: (t) => t.versionId,
      builder:
          (
            joinBuilder, {
            $addJoinBuilderToRootComposer,
            $removeJoinBuilderFromRootComposer,
          }) => $$BookGroupsTableAnnotationComposer(
            $db: $db,
            $table: $db.bookGroups,
            $addJoinBuilderToRootComposer: $addJoinBuilderToRootComposer,
            joinBuilder: joinBuilder,
            $removeJoinBuilderFromRootComposer:
                $removeJoinBuilderFromRootComposer,
          ),
    );
    return f(composer);
  }

  Expression<T> booksRefs<T extends Object>(
    Expression<T> Function($$BooksTableAnnotationComposer a) f,
  ) {
    final $$BooksTableAnnotationComposer composer = $composerBuilder(
      composer: this,
      getCurrentColumn: (t) => t.id,
      referencedTable: $db.books,
      getReferencedColumn: (t) => t.versionId,
      builder:
          (
            joinBuilder, {
            $addJoinBuilderToRootComposer,
            $removeJoinBuilderFromRootComposer,
          }) => $$BooksTableAnnotationComposer(
            $db: $db,
            $table: $db.books,
            $addJoinBuilderToRootComposer: $addJoinBuilderToRootComposer,
            joinBuilder: joinBuilder,
            $removeJoinBuilderFromRootComposer:
                $removeJoinBuilderFromRootComposer,
          ),
    );
    return f(composer);
  }
}

class $$AppVersionsTableTableManager
    extends
        RootTableManager<
          _$AppDatabase,
          $AppVersionsTable,
          AppVersion,
          $$AppVersionsTableFilterComposer,
          $$AppVersionsTableOrderingComposer,
          $$AppVersionsTableAnnotationComposer,
          $$AppVersionsTableCreateCompanionBuilder,
          $$AppVersionsTableUpdateCompanionBuilder,
          (AppVersion, $$AppVersionsTableReferences),
          AppVersion,
          PrefetchHooks Function({bool bookGroupsRefs, bool booksRefs})
        > {
  $$AppVersionsTableTableManager(_$AppDatabase db, $AppVersionsTable table)
    : super(
        TableManagerState(
          db: db,
          table: table,
          createFilteringComposer: () =>
              $$AppVersionsTableFilterComposer($db: db, $table: table),
          createOrderingComposer: () =>
              $$AppVersionsTableOrderingComposer($db: db, $table: table),
          createComputedFieldComposer: () =>
              $$AppVersionsTableAnnotationComposer($db: db, $table: table),
          updateCompanionCallback:
              ({
                Value<int> id = const Value.absent(),
                Value<int> appVersion = const Value.absent(),
                Value<int> dbVersion = const Value.absent(),
                Value<String> dataType = const Value.absent(),
                Value<String> status = const Value.absent(),
                Value<String> name = const Value.absent(),
                Value<String> htmlNote = const Value.absent(),
                Value<String> extra = const Value.absent(),
                Value<DateTime> createdAt = const Value.absent(),
              }) => AppVersionsCompanion(
                id: id,
                appVersion: appVersion,
                dbVersion: dbVersion,
                dataType: dataType,
                status: status,
                name: name,
                htmlNote: htmlNote,
                extra: extra,
                createdAt: createdAt,
              ),
          createCompanionCallback:
              ({
                Value<int> id = const Value.absent(),
                required int appVersion,
                required int dbVersion,
                required String dataType,
                required String status,
                Value<String> name = const Value.absent(),
                Value<String> htmlNote = const Value.absent(),
                Value<String> extra = const Value.absent(),
                Value<DateTime> createdAt = const Value.absent(),
              }) => AppVersionsCompanion.insert(
                id: id,
                appVersion: appVersion,
                dbVersion: dbVersion,
                dataType: dataType,
                status: status,
                name: name,
                htmlNote: htmlNote,
                extra: extra,
                createdAt: createdAt,
              ),
          withReferenceMapper: (p0) => p0
              .map(
                (e) => (
                  e.readTable(table),
                  $$AppVersionsTableReferences(db, table, e),
                ),
              )
              .toList(),
          prefetchHooksCallback: ({bookGroupsRefs = false, booksRefs = false}) {
            return PrefetchHooks(
              db: db,
              explicitlyWatchedTables: [
                if (bookGroupsRefs) db.bookGroups,
                if (booksRefs) db.books,
              ],
              addJoins: null,
              getPrefetchedDataCallback: (items) async {
                return [
                  if (bookGroupsRefs)
                    await $_getPrefetchedData<
                      AppVersion,
                      $AppVersionsTable,
                      BookGroup
                    >(
                      currentTable: table,
                      referencedTable: $$AppVersionsTableReferences
                          ._bookGroupsRefsTable(db),
                      managerFromTypedResult: (p0) =>
                          $$AppVersionsTableReferences(
                            db,
                            table,
                            p0,
                          ).bookGroupsRefs,
                      referencedItemsForCurrentItem: (item, referencedItems) =>
                          referencedItems.where((e) => e.versionId == item.id),
                      typedResults: items,
                    ),
                  if (booksRefs)
                    await $_getPrefetchedData<
                      AppVersion,
                      $AppVersionsTable,
                      Book
                    >(
                      currentTable: table,
                      referencedTable: $$AppVersionsTableReferences
                          ._booksRefsTable(db),
                      managerFromTypedResult: (p0) =>
                          $$AppVersionsTableReferences(db, table, p0).booksRefs,
                      referencedItemsForCurrentItem: (item, referencedItems) =>
                          referencedItems.where((e) => e.versionId == item.id),
                      typedResults: items,
                    ),
                ];
              },
            );
          },
        ),
      );
}

typedef $$AppVersionsTableProcessedTableManager =
    ProcessedTableManager<
      _$AppDatabase,
      $AppVersionsTable,
      AppVersion,
      $$AppVersionsTableFilterComposer,
      $$AppVersionsTableOrderingComposer,
      $$AppVersionsTableAnnotationComposer,
      $$AppVersionsTableCreateCompanionBuilder,
      $$AppVersionsTableUpdateCompanionBuilder,
      (AppVersion, $$AppVersionsTableReferences),
      AppVersion,
      PrefetchHooks Function({bool bookGroupsRefs, bool booksRefs})
    >;
typedef $$CategoriesTableCreateCompanionBuilder =
    CategoriesCompanion Function({
      Value<int> id,
      required String name,
      required String key,
      Value<String?> description,
    });
typedef $$CategoriesTableUpdateCompanionBuilder =
    CategoriesCompanion Function({
      Value<int> id,
      Value<String> name,
      Value<String> key,
      Value<String?> description,
    });

final class $$CategoriesTableReferences
    extends BaseReferences<_$AppDatabase, $CategoriesTable, Category> {
  $$CategoriesTableReferences(super.$_db, super.$_table, super.$_typedResult);

  static MultiTypedResultKey<$BookGroupsTable, List<BookGroup>>
  _bookGroupsRefsTable(_$AppDatabase db) => MultiTypedResultKey.fromTable(
    db.bookGroups,
    aliasName: $_aliasNameGenerator(db.categories.id, db.bookGroups.categoryId),
  );

  $$BookGroupsTableProcessedTableManager get bookGroupsRefs {
    final manager = $$BookGroupsTableTableManager(
      $_db,
      $_db.bookGroups,
    ).filter((f) => f.categoryId.id.sqlEquals($_itemColumn<int>('id')!));

    final cache = $_typedResult.readTableOrNull(_bookGroupsRefsTable($_db));
    return ProcessedTableManager(
      manager.$state.copyWith(prefetchedData: cache),
    );
  }
}

class $$CategoriesTableFilterComposer
    extends Composer<_$AppDatabase, $CategoriesTable> {
  $$CategoriesTableFilterComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  ColumnFilters<int> get id => $composableBuilder(
    column: $table.id,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get name => $composableBuilder(
    column: $table.name,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get key => $composableBuilder(
    column: $table.key,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get description => $composableBuilder(
    column: $table.description,
    builder: (column) => ColumnFilters(column),
  );

  Expression<bool> bookGroupsRefs(
    Expression<bool> Function($$BookGroupsTableFilterComposer f) f,
  ) {
    final $$BookGroupsTableFilterComposer composer = $composerBuilder(
      composer: this,
      getCurrentColumn: (t) => t.id,
      referencedTable: $db.bookGroups,
      getReferencedColumn: (t) => t.categoryId,
      builder:
          (
            joinBuilder, {
            $addJoinBuilderToRootComposer,
            $removeJoinBuilderFromRootComposer,
          }) => $$BookGroupsTableFilterComposer(
            $db: $db,
            $table: $db.bookGroups,
            $addJoinBuilderToRootComposer: $addJoinBuilderToRootComposer,
            joinBuilder: joinBuilder,
            $removeJoinBuilderFromRootComposer:
                $removeJoinBuilderFromRootComposer,
          ),
    );
    return f(composer);
  }
}

class $$CategoriesTableOrderingComposer
    extends Composer<_$AppDatabase, $CategoriesTable> {
  $$CategoriesTableOrderingComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  ColumnOrderings<int> get id => $composableBuilder(
    column: $table.id,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get name => $composableBuilder(
    column: $table.name,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get key => $composableBuilder(
    column: $table.key,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get description => $composableBuilder(
    column: $table.description,
    builder: (column) => ColumnOrderings(column),
  );
}

class $$CategoriesTableAnnotationComposer
    extends Composer<_$AppDatabase, $CategoriesTable> {
  $$CategoriesTableAnnotationComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  GeneratedColumn<int> get id =>
      $composableBuilder(column: $table.id, builder: (column) => column);

  GeneratedColumn<String> get name =>
      $composableBuilder(column: $table.name, builder: (column) => column);

  GeneratedColumn<String> get key =>
      $composableBuilder(column: $table.key, builder: (column) => column);

  GeneratedColumn<String> get description => $composableBuilder(
    column: $table.description,
    builder: (column) => column,
  );

  Expression<T> bookGroupsRefs<T extends Object>(
    Expression<T> Function($$BookGroupsTableAnnotationComposer a) f,
  ) {
    final $$BookGroupsTableAnnotationComposer composer = $composerBuilder(
      composer: this,
      getCurrentColumn: (t) => t.id,
      referencedTable: $db.bookGroups,
      getReferencedColumn: (t) => t.categoryId,
      builder:
          (
            joinBuilder, {
            $addJoinBuilderToRootComposer,
            $removeJoinBuilderFromRootComposer,
          }) => $$BookGroupsTableAnnotationComposer(
            $db: $db,
            $table: $db.bookGroups,
            $addJoinBuilderToRootComposer: $addJoinBuilderToRootComposer,
            joinBuilder: joinBuilder,
            $removeJoinBuilderFromRootComposer:
                $removeJoinBuilderFromRootComposer,
          ),
    );
    return f(composer);
  }
}

class $$CategoriesTableTableManager
    extends
        RootTableManager<
          _$AppDatabase,
          $CategoriesTable,
          Category,
          $$CategoriesTableFilterComposer,
          $$CategoriesTableOrderingComposer,
          $$CategoriesTableAnnotationComposer,
          $$CategoriesTableCreateCompanionBuilder,
          $$CategoriesTableUpdateCompanionBuilder,
          (Category, $$CategoriesTableReferences),
          Category,
          PrefetchHooks Function({bool bookGroupsRefs})
        > {
  $$CategoriesTableTableManager(_$AppDatabase db, $CategoriesTable table)
    : super(
        TableManagerState(
          db: db,
          table: table,
          createFilteringComposer: () =>
              $$CategoriesTableFilterComposer($db: db, $table: table),
          createOrderingComposer: () =>
              $$CategoriesTableOrderingComposer($db: db, $table: table),
          createComputedFieldComposer: () =>
              $$CategoriesTableAnnotationComposer($db: db, $table: table),
          updateCompanionCallback:
              ({
                Value<int> id = const Value.absent(),
                Value<String> name = const Value.absent(),
                Value<String> key = const Value.absent(),
                Value<String?> description = const Value.absent(),
              }) => CategoriesCompanion(
                id: id,
                name: name,
                key: key,
                description: description,
              ),
          createCompanionCallback:
              ({
                Value<int> id = const Value.absent(),
                required String name,
                required String key,
                Value<String?> description = const Value.absent(),
              }) => CategoriesCompanion.insert(
                id: id,
                name: name,
                key: key,
                description: description,
              ),
          withReferenceMapper: (p0) => p0
              .map(
                (e) => (
                  e.readTable(table),
                  $$CategoriesTableReferences(db, table, e),
                ),
              )
              .toList(),
          prefetchHooksCallback: ({bookGroupsRefs = false}) {
            return PrefetchHooks(
              db: db,
              explicitlyWatchedTables: [if (bookGroupsRefs) db.bookGroups],
              addJoins: null,
              getPrefetchedDataCallback: (items) async {
                return [
                  if (bookGroupsRefs)
                    await $_getPrefetchedData<
                      Category,
                      $CategoriesTable,
                      BookGroup
                    >(
                      currentTable: table,
                      referencedTable: $$CategoriesTableReferences
                          ._bookGroupsRefsTable(db),
                      managerFromTypedResult: (p0) =>
                          $$CategoriesTableReferences(
                            db,
                            table,
                            p0,
                          ).bookGroupsRefs,
                      referencedItemsForCurrentItem: (item, referencedItems) =>
                          referencedItems.where((e) => e.categoryId == item.id),
                      typedResults: items,
                    ),
                ];
              },
            );
          },
        ),
      );
}

typedef $$CategoriesTableProcessedTableManager =
    ProcessedTableManager<
      _$AppDatabase,
      $CategoriesTable,
      Category,
      $$CategoriesTableFilterComposer,
      $$CategoriesTableOrderingComposer,
      $$CategoriesTableAnnotationComposer,
      $$CategoriesTableCreateCompanionBuilder,
      $$CategoriesTableUpdateCompanionBuilder,
      (Category, $$CategoriesTableReferences),
      Category,
      PrefetchHooks Function({bool bookGroupsRefs})
    >;
typedef $$BookGroupsTableCreateCompanionBuilder =
    BookGroupsCompanion Function({
      Value<int> id,
      required int versionId,
      required int categoryId,
      required String name,
      required String shortName,
      Value<String?> desc,
      Value<int?> bookTotal,
    });
typedef $$BookGroupsTableUpdateCompanionBuilder =
    BookGroupsCompanion Function({
      Value<int> id,
      Value<int> versionId,
      Value<int> categoryId,
      Value<String> name,
      Value<String> shortName,
      Value<String?> desc,
      Value<int?> bookTotal,
    });

final class $$BookGroupsTableReferences
    extends BaseReferences<_$AppDatabase, $BookGroupsTable, BookGroup> {
  $$BookGroupsTableReferences(super.$_db, super.$_table, super.$_typedResult);

  static $AppVersionsTable _versionIdTable(_$AppDatabase db) =>
      db.appVersions.createAlias(
        $_aliasNameGenerator(db.bookGroups.versionId, db.appVersions.id),
      );

  $$AppVersionsTableProcessedTableManager get versionId {
    final $_column = $_itemColumn<int>('version_id')!;

    final manager = $$AppVersionsTableTableManager(
      $_db,
      $_db.appVersions,
    ).filter((f) => f.id.sqlEquals($_column));
    final item = $_typedResult.readTableOrNull(_versionIdTable($_db));
    if (item == null) return manager;
    return ProcessedTableManager(
      manager.$state.copyWith(prefetchedData: [item]),
    );
  }

  static $CategoriesTable _categoryIdTable(_$AppDatabase db) =>
      db.categories.createAlias(
        $_aliasNameGenerator(db.bookGroups.categoryId, db.categories.id),
      );

  $$CategoriesTableProcessedTableManager get categoryId {
    final $_column = $_itemColumn<int>('category_id')!;

    final manager = $$CategoriesTableTableManager(
      $_db,
      $_db.categories,
    ).filter((f) => f.id.sqlEquals($_column));
    final item = $_typedResult.readTableOrNull(_categoryIdTable($_db));
    if (item == null) return manager;
    return ProcessedTableManager(
      manager.$state.copyWith(prefetchedData: [item]),
    );
  }

  static MultiTypedResultKey<$BooksTable, List<Book>> _booksRefsTable(
    _$AppDatabase db,
  ) => MultiTypedResultKey.fromTable(
    db.books,
    aliasName: $_aliasNameGenerator(db.bookGroups.id, db.books.bookGroupId),
  );

  $$BooksTableProcessedTableManager get booksRefs {
    final manager = $$BooksTableTableManager(
      $_db,
      $_db.books,
    ).filter((f) => f.bookGroupId.id.sqlEquals($_itemColumn<int>('id')!));

    final cache = $_typedResult.readTableOrNull(_booksRefsTable($_db));
    return ProcessedTableManager(
      manager.$state.copyWith(prefetchedData: cache),
    );
  }
}

class $$BookGroupsTableFilterComposer
    extends Composer<_$AppDatabase, $BookGroupsTable> {
  $$BookGroupsTableFilterComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  ColumnFilters<int> get id => $composableBuilder(
    column: $table.id,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get name => $composableBuilder(
    column: $table.name,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get shortName => $composableBuilder(
    column: $table.shortName,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get desc => $composableBuilder(
    column: $table.desc,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<int> get bookTotal => $composableBuilder(
    column: $table.bookTotal,
    builder: (column) => ColumnFilters(column),
  );

  $$AppVersionsTableFilterComposer get versionId {
    final $$AppVersionsTableFilterComposer composer = $composerBuilder(
      composer: this,
      getCurrentColumn: (t) => t.versionId,
      referencedTable: $db.appVersions,
      getReferencedColumn: (t) => t.id,
      builder:
          (
            joinBuilder, {
            $addJoinBuilderToRootComposer,
            $removeJoinBuilderFromRootComposer,
          }) => $$AppVersionsTableFilterComposer(
            $db: $db,
            $table: $db.appVersions,
            $addJoinBuilderToRootComposer: $addJoinBuilderToRootComposer,
            joinBuilder: joinBuilder,
            $removeJoinBuilderFromRootComposer:
                $removeJoinBuilderFromRootComposer,
          ),
    );
    return composer;
  }

  $$CategoriesTableFilterComposer get categoryId {
    final $$CategoriesTableFilterComposer composer = $composerBuilder(
      composer: this,
      getCurrentColumn: (t) => t.categoryId,
      referencedTable: $db.categories,
      getReferencedColumn: (t) => t.id,
      builder:
          (
            joinBuilder, {
            $addJoinBuilderToRootComposer,
            $removeJoinBuilderFromRootComposer,
          }) => $$CategoriesTableFilterComposer(
            $db: $db,
            $table: $db.categories,
            $addJoinBuilderToRootComposer: $addJoinBuilderToRootComposer,
            joinBuilder: joinBuilder,
            $removeJoinBuilderFromRootComposer:
                $removeJoinBuilderFromRootComposer,
          ),
    );
    return composer;
  }

  Expression<bool> booksRefs(
    Expression<bool> Function($$BooksTableFilterComposer f) f,
  ) {
    final $$BooksTableFilterComposer composer = $composerBuilder(
      composer: this,
      getCurrentColumn: (t) => t.id,
      referencedTable: $db.books,
      getReferencedColumn: (t) => t.bookGroupId,
      builder:
          (
            joinBuilder, {
            $addJoinBuilderToRootComposer,
            $removeJoinBuilderFromRootComposer,
          }) => $$BooksTableFilterComposer(
            $db: $db,
            $table: $db.books,
            $addJoinBuilderToRootComposer: $addJoinBuilderToRootComposer,
            joinBuilder: joinBuilder,
            $removeJoinBuilderFromRootComposer:
                $removeJoinBuilderFromRootComposer,
          ),
    );
    return f(composer);
  }
}

class $$BookGroupsTableOrderingComposer
    extends Composer<_$AppDatabase, $BookGroupsTable> {
  $$BookGroupsTableOrderingComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  ColumnOrderings<int> get id => $composableBuilder(
    column: $table.id,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get name => $composableBuilder(
    column: $table.name,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get shortName => $composableBuilder(
    column: $table.shortName,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get desc => $composableBuilder(
    column: $table.desc,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<int> get bookTotal => $composableBuilder(
    column: $table.bookTotal,
    builder: (column) => ColumnOrderings(column),
  );

  $$AppVersionsTableOrderingComposer get versionId {
    final $$AppVersionsTableOrderingComposer composer = $composerBuilder(
      composer: this,
      getCurrentColumn: (t) => t.versionId,
      referencedTable: $db.appVersions,
      getReferencedColumn: (t) => t.id,
      builder:
          (
            joinBuilder, {
            $addJoinBuilderToRootComposer,
            $removeJoinBuilderFromRootComposer,
          }) => $$AppVersionsTableOrderingComposer(
            $db: $db,
            $table: $db.appVersions,
            $addJoinBuilderToRootComposer: $addJoinBuilderToRootComposer,
            joinBuilder: joinBuilder,
            $removeJoinBuilderFromRootComposer:
                $removeJoinBuilderFromRootComposer,
          ),
    );
    return composer;
  }

  $$CategoriesTableOrderingComposer get categoryId {
    final $$CategoriesTableOrderingComposer composer = $composerBuilder(
      composer: this,
      getCurrentColumn: (t) => t.categoryId,
      referencedTable: $db.categories,
      getReferencedColumn: (t) => t.id,
      builder:
          (
            joinBuilder, {
            $addJoinBuilderToRootComposer,
            $removeJoinBuilderFromRootComposer,
          }) => $$CategoriesTableOrderingComposer(
            $db: $db,
            $table: $db.categories,
            $addJoinBuilderToRootComposer: $addJoinBuilderToRootComposer,
            joinBuilder: joinBuilder,
            $removeJoinBuilderFromRootComposer:
                $removeJoinBuilderFromRootComposer,
          ),
    );
    return composer;
  }
}

class $$BookGroupsTableAnnotationComposer
    extends Composer<_$AppDatabase, $BookGroupsTable> {
  $$BookGroupsTableAnnotationComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  GeneratedColumn<int> get id =>
      $composableBuilder(column: $table.id, builder: (column) => column);

  GeneratedColumn<String> get name =>
      $composableBuilder(column: $table.name, builder: (column) => column);

  GeneratedColumn<String> get shortName =>
      $composableBuilder(column: $table.shortName, builder: (column) => column);

  GeneratedColumn<String> get desc =>
      $composableBuilder(column: $table.desc, builder: (column) => column);

  GeneratedColumn<int> get bookTotal =>
      $composableBuilder(column: $table.bookTotal, builder: (column) => column);

  $$AppVersionsTableAnnotationComposer get versionId {
    final $$AppVersionsTableAnnotationComposer composer = $composerBuilder(
      composer: this,
      getCurrentColumn: (t) => t.versionId,
      referencedTable: $db.appVersions,
      getReferencedColumn: (t) => t.id,
      builder:
          (
            joinBuilder, {
            $addJoinBuilderToRootComposer,
            $removeJoinBuilderFromRootComposer,
          }) => $$AppVersionsTableAnnotationComposer(
            $db: $db,
            $table: $db.appVersions,
            $addJoinBuilderToRootComposer: $addJoinBuilderToRootComposer,
            joinBuilder: joinBuilder,
            $removeJoinBuilderFromRootComposer:
                $removeJoinBuilderFromRootComposer,
          ),
    );
    return composer;
  }

  $$CategoriesTableAnnotationComposer get categoryId {
    final $$CategoriesTableAnnotationComposer composer = $composerBuilder(
      composer: this,
      getCurrentColumn: (t) => t.categoryId,
      referencedTable: $db.categories,
      getReferencedColumn: (t) => t.id,
      builder:
          (
            joinBuilder, {
            $addJoinBuilderToRootComposer,
            $removeJoinBuilderFromRootComposer,
          }) => $$CategoriesTableAnnotationComposer(
            $db: $db,
            $table: $db.categories,
            $addJoinBuilderToRootComposer: $addJoinBuilderToRootComposer,
            joinBuilder: joinBuilder,
            $removeJoinBuilderFromRootComposer:
                $removeJoinBuilderFromRootComposer,
          ),
    );
    return composer;
  }

  Expression<T> booksRefs<T extends Object>(
    Expression<T> Function($$BooksTableAnnotationComposer a) f,
  ) {
    final $$BooksTableAnnotationComposer composer = $composerBuilder(
      composer: this,
      getCurrentColumn: (t) => t.id,
      referencedTable: $db.books,
      getReferencedColumn: (t) => t.bookGroupId,
      builder:
          (
            joinBuilder, {
            $addJoinBuilderToRootComposer,
            $removeJoinBuilderFromRootComposer,
          }) => $$BooksTableAnnotationComposer(
            $db: $db,
            $table: $db.books,
            $addJoinBuilderToRootComposer: $addJoinBuilderToRootComposer,
            joinBuilder: joinBuilder,
            $removeJoinBuilderFromRootComposer:
                $removeJoinBuilderFromRootComposer,
          ),
    );
    return f(composer);
  }
}

class $$BookGroupsTableTableManager
    extends
        RootTableManager<
          _$AppDatabase,
          $BookGroupsTable,
          BookGroup,
          $$BookGroupsTableFilterComposer,
          $$BookGroupsTableOrderingComposer,
          $$BookGroupsTableAnnotationComposer,
          $$BookGroupsTableCreateCompanionBuilder,
          $$BookGroupsTableUpdateCompanionBuilder,
          (BookGroup, $$BookGroupsTableReferences),
          BookGroup,
          PrefetchHooks Function({
            bool versionId,
            bool categoryId,
            bool booksRefs,
          })
        > {
  $$BookGroupsTableTableManager(_$AppDatabase db, $BookGroupsTable table)
    : super(
        TableManagerState(
          db: db,
          table: table,
          createFilteringComposer: () =>
              $$BookGroupsTableFilterComposer($db: db, $table: table),
          createOrderingComposer: () =>
              $$BookGroupsTableOrderingComposer($db: db, $table: table),
          createComputedFieldComposer: () =>
              $$BookGroupsTableAnnotationComposer($db: db, $table: table),
          updateCompanionCallback:
              ({
                Value<int> id = const Value.absent(),
                Value<int> versionId = const Value.absent(),
                Value<int> categoryId = const Value.absent(),
                Value<String> name = const Value.absent(),
                Value<String> shortName = const Value.absent(),
                Value<String?> desc = const Value.absent(),
                Value<int?> bookTotal = const Value.absent(),
              }) => BookGroupsCompanion(
                id: id,
                versionId: versionId,
                categoryId: categoryId,
                name: name,
                shortName: shortName,
                desc: desc,
                bookTotal: bookTotal,
              ),
          createCompanionCallback:
              ({
                Value<int> id = const Value.absent(),
                required int versionId,
                required int categoryId,
                required String name,
                required String shortName,
                Value<String?> desc = const Value.absent(),
                Value<int?> bookTotal = const Value.absent(),
              }) => BookGroupsCompanion.insert(
                id: id,
                versionId: versionId,
                categoryId: categoryId,
                name: name,
                shortName: shortName,
                desc: desc,
                bookTotal: bookTotal,
              ),
          withReferenceMapper: (p0) => p0
              .map(
                (e) => (
                  e.readTable(table),
                  $$BookGroupsTableReferences(db, table, e),
                ),
              )
              .toList(),
          prefetchHooksCallback:
              ({versionId = false, categoryId = false, booksRefs = false}) {
                return PrefetchHooks(
                  db: db,
                  explicitlyWatchedTables: [if (booksRefs) db.books],
                  addJoins:
                      <
                        T extends TableManagerState<
                          dynamic,
                          dynamic,
                          dynamic,
                          dynamic,
                          dynamic,
                          dynamic,
                          dynamic,
                          dynamic,
                          dynamic,
                          dynamic,
                          dynamic
                        >
                      >(state) {
                        if (versionId) {
                          state =
                              state.withJoin(
                                    currentTable: table,
                                    currentColumn: table.versionId,
                                    referencedTable: $$BookGroupsTableReferences
                                        ._versionIdTable(db),
                                    referencedColumn:
                                        $$BookGroupsTableReferences
                                            ._versionIdTable(db)
                                            .id,
                                  )
                                  as T;
                        }
                        if (categoryId) {
                          state =
                              state.withJoin(
                                    currentTable: table,
                                    currentColumn: table.categoryId,
                                    referencedTable: $$BookGroupsTableReferences
                                        ._categoryIdTable(db),
                                    referencedColumn:
                                        $$BookGroupsTableReferences
                                            ._categoryIdTable(db)
                                            .id,
                                  )
                                  as T;
                        }

                        return state;
                      },
                  getPrefetchedDataCallback: (items) async {
                    return [
                      if (booksRefs)
                        await $_getPrefetchedData<
                          BookGroup,
                          $BookGroupsTable,
                          Book
                        >(
                          currentTable: table,
                          referencedTable: $$BookGroupsTableReferences
                              ._booksRefsTable(db),
                          managerFromTypedResult: (p0) =>
                              $$BookGroupsTableReferences(
                                db,
                                table,
                                p0,
                              ).booksRefs,
                          referencedItemsForCurrentItem:
                              (item, referencedItems) => referencedItems.where(
                                (e) => e.bookGroupId == item.id,
                              ),
                          typedResults: items,
                        ),
                    ];
                  },
                );
              },
        ),
      );
}

typedef $$BookGroupsTableProcessedTableManager =
    ProcessedTableManager<
      _$AppDatabase,
      $BookGroupsTable,
      BookGroup,
      $$BookGroupsTableFilterComposer,
      $$BookGroupsTableOrderingComposer,
      $$BookGroupsTableAnnotationComposer,
      $$BookGroupsTableCreateCompanionBuilder,
      $$BookGroupsTableUpdateCompanionBuilder,
      (BookGroup, $$BookGroupsTableReferences),
      BookGroup,
      PrefetchHooks Function({bool versionId, bool categoryId, bool booksRefs})
    >;
typedef $$EducationGradesTableCreateCompanionBuilder =
    EducationGradesCompanion Function({
      Value<int> id,
      required String grade,
      required String name,
      Value<String?> desc,
    });
typedef $$EducationGradesTableUpdateCompanionBuilder =
    EducationGradesCompanion Function({
      Value<int> id,
      Value<String> grade,
      Value<String> name,
      Value<String?> desc,
    });

final class $$EducationGradesTableReferences
    extends
        BaseReferences<_$AppDatabase, $EducationGradesTable, EducationGrade> {
  $$EducationGradesTableReferences(
    super.$_db,
    super.$_table,
    super.$_typedResult,
  );

  static MultiTypedResultKey<$BooksTable, List<Book>> _booksRefsTable(
    _$AppDatabase db,
  ) => MultiTypedResultKey.fromTable(
    db.books,
    aliasName: $_aliasNameGenerator(
      db.educationGrades.id,
      db.books.educationGradeId,
    ),
  );

  $$BooksTableProcessedTableManager get booksRefs {
    final manager = $$BooksTableTableManager(
      $_db,
      $_db.books,
    ).filter((f) => f.educationGradeId.id.sqlEquals($_itemColumn<int>('id')!));

    final cache = $_typedResult.readTableOrNull(_booksRefsTable($_db));
    return ProcessedTableManager(
      manager.$state.copyWith(prefetchedData: cache),
    );
  }
}

class $$EducationGradesTableFilterComposer
    extends Composer<_$AppDatabase, $EducationGradesTable> {
  $$EducationGradesTableFilterComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  ColumnFilters<int> get id => $composableBuilder(
    column: $table.id,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get grade => $composableBuilder(
    column: $table.grade,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get name => $composableBuilder(
    column: $table.name,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get desc => $composableBuilder(
    column: $table.desc,
    builder: (column) => ColumnFilters(column),
  );

  Expression<bool> booksRefs(
    Expression<bool> Function($$BooksTableFilterComposer f) f,
  ) {
    final $$BooksTableFilterComposer composer = $composerBuilder(
      composer: this,
      getCurrentColumn: (t) => t.id,
      referencedTable: $db.books,
      getReferencedColumn: (t) => t.educationGradeId,
      builder:
          (
            joinBuilder, {
            $addJoinBuilderToRootComposer,
            $removeJoinBuilderFromRootComposer,
          }) => $$BooksTableFilterComposer(
            $db: $db,
            $table: $db.books,
            $addJoinBuilderToRootComposer: $addJoinBuilderToRootComposer,
            joinBuilder: joinBuilder,
            $removeJoinBuilderFromRootComposer:
                $removeJoinBuilderFromRootComposer,
          ),
    );
    return f(composer);
  }
}

class $$EducationGradesTableOrderingComposer
    extends Composer<_$AppDatabase, $EducationGradesTable> {
  $$EducationGradesTableOrderingComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  ColumnOrderings<int> get id => $composableBuilder(
    column: $table.id,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get grade => $composableBuilder(
    column: $table.grade,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get name => $composableBuilder(
    column: $table.name,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get desc => $composableBuilder(
    column: $table.desc,
    builder: (column) => ColumnOrderings(column),
  );
}

class $$EducationGradesTableAnnotationComposer
    extends Composer<_$AppDatabase, $EducationGradesTable> {
  $$EducationGradesTableAnnotationComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  GeneratedColumn<int> get id =>
      $composableBuilder(column: $table.id, builder: (column) => column);

  GeneratedColumn<String> get grade =>
      $composableBuilder(column: $table.grade, builder: (column) => column);

  GeneratedColumn<String> get name =>
      $composableBuilder(column: $table.name, builder: (column) => column);

  GeneratedColumn<String> get desc =>
      $composableBuilder(column: $table.desc, builder: (column) => column);

  Expression<T> booksRefs<T extends Object>(
    Expression<T> Function($$BooksTableAnnotationComposer a) f,
  ) {
    final $$BooksTableAnnotationComposer composer = $composerBuilder(
      composer: this,
      getCurrentColumn: (t) => t.id,
      referencedTable: $db.books,
      getReferencedColumn: (t) => t.educationGradeId,
      builder:
          (
            joinBuilder, {
            $addJoinBuilderToRootComposer,
            $removeJoinBuilderFromRootComposer,
          }) => $$BooksTableAnnotationComposer(
            $db: $db,
            $table: $db.books,
            $addJoinBuilderToRootComposer: $addJoinBuilderToRootComposer,
            joinBuilder: joinBuilder,
            $removeJoinBuilderFromRootComposer:
                $removeJoinBuilderFromRootComposer,
          ),
    );
    return f(composer);
  }
}

class $$EducationGradesTableTableManager
    extends
        RootTableManager<
          _$AppDatabase,
          $EducationGradesTable,
          EducationGrade,
          $$EducationGradesTableFilterComposer,
          $$EducationGradesTableOrderingComposer,
          $$EducationGradesTableAnnotationComposer,
          $$EducationGradesTableCreateCompanionBuilder,
          $$EducationGradesTableUpdateCompanionBuilder,
          (EducationGrade, $$EducationGradesTableReferences),
          EducationGrade,
          PrefetchHooks Function({bool booksRefs})
        > {
  $$EducationGradesTableTableManager(
    _$AppDatabase db,
    $EducationGradesTable table,
  ) : super(
        TableManagerState(
          db: db,
          table: table,
          createFilteringComposer: () =>
              $$EducationGradesTableFilterComposer($db: db, $table: table),
          createOrderingComposer: () =>
              $$EducationGradesTableOrderingComposer($db: db, $table: table),
          createComputedFieldComposer: () =>
              $$EducationGradesTableAnnotationComposer($db: db, $table: table),
          updateCompanionCallback:
              ({
                Value<int> id = const Value.absent(),
                Value<String> grade = const Value.absent(),
                Value<String> name = const Value.absent(),
                Value<String?> desc = const Value.absent(),
              }) => EducationGradesCompanion(
                id: id,
                grade: grade,
                name: name,
                desc: desc,
              ),
          createCompanionCallback:
              ({
                Value<int> id = const Value.absent(),
                required String grade,
                required String name,
                Value<String?> desc = const Value.absent(),
              }) => EducationGradesCompanion.insert(
                id: id,
                grade: grade,
                name: name,
                desc: desc,
              ),
          withReferenceMapper: (p0) => p0
              .map(
                (e) => (
                  e.readTable(table),
                  $$EducationGradesTableReferences(db, table, e),
                ),
              )
              .toList(),
          prefetchHooksCallback: ({booksRefs = false}) {
            return PrefetchHooks(
              db: db,
              explicitlyWatchedTables: [if (booksRefs) db.books],
              addJoins: null,
              getPrefetchedDataCallback: (items) async {
                return [
                  if (booksRefs)
                    await $_getPrefetchedData<
                      EducationGrade,
                      $EducationGradesTable,
                      Book
                    >(
                      currentTable: table,
                      referencedTable: $$EducationGradesTableReferences
                          ._booksRefsTable(db),
                      managerFromTypedResult: (p0) =>
                          $$EducationGradesTableReferences(
                            db,
                            table,
                            p0,
                          ).booksRefs,
                      referencedItemsForCurrentItem: (item, referencedItems) =>
                          referencedItems.where(
                            (e) => e.educationGradeId == item.id,
                          ),
                      typedResults: items,
                    ),
                ];
              },
            );
          },
        ),
      );
}

typedef $$EducationGradesTableProcessedTableManager =
    ProcessedTableManager<
      _$AppDatabase,
      $EducationGradesTable,
      EducationGrade,
      $$EducationGradesTableFilterComposer,
      $$EducationGradesTableOrderingComposer,
      $$EducationGradesTableAnnotationComposer,
      $$EducationGradesTableCreateCompanionBuilder,
      $$EducationGradesTableUpdateCompanionBuilder,
      (EducationGrade, $$EducationGradesTableReferences),
      EducationGrade,
      PrefetchHooks Function({bool booksRefs})
    >;
typedef $$BooksTableCreateCompanionBuilder =
    BooksCompanion Function({
      required String id,
      required int bookId,
      required int versionId,
      required String title,
      Value<String?> description,
      Value<String?> author,
      required String publishedYear,
      required int totalPages,
      required int size,
      required String status,
      required int bookGroupId,
      required int educationGradeId,
      Value<int> rowid,
    });
typedef $$BooksTableUpdateCompanionBuilder =
    BooksCompanion Function({
      Value<String> id,
      Value<int> bookId,
      Value<int> versionId,
      Value<String> title,
      Value<String?> description,
      Value<String?> author,
      Value<String> publishedYear,
      Value<int> totalPages,
      Value<int> size,
      Value<String> status,
      Value<int> bookGroupId,
      Value<int> educationGradeId,
      Value<int> rowid,
    });

final class $$BooksTableReferences
    extends BaseReferences<_$AppDatabase, $BooksTable, Book> {
  $$BooksTableReferences(super.$_db, super.$_table, super.$_typedResult);

  static $AppVersionsTable _versionIdTable(_$AppDatabase db) => db.appVersions
      .createAlias($_aliasNameGenerator(db.books.versionId, db.appVersions.id));

  $$AppVersionsTableProcessedTableManager get versionId {
    final $_column = $_itemColumn<int>('version_id')!;

    final manager = $$AppVersionsTableTableManager(
      $_db,
      $_db.appVersions,
    ).filter((f) => f.id.sqlEquals($_column));
    final item = $_typedResult.readTableOrNull(_versionIdTable($_db));
    if (item == null) return manager;
    return ProcessedTableManager(
      manager.$state.copyWith(prefetchedData: [item]),
    );
  }

  static $BookGroupsTable _bookGroupIdTable(_$AppDatabase db) =>
      db.bookGroups.createAlias(
        $_aliasNameGenerator(db.books.bookGroupId, db.bookGroups.id),
      );

  $$BookGroupsTableProcessedTableManager get bookGroupId {
    final $_column = $_itemColumn<int>('book_group_id')!;

    final manager = $$BookGroupsTableTableManager(
      $_db,
      $_db.bookGroups,
    ).filter((f) => f.id.sqlEquals($_column));
    final item = $_typedResult.readTableOrNull(_bookGroupIdTable($_db));
    if (item == null) return manager;
    return ProcessedTableManager(
      manager.$state.copyWith(prefetchedData: [item]),
    );
  }

  static $EducationGradesTable _educationGradeIdTable(_$AppDatabase db) =>
      db.educationGrades.createAlias(
        $_aliasNameGenerator(db.books.educationGradeId, db.educationGrades.id),
      );

  $$EducationGradesTableProcessedTableManager get educationGradeId {
    final $_column = $_itemColumn<int>('education_grade_id')!;

    final manager = $$EducationGradesTableTableManager(
      $_db,
      $_db.educationGrades,
    ).filter((f) => f.id.sqlEquals($_column));
    final item = $_typedResult.readTableOrNull(_educationGradeIdTable($_db));
    if (item == null) return manager;
    return ProcessedTableManager(
      manager.$state.copyWith(prefetchedData: [item]),
    );
  }
}

class $$BooksTableFilterComposer extends Composer<_$AppDatabase, $BooksTable> {
  $$BooksTableFilterComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  ColumnFilters<String> get id => $composableBuilder(
    column: $table.id,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<int> get bookId => $composableBuilder(
    column: $table.bookId,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get title => $composableBuilder(
    column: $table.title,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get description => $composableBuilder(
    column: $table.description,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get author => $composableBuilder(
    column: $table.author,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get publishedYear => $composableBuilder(
    column: $table.publishedYear,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<int> get totalPages => $composableBuilder(
    column: $table.totalPages,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<int> get size => $composableBuilder(
    column: $table.size,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get status => $composableBuilder(
    column: $table.status,
    builder: (column) => ColumnFilters(column),
  );

  $$AppVersionsTableFilterComposer get versionId {
    final $$AppVersionsTableFilterComposer composer = $composerBuilder(
      composer: this,
      getCurrentColumn: (t) => t.versionId,
      referencedTable: $db.appVersions,
      getReferencedColumn: (t) => t.id,
      builder:
          (
            joinBuilder, {
            $addJoinBuilderToRootComposer,
            $removeJoinBuilderFromRootComposer,
          }) => $$AppVersionsTableFilterComposer(
            $db: $db,
            $table: $db.appVersions,
            $addJoinBuilderToRootComposer: $addJoinBuilderToRootComposer,
            joinBuilder: joinBuilder,
            $removeJoinBuilderFromRootComposer:
                $removeJoinBuilderFromRootComposer,
          ),
    );
    return composer;
  }

  $$BookGroupsTableFilterComposer get bookGroupId {
    final $$BookGroupsTableFilterComposer composer = $composerBuilder(
      composer: this,
      getCurrentColumn: (t) => t.bookGroupId,
      referencedTable: $db.bookGroups,
      getReferencedColumn: (t) => t.id,
      builder:
          (
            joinBuilder, {
            $addJoinBuilderToRootComposer,
            $removeJoinBuilderFromRootComposer,
          }) => $$BookGroupsTableFilterComposer(
            $db: $db,
            $table: $db.bookGroups,
            $addJoinBuilderToRootComposer: $addJoinBuilderToRootComposer,
            joinBuilder: joinBuilder,
            $removeJoinBuilderFromRootComposer:
                $removeJoinBuilderFromRootComposer,
          ),
    );
    return composer;
  }

  $$EducationGradesTableFilterComposer get educationGradeId {
    final $$EducationGradesTableFilterComposer composer = $composerBuilder(
      composer: this,
      getCurrentColumn: (t) => t.educationGradeId,
      referencedTable: $db.educationGrades,
      getReferencedColumn: (t) => t.id,
      builder:
          (
            joinBuilder, {
            $addJoinBuilderToRootComposer,
            $removeJoinBuilderFromRootComposer,
          }) => $$EducationGradesTableFilterComposer(
            $db: $db,
            $table: $db.educationGrades,
            $addJoinBuilderToRootComposer: $addJoinBuilderToRootComposer,
            joinBuilder: joinBuilder,
            $removeJoinBuilderFromRootComposer:
                $removeJoinBuilderFromRootComposer,
          ),
    );
    return composer;
  }
}

class $$BooksTableOrderingComposer
    extends Composer<_$AppDatabase, $BooksTable> {
  $$BooksTableOrderingComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  ColumnOrderings<String> get id => $composableBuilder(
    column: $table.id,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<int> get bookId => $composableBuilder(
    column: $table.bookId,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get title => $composableBuilder(
    column: $table.title,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get description => $composableBuilder(
    column: $table.description,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get author => $composableBuilder(
    column: $table.author,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get publishedYear => $composableBuilder(
    column: $table.publishedYear,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<int> get totalPages => $composableBuilder(
    column: $table.totalPages,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<int> get size => $composableBuilder(
    column: $table.size,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get status => $composableBuilder(
    column: $table.status,
    builder: (column) => ColumnOrderings(column),
  );

  $$AppVersionsTableOrderingComposer get versionId {
    final $$AppVersionsTableOrderingComposer composer = $composerBuilder(
      composer: this,
      getCurrentColumn: (t) => t.versionId,
      referencedTable: $db.appVersions,
      getReferencedColumn: (t) => t.id,
      builder:
          (
            joinBuilder, {
            $addJoinBuilderToRootComposer,
            $removeJoinBuilderFromRootComposer,
          }) => $$AppVersionsTableOrderingComposer(
            $db: $db,
            $table: $db.appVersions,
            $addJoinBuilderToRootComposer: $addJoinBuilderToRootComposer,
            joinBuilder: joinBuilder,
            $removeJoinBuilderFromRootComposer:
                $removeJoinBuilderFromRootComposer,
          ),
    );
    return composer;
  }

  $$BookGroupsTableOrderingComposer get bookGroupId {
    final $$BookGroupsTableOrderingComposer composer = $composerBuilder(
      composer: this,
      getCurrentColumn: (t) => t.bookGroupId,
      referencedTable: $db.bookGroups,
      getReferencedColumn: (t) => t.id,
      builder:
          (
            joinBuilder, {
            $addJoinBuilderToRootComposer,
            $removeJoinBuilderFromRootComposer,
          }) => $$BookGroupsTableOrderingComposer(
            $db: $db,
            $table: $db.bookGroups,
            $addJoinBuilderToRootComposer: $addJoinBuilderToRootComposer,
            joinBuilder: joinBuilder,
            $removeJoinBuilderFromRootComposer:
                $removeJoinBuilderFromRootComposer,
          ),
    );
    return composer;
  }

  $$EducationGradesTableOrderingComposer get educationGradeId {
    final $$EducationGradesTableOrderingComposer composer = $composerBuilder(
      composer: this,
      getCurrentColumn: (t) => t.educationGradeId,
      referencedTable: $db.educationGrades,
      getReferencedColumn: (t) => t.id,
      builder:
          (
            joinBuilder, {
            $addJoinBuilderToRootComposer,
            $removeJoinBuilderFromRootComposer,
          }) => $$EducationGradesTableOrderingComposer(
            $db: $db,
            $table: $db.educationGrades,
            $addJoinBuilderToRootComposer: $addJoinBuilderToRootComposer,
            joinBuilder: joinBuilder,
            $removeJoinBuilderFromRootComposer:
                $removeJoinBuilderFromRootComposer,
          ),
    );
    return composer;
  }
}

class $$BooksTableAnnotationComposer
    extends Composer<_$AppDatabase, $BooksTable> {
  $$BooksTableAnnotationComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  GeneratedColumn<String> get id =>
      $composableBuilder(column: $table.id, builder: (column) => column);

  GeneratedColumn<int> get bookId =>
      $composableBuilder(column: $table.bookId, builder: (column) => column);

  GeneratedColumn<String> get title =>
      $composableBuilder(column: $table.title, builder: (column) => column);

  GeneratedColumn<String> get description => $composableBuilder(
    column: $table.description,
    builder: (column) => column,
  );

  GeneratedColumn<String> get author =>
      $composableBuilder(column: $table.author, builder: (column) => column);

  GeneratedColumn<String> get publishedYear => $composableBuilder(
    column: $table.publishedYear,
    builder: (column) => column,
  );

  GeneratedColumn<int> get totalPages => $composableBuilder(
    column: $table.totalPages,
    builder: (column) => column,
  );

  GeneratedColumn<int> get size =>
      $composableBuilder(column: $table.size, builder: (column) => column);

  GeneratedColumn<String> get status =>
      $composableBuilder(column: $table.status, builder: (column) => column);

  $$AppVersionsTableAnnotationComposer get versionId {
    final $$AppVersionsTableAnnotationComposer composer = $composerBuilder(
      composer: this,
      getCurrentColumn: (t) => t.versionId,
      referencedTable: $db.appVersions,
      getReferencedColumn: (t) => t.id,
      builder:
          (
            joinBuilder, {
            $addJoinBuilderToRootComposer,
            $removeJoinBuilderFromRootComposer,
          }) => $$AppVersionsTableAnnotationComposer(
            $db: $db,
            $table: $db.appVersions,
            $addJoinBuilderToRootComposer: $addJoinBuilderToRootComposer,
            joinBuilder: joinBuilder,
            $removeJoinBuilderFromRootComposer:
                $removeJoinBuilderFromRootComposer,
          ),
    );
    return composer;
  }

  $$BookGroupsTableAnnotationComposer get bookGroupId {
    final $$BookGroupsTableAnnotationComposer composer = $composerBuilder(
      composer: this,
      getCurrentColumn: (t) => t.bookGroupId,
      referencedTable: $db.bookGroups,
      getReferencedColumn: (t) => t.id,
      builder:
          (
            joinBuilder, {
            $addJoinBuilderToRootComposer,
            $removeJoinBuilderFromRootComposer,
          }) => $$BookGroupsTableAnnotationComposer(
            $db: $db,
            $table: $db.bookGroups,
            $addJoinBuilderToRootComposer: $addJoinBuilderToRootComposer,
            joinBuilder: joinBuilder,
            $removeJoinBuilderFromRootComposer:
                $removeJoinBuilderFromRootComposer,
          ),
    );
    return composer;
  }

  $$EducationGradesTableAnnotationComposer get educationGradeId {
    final $$EducationGradesTableAnnotationComposer composer = $composerBuilder(
      composer: this,
      getCurrentColumn: (t) => t.educationGradeId,
      referencedTable: $db.educationGrades,
      getReferencedColumn: (t) => t.id,
      builder:
          (
            joinBuilder, {
            $addJoinBuilderToRootComposer,
            $removeJoinBuilderFromRootComposer,
          }) => $$EducationGradesTableAnnotationComposer(
            $db: $db,
            $table: $db.educationGrades,
            $addJoinBuilderToRootComposer: $addJoinBuilderToRootComposer,
            joinBuilder: joinBuilder,
            $removeJoinBuilderFromRootComposer:
                $removeJoinBuilderFromRootComposer,
          ),
    );
    return composer;
  }
}

class $$BooksTableTableManager
    extends
        RootTableManager<
          _$AppDatabase,
          $BooksTable,
          Book,
          $$BooksTableFilterComposer,
          $$BooksTableOrderingComposer,
          $$BooksTableAnnotationComposer,
          $$BooksTableCreateCompanionBuilder,
          $$BooksTableUpdateCompanionBuilder,
          (Book, $$BooksTableReferences),
          Book,
          PrefetchHooks Function({
            bool versionId,
            bool bookGroupId,
            bool educationGradeId,
          })
        > {
  $$BooksTableTableManager(_$AppDatabase db, $BooksTable table)
    : super(
        TableManagerState(
          db: db,
          table: table,
          createFilteringComposer: () =>
              $$BooksTableFilterComposer($db: db, $table: table),
          createOrderingComposer: () =>
              $$BooksTableOrderingComposer($db: db, $table: table),
          createComputedFieldComposer: () =>
              $$BooksTableAnnotationComposer($db: db, $table: table),
          updateCompanionCallback:
              ({
                Value<String> id = const Value.absent(),
                Value<int> bookId = const Value.absent(),
                Value<int> versionId = const Value.absent(),
                Value<String> title = const Value.absent(),
                Value<String?> description = const Value.absent(),
                Value<String?> author = const Value.absent(),
                Value<String> publishedYear = const Value.absent(),
                Value<int> totalPages = const Value.absent(),
                Value<int> size = const Value.absent(),
                Value<String> status = const Value.absent(),
                Value<int> bookGroupId = const Value.absent(),
                Value<int> educationGradeId = const Value.absent(),
                Value<int> rowid = const Value.absent(),
              }) => BooksCompanion(
                id: id,
                bookId: bookId,
                versionId: versionId,
                title: title,
                description: description,
                author: author,
                publishedYear: publishedYear,
                totalPages: totalPages,
                size: size,
                status: status,
                bookGroupId: bookGroupId,
                educationGradeId: educationGradeId,
                rowid: rowid,
              ),
          createCompanionCallback:
              ({
                required String id,
                required int bookId,
                required int versionId,
                required String title,
                Value<String?> description = const Value.absent(),
                Value<String?> author = const Value.absent(),
                required String publishedYear,
                required int totalPages,
                required int size,
                required String status,
                required int bookGroupId,
                required int educationGradeId,
                Value<int> rowid = const Value.absent(),
              }) => BooksCompanion.insert(
                id: id,
                bookId: bookId,
                versionId: versionId,
                title: title,
                description: description,
                author: author,
                publishedYear: publishedYear,
                totalPages: totalPages,
                size: size,
                status: status,
                bookGroupId: bookGroupId,
                educationGradeId: educationGradeId,
                rowid: rowid,
              ),
          withReferenceMapper: (p0) => p0
              .map(
                (e) =>
                    (e.readTable(table), $$BooksTableReferences(db, table, e)),
              )
              .toList(),
          prefetchHooksCallback:
              ({
                versionId = false,
                bookGroupId = false,
                educationGradeId = false,
              }) {
                return PrefetchHooks(
                  db: db,
                  explicitlyWatchedTables: [],
                  addJoins:
                      <
                        T extends TableManagerState<
                          dynamic,
                          dynamic,
                          dynamic,
                          dynamic,
                          dynamic,
                          dynamic,
                          dynamic,
                          dynamic,
                          dynamic,
                          dynamic,
                          dynamic
                        >
                      >(state) {
                        if (versionId) {
                          state =
                              state.withJoin(
                                    currentTable: table,
                                    currentColumn: table.versionId,
                                    referencedTable: $$BooksTableReferences
                                        ._versionIdTable(db),
                                    referencedColumn: $$BooksTableReferences
                                        ._versionIdTable(db)
                                        .id,
                                  )
                                  as T;
                        }
                        if (bookGroupId) {
                          state =
                              state.withJoin(
                                    currentTable: table,
                                    currentColumn: table.bookGroupId,
                                    referencedTable: $$BooksTableReferences
                                        ._bookGroupIdTable(db),
                                    referencedColumn: $$BooksTableReferences
                                        ._bookGroupIdTable(db)
                                        .id,
                                  )
                                  as T;
                        }
                        if (educationGradeId) {
                          state =
                              state.withJoin(
                                    currentTable: table,
                                    currentColumn: table.educationGradeId,
                                    referencedTable: $$BooksTableReferences
                                        ._educationGradeIdTable(db),
                                    referencedColumn: $$BooksTableReferences
                                        ._educationGradeIdTable(db)
                                        .id,
                                  )
                                  as T;
                        }

                        return state;
                      },
                  getPrefetchedDataCallback: (items) async {
                    return [];
                  },
                );
              },
        ),
      );
}

typedef $$BooksTableProcessedTableManager =
    ProcessedTableManager<
      _$AppDatabase,
      $BooksTable,
      Book,
      $$BooksTableFilterComposer,
      $$BooksTableOrderingComposer,
      $$BooksTableAnnotationComposer,
      $$BooksTableCreateCompanionBuilder,
      $$BooksTableUpdateCompanionBuilder,
      (Book, $$BooksTableReferences),
      Book,
      PrefetchHooks Function({
        bool versionId,
        bool bookGroupId,
        bool educationGradeId,
      })
    >;

class $AppDatabaseManager {
  final _$AppDatabase _db;
  $AppDatabaseManager(this._db);
  $$AppVersionsTableTableManager get appVersions =>
      $$AppVersionsTableTableManager(_db, _db.appVersions);
  $$CategoriesTableTableManager get categories =>
      $$CategoriesTableTableManager(_db, _db.categories);
  $$BookGroupsTableTableManager get bookGroups =>
      $$BookGroupsTableTableManager(_db, _db.bookGroups);
  $$EducationGradesTableTableManager get educationGrades =>
      $$EducationGradesTableTableManager(_db, _db.educationGrades);
  $$BooksTableTableManager get books =>
      $$BooksTableTableManager(_db, _db.books);
}
