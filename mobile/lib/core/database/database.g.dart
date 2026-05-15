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
  static const VerificationMeta _ratingMeta = const VerificationMeta('rating');
  @override
  late final GeneratedColumn<double> rating = GeneratedColumn<double>(
    'rating',
    aliasedName,
    false,
    type: DriftSqlType.double,
    requiredDuringInsert: false,
    defaultValue: const Constant(0.0),
  );
  static const VerificationMeta _viewCountMeta = const VerificationMeta(
    'viewCount',
  );
  @override
  late final GeneratedColumn<int> viewCount = GeneratedColumn<int>(
    'view_count',
    aliasedName,
    false,
    type: DriftSqlType.int,
    requiredDuringInsert: false,
    defaultValue: const Constant(0),
  );
  static const VerificationMeta _downloadCountMeta = const VerificationMeta(
    'downloadCount',
  );
  @override
  late final GeneratedColumn<int> downloadCount = GeneratedColumn<int>(
    'download_count',
    aliasedName,
    false,
    type: DriftSqlType.int,
    requiredDuringInsert: false,
    defaultValue: const Constant(0),
  );
  static const VerificationMeta _bookmarkCountMeta = const VerificationMeta(
    'bookmarkCount',
  );
  @override
  late final GeneratedColumn<int> bookmarkCount = GeneratedColumn<int>(
    'bookmark_count',
    aliasedName,
    false,
    type: DriftSqlType.int,
    requiredDuringInsert: false,
    defaultValue: const Constant(0),
  );
  static const VerificationMeta _coverXsMeta = const VerificationMeta(
    'coverXs',
  );
  @override
  late final GeneratedColumn<String> coverXs = GeneratedColumn<String>(
    'cover_xs',
    aliasedName,
    false,
    type: DriftSqlType.string,
    requiredDuringInsert: false,
    defaultValue: const Constant(''),
  );
  static const VerificationMeta _coverLgMeta = const VerificationMeta(
    'coverLg',
  );
  @override
  late final GeneratedColumn<String> coverLg = GeneratedColumn<String>(
    'cover_lg',
    aliasedName,
    false,
    type: DriftSqlType.string,
    requiredDuringInsert: false,
    defaultValue: const Constant(''),
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
  );
  static const VerificationMeta _categoryNameMeta = const VerificationMeta(
    'categoryName',
  );
  @override
  late final GeneratedColumn<String> categoryName = GeneratedColumn<String>(
    'category_name',
    aliasedName,
    false,
    type: DriftSqlType.string,
    requiredDuringInsert: true,
  );
  static const VerificationMeta _groupIdMeta = const VerificationMeta(
    'groupId',
  );
  @override
  late final GeneratedColumn<int> groupId = GeneratedColumn<int>(
    'group_id',
    aliasedName,
    false,
    type: DriftSqlType.int,
    requiredDuringInsert: true,
  );
  static const VerificationMeta _groupNameMeta = const VerificationMeta(
    'groupName',
  );
  @override
  late final GeneratedColumn<String> groupName = GeneratedColumn<String>(
    'group_name',
    aliasedName,
    false,
    type: DriftSqlType.string,
    requiredDuringInsert: true,
  );
  static const VerificationMeta _groupShortNameMeta = const VerificationMeta(
    'groupShortName',
  );
  @override
  late final GeneratedColumn<String> groupShortName = GeneratedColumn<String>(
    'group_short_name',
    aliasedName,
    false,
    type: DriftSqlType.string,
    requiredDuringInsert: true,
  );
  static const VerificationMeta _gradeIdMeta = const VerificationMeta(
    'gradeId',
  );
  @override
  late final GeneratedColumn<int> gradeId = GeneratedColumn<int>(
    'grade_id',
    aliasedName,
    false,
    type: DriftSqlType.int,
    requiredDuringInsert: true,
  );
  static const VerificationMeta _gradeNameMeta = const VerificationMeta(
    'gradeName',
  );
  @override
  late final GeneratedColumn<String> gradeName = GeneratedColumn<String>(
    'grade_name',
    aliasedName,
    false,
    type: DriftSqlType.string,
    requiredDuringInsert: true,
  );
  static const VerificationMeta _gradeLabelMeta = const VerificationMeta(
    'gradeLabel',
  );
  @override
  late final GeneratedColumn<String> gradeLabel = GeneratedColumn<String>(
    'grade_label',
    aliasedName,
    false,
    type: DriftSqlType.string,
    requiredDuringInsert: true,
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
    rating,
    viewCount,
    downloadCount,
    bookmarkCount,
    coverXs,
    coverLg,
    categoryId,
    categoryName,
    groupId,
    groupName,
    groupShortName,
    gradeId,
    gradeName,
    gradeLabel,
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
    if (data.containsKey('rating')) {
      context.handle(
        _ratingMeta,
        rating.isAcceptableOrUnknown(data['rating']!, _ratingMeta),
      );
    }
    if (data.containsKey('view_count')) {
      context.handle(
        _viewCountMeta,
        viewCount.isAcceptableOrUnknown(data['view_count']!, _viewCountMeta),
      );
    }
    if (data.containsKey('download_count')) {
      context.handle(
        _downloadCountMeta,
        downloadCount.isAcceptableOrUnknown(
          data['download_count']!,
          _downloadCountMeta,
        ),
      );
    }
    if (data.containsKey('bookmark_count')) {
      context.handle(
        _bookmarkCountMeta,
        bookmarkCount.isAcceptableOrUnknown(
          data['bookmark_count']!,
          _bookmarkCountMeta,
        ),
      );
    }
    if (data.containsKey('cover_xs')) {
      context.handle(
        _coverXsMeta,
        coverXs.isAcceptableOrUnknown(data['cover_xs']!, _coverXsMeta),
      );
    }
    if (data.containsKey('cover_lg')) {
      context.handle(
        _coverLgMeta,
        coverLg.isAcceptableOrUnknown(data['cover_lg']!, _coverLgMeta),
      );
    }
    if (data.containsKey('category_id')) {
      context.handle(
        _categoryIdMeta,
        categoryId.isAcceptableOrUnknown(data['category_id']!, _categoryIdMeta),
      );
    } else if (isInserting) {
      context.missing(_categoryIdMeta);
    }
    if (data.containsKey('category_name')) {
      context.handle(
        _categoryNameMeta,
        categoryName.isAcceptableOrUnknown(
          data['category_name']!,
          _categoryNameMeta,
        ),
      );
    } else if (isInserting) {
      context.missing(_categoryNameMeta);
    }
    if (data.containsKey('group_id')) {
      context.handle(
        _groupIdMeta,
        groupId.isAcceptableOrUnknown(data['group_id']!, _groupIdMeta),
      );
    } else if (isInserting) {
      context.missing(_groupIdMeta);
    }
    if (data.containsKey('group_name')) {
      context.handle(
        _groupNameMeta,
        groupName.isAcceptableOrUnknown(data['group_name']!, _groupNameMeta),
      );
    } else if (isInserting) {
      context.missing(_groupNameMeta);
    }
    if (data.containsKey('group_short_name')) {
      context.handle(
        _groupShortNameMeta,
        groupShortName.isAcceptableOrUnknown(
          data['group_short_name']!,
          _groupShortNameMeta,
        ),
      );
    } else if (isInserting) {
      context.missing(_groupShortNameMeta);
    }
    if (data.containsKey('grade_id')) {
      context.handle(
        _gradeIdMeta,
        gradeId.isAcceptableOrUnknown(data['grade_id']!, _gradeIdMeta),
      );
    } else if (isInserting) {
      context.missing(_gradeIdMeta);
    }
    if (data.containsKey('grade_name')) {
      context.handle(
        _gradeNameMeta,
        gradeName.isAcceptableOrUnknown(data['grade_name']!, _gradeNameMeta),
      );
    } else if (isInserting) {
      context.missing(_gradeNameMeta);
    }
    if (data.containsKey('grade_label')) {
      context.handle(
        _gradeLabelMeta,
        gradeLabel.isAcceptableOrUnknown(data['grade_label']!, _gradeLabelMeta),
      );
    } else if (isInserting) {
      context.missing(_gradeLabelMeta);
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
      rating: attachedDatabase.typeMapping.read(
        DriftSqlType.double,
        data['${effectivePrefix}rating'],
      )!,
      viewCount: attachedDatabase.typeMapping.read(
        DriftSqlType.int,
        data['${effectivePrefix}view_count'],
      )!,
      downloadCount: attachedDatabase.typeMapping.read(
        DriftSqlType.int,
        data['${effectivePrefix}download_count'],
      )!,
      bookmarkCount: attachedDatabase.typeMapping.read(
        DriftSqlType.int,
        data['${effectivePrefix}bookmark_count'],
      )!,
      coverXs: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}cover_xs'],
      )!,
      coverLg: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}cover_lg'],
      )!,
      categoryId: attachedDatabase.typeMapping.read(
        DriftSqlType.int,
        data['${effectivePrefix}category_id'],
      )!,
      categoryName: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}category_name'],
      )!,
      groupId: attachedDatabase.typeMapping.read(
        DriftSqlType.int,
        data['${effectivePrefix}group_id'],
      )!,
      groupName: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}group_name'],
      )!,
      groupShortName: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}group_short_name'],
      )!,
      gradeId: attachedDatabase.typeMapping.read(
        DriftSqlType.int,
        data['${effectivePrefix}grade_id'],
      )!,
      gradeName: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}grade_name'],
      )!,
      gradeLabel: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}grade_label'],
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
  final double rating;
  final int viewCount;
  final int downloadCount;
  final int bookmarkCount;
  final String coverXs;
  final String coverLg;
  final int categoryId;
  final String categoryName;
  final int groupId;
  final String groupName;
  final String groupShortName;
  final int gradeId;
  final String gradeName;
  final String gradeLabel;
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
    required this.rating,
    required this.viewCount,
    required this.downloadCount,
    required this.bookmarkCount,
    required this.coverXs,
    required this.coverLg,
    required this.categoryId,
    required this.categoryName,
    required this.groupId,
    required this.groupName,
    required this.groupShortName,
    required this.gradeId,
    required this.gradeName,
    required this.gradeLabel,
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
    map['rating'] = Variable<double>(rating);
    map['view_count'] = Variable<int>(viewCount);
    map['download_count'] = Variable<int>(downloadCount);
    map['bookmark_count'] = Variable<int>(bookmarkCount);
    map['cover_xs'] = Variable<String>(coverXs);
    map['cover_lg'] = Variable<String>(coverLg);
    map['category_id'] = Variable<int>(categoryId);
    map['category_name'] = Variable<String>(categoryName);
    map['group_id'] = Variable<int>(groupId);
    map['group_name'] = Variable<String>(groupName);
    map['group_short_name'] = Variable<String>(groupShortName);
    map['grade_id'] = Variable<int>(gradeId);
    map['grade_name'] = Variable<String>(gradeName);
    map['grade_label'] = Variable<String>(gradeLabel);
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
      rating: Value(rating),
      viewCount: Value(viewCount),
      downloadCount: Value(downloadCount),
      bookmarkCount: Value(bookmarkCount),
      coverXs: Value(coverXs),
      coverLg: Value(coverLg),
      categoryId: Value(categoryId),
      categoryName: Value(categoryName),
      groupId: Value(groupId),
      groupName: Value(groupName),
      groupShortName: Value(groupShortName),
      gradeId: Value(gradeId),
      gradeName: Value(gradeName),
      gradeLabel: Value(gradeLabel),
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
      rating: serializer.fromJson<double>(json['rating']),
      viewCount: serializer.fromJson<int>(json['viewCount']),
      downloadCount: serializer.fromJson<int>(json['downloadCount']),
      bookmarkCount: serializer.fromJson<int>(json['bookmarkCount']),
      coverXs: serializer.fromJson<String>(json['coverXs']),
      coverLg: serializer.fromJson<String>(json['coverLg']),
      categoryId: serializer.fromJson<int>(json['categoryId']),
      categoryName: serializer.fromJson<String>(json['categoryName']),
      groupId: serializer.fromJson<int>(json['groupId']),
      groupName: serializer.fromJson<String>(json['groupName']),
      groupShortName: serializer.fromJson<String>(json['groupShortName']),
      gradeId: serializer.fromJson<int>(json['gradeId']),
      gradeName: serializer.fromJson<String>(json['gradeName']),
      gradeLabel: serializer.fromJson<String>(json['gradeLabel']),
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
      'rating': serializer.toJson<double>(rating),
      'viewCount': serializer.toJson<int>(viewCount),
      'downloadCount': serializer.toJson<int>(downloadCount),
      'bookmarkCount': serializer.toJson<int>(bookmarkCount),
      'coverXs': serializer.toJson<String>(coverXs),
      'coverLg': serializer.toJson<String>(coverLg),
      'categoryId': serializer.toJson<int>(categoryId),
      'categoryName': serializer.toJson<String>(categoryName),
      'groupId': serializer.toJson<int>(groupId),
      'groupName': serializer.toJson<String>(groupName),
      'groupShortName': serializer.toJson<String>(groupShortName),
      'gradeId': serializer.toJson<int>(gradeId),
      'gradeName': serializer.toJson<String>(gradeName),
      'gradeLabel': serializer.toJson<String>(gradeLabel),
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
    double? rating,
    int? viewCount,
    int? downloadCount,
    int? bookmarkCount,
    String? coverXs,
    String? coverLg,
    int? categoryId,
    String? categoryName,
    int? groupId,
    String? groupName,
    String? groupShortName,
    int? gradeId,
    String? gradeName,
    String? gradeLabel,
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
    rating: rating ?? this.rating,
    viewCount: viewCount ?? this.viewCount,
    downloadCount: downloadCount ?? this.downloadCount,
    bookmarkCount: bookmarkCount ?? this.bookmarkCount,
    coverXs: coverXs ?? this.coverXs,
    coverLg: coverLg ?? this.coverLg,
    categoryId: categoryId ?? this.categoryId,
    categoryName: categoryName ?? this.categoryName,
    groupId: groupId ?? this.groupId,
    groupName: groupName ?? this.groupName,
    groupShortName: groupShortName ?? this.groupShortName,
    gradeId: gradeId ?? this.gradeId,
    gradeName: gradeName ?? this.gradeName,
    gradeLabel: gradeLabel ?? this.gradeLabel,
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
      rating: data.rating.present ? data.rating.value : this.rating,
      viewCount: data.viewCount.present ? data.viewCount.value : this.viewCount,
      downloadCount: data.downloadCount.present
          ? data.downloadCount.value
          : this.downloadCount,
      bookmarkCount: data.bookmarkCount.present
          ? data.bookmarkCount.value
          : this.bookmarkCount,
      coverXs: data.coverXs.present ? data.coverXs.value : this.coverXs,
      coverLg: data.coverLg.present ? data.coverLg.value : this.coverLg,
      categoryId: data.categoryId.present
          ? data.categoryId.value
          : this.categoryId,
      categoryName: data.categoryName.present
          ? data.categoryName.value
          : this.categoryName,
      groupId: data.groupId.present ? data.groupId.value : this.groupId,
      groupName: data.groupName.present ? data.groupName.value : this.groupName,
      groupShortName: data.groupShortName.present
          ? data.groupShortName.value
          : this.groupShortName,
      gradeId: data.gradeId.present ? data.gradeId.value : this.gradeId,
      gradeName: data.gradeName.present ? data.gradeName.value : this.gradeName,
      gradeLabel: data.gradeLabel.present
          ? data.gradeLabel.value
          : this.gradeLabel,
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
          ..write('rating: $rating, ')
          ..write('viewCount: $viewCount, ')
          ..write('downloadCount: $downloadCount, ')
          ..write('bookmarkCount: $bookmarkCount, ')
          ..write('coverXs: $coverXs, ')
          ..write('coverLg: $coverLg, ')
          ..write('categoryId: $categoryId, ')
          ..write('categoryName: $categoryName, ')
          ..write('groupId: $groupId, ')
          ..write('groupName: $groupName, ')
          ..write('groupShortName: $groupShortName, ')
          ..write('gradeId: $gradeId, ')
          ..write('gradeName: $gradeName, ')
          ..write('gradeLabel: $gradeLabel')
          ..write(')'))
        .toString();
  }

  @override
  int get hashCode => Object.hashAll([
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
    rating,
    viewCount,
    downloadCount,
    bookmarkCount,
    coverXs,
    coverLg,
    categoryId,
    categoryName,
    groupId,
    groupName,
    groupShortName,
    gradeId,
    gradeName,
    gradeLabel,
  ]);
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
          other.rating == this.rating &&
          other.viewCount == this.viewCount &&
          other.downloadCount == this.downloadCount &&
          other.bookmarkCount == this.bookmarkCount &&
          other.coverXs == this.coverXs &&
          other.coverLg == this.coverLg &&
          other.categoryId == this.categoryId &&
          other.categoryName == this.categoryName &&
          other.groupId == this.groupId &&
          other.groupName == this.groupName &&
          other.groupShortName == this.groupShortName &&
          other.gradeId == this.gradeId &&
          other.gradeName == this.gradeName &&
          other.gradeLabel == this.gradeLabel);
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
  final Value<double> rating;
  final Value<int> viewCount;
  final Value<int> downloadCount;
  final Value<int> bookmarkCount;
  final Value<String> coverXs;
  final Value<String> coverLg;
  final Value<int> categoryId;
  final Value<String> categoryName;
  final Value<int> groupId;
  final Value<String> groupName;
  final Value<String> groupShortName;
  final Value<int> gradeId;
  final Value<String> gradeName;
  final Value<String> gradeLabel;
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
    this.rating = const Value.absent(),
    this.viewCount = const Value.absent(),
    this.downloadCount = const Value.absent(),
    this.bookmarkCount = const Value.absent(),
    this.coverXs = const Value.absent(),
    this.coverLg = const Value.absent(),
    this.categoryId = const Value.absent(),
    this.categoryName = const Value.absent(),
    this.groupId = const Value.absent(),
    this.groupName = const Value.absent(),
    this.groupShortName = const Value.absent(),
    this.gradeId = const Value.absent(),
    this.gradeName = const Value.absent(),
    this.gradeLabel = const Value.absent(),
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
    this.rating = const Value.absent(),
    this.viewCount = const Value.absent(),
    this.downloadCount = const Value.absent(),
    this.bookmarkCount = const Value.absent(),
    this.coverXs = const Value.absent(),
    this.coverLg = const Value.absent(),
    required int categoryId,
    required String categoryName,
    required int groupId,
    required String groupName,
    required String groupShortName,
    required int gradeId,
    required String gradeName,
    required String gradeLabel,
    this.rowid = const Value.absent(),
  }) : id = Value(id),
       bookId = Value(bookId),
       versionId = Value(versionId),
       title = Value(title),
       publishedYear = Value(publishedYear),
       totalPages = Value(totalPages),
       size = Value(size),
       status = Value(status),
       categoryId = Value(categoryId),
       categoryName = Value(categoryName),
       groupId = Value(groupId),
       groupName = Value(groupName),
       groupShortName = Value(groupShortName),
       gradeId = Value(gradeId),
       gradeName = Value(gradeName),
       gradeLabel = Value(gradeLabel);
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
    Expression<double>? rating,
    Expression<int>? viewCount,
    Expression<int>? downloadCount,
    Expression<int>? bookmarkCount,
    Expression<String>? coverXs,
    Expression<String>? coverLg,
    Expression<int>? categoryId,
    Expression<String>? categoryName,
    Expression<int>? groupId,
    Expression<String>? groupName,
    Expression<String>? groupShortName,
    Expression<int>? gradeId,
    Expression<String>? gradeName,
    Expression<String>? gradeLabel,
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
      if (rating != null) 'rating': rating,
      if (viewCount != null) 'view_count': viewCount,
      if (downloadCount != null) 'download_count': downloadCount,
      if (bookmarkCount != null) 'bookmark_count': bookmarkCount,
      if (coverXs != null) 'cover_xs': coverXs,
      if (coverLg != null) 'cover_lg': coverLg,
      if (categoryId != null) 'category_id': categoryId,
      if (categoryName != null) 'category_name': categoryName,
      if (groupId != null) 'group_id': groupId,
      if (groupName != null) 'group_name': groupName,
      if (groupShortName != null) 'group_short_name': groupShortName,
      if (gradeId != null) 'grade_id': gradeId,
      if (gradeName != null) 'grade_name': gradeName,
      if (gradeLabel != null) 'grade_label': gradeLabel,
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
    Value<double>? rating,
    Value<int>? viewCount,
    Value<int>? downloadCount,
    Value<int>? bookmarkCount,
    Value<String>? coverXs,
    Value<String>? coverLg,
    Value<int>? categoryId,
    Value<String>? categoryName,
    Value<int>? groupId,
    Value<String>? groupName,
    Value<String>? groupShortName,
    Value<int>? gradeId,
    Value<String>? gradeName,
    Value<String>? gradeLabel,
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
      rating: rating ?? this.rating,
      viewCount: viewCount ?? this.viewCount,
      downloadCount: downloadCount ?? this.downloadCount,
      bookmarkCount: bookmarkCount ?? this.bookmarkCount,
      coverXs: coverXs ?? this.coverXs,
      coverLg: coverLg ?? this.coverLg,
      categoryId: categoryId ?? this.categoryId,
      categoryName: categoryName ?? this.categoryName,
      groupId: groupId ?? this.groupId,
      groupName: groupName ?? this.groupName,
      groupShortName: groupShortName ?? this.groupShortName,
      gradeId: gradeId ?? this.gradeId,
      gradeName: gradeName ?? this.gradeName,
      gradeLabel: gradeLabel ?? this.gradeLabel,
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
    if (rating.present) {
      map['rating'] = Variable<double>(rating.value);
    }
    if (viewCount.present) {
      map['view_count'] = Variable<int>(viewCount.value);
    }
    if (downloadCount.present) {
      map['download_count'] = Variable<int>(downloadCount.value);
    }
    if (bookmarkCount.present) {
      map['bookmark_count'] = Variable<int>(bookmarkCount.value);
    }
    if (coverXs.present) {
      map['cover_xs'] = Variable<String>(coverXs.value);
    }
    if (coverLg.present) {
      map['cover_lg'] = Variable<String>(coverLg.value);
    }
    if (categoryId.present) {
      map['category_id'] = Variable<int>(categoryId.value);
    }
    if (categoryName.present) {
      map['category_name'] = Variable<String>(categoryName.value);
    }
    if (groupId.present) {
      map['group_id'] = Variable<int>(groupId.value);
    }
    if (groupName.present) {
      map['group_name'] = Variable<String>(groupName.value);
    }
    if (groupShortName.present) {
      map['group_short_name'] = Variable<String>(groupShortName.value);
    }
    if (gradeId.present) {
      map['grade_id'] = Variable<int>(gradeId.value);
    }
    if (gradeName.present) {
      map['grade_name'] = Variable<String>(gradeName.value);
    }
    if (gradeLabel.present) {
      map['grade_label'] = Variable<String>(gradeLabel.value);
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
          ..write('rating: $rating, ')
          ..write('viewCount: $viewCount, ')
          ..write('downloadCount: $downloadCount, ')
          ..write('bookmarkCount: $bookmarkCount, ')
          ..write('coverXs: $coverXs, ')
          ..write('coverLg: $coverLg, ')
          ..write('categoryId: $categoryId, ')
          ..write('categoryName: $categoryName, ')
          ..write('groupId: $groupId, ')
          ..write('groupName: $groupName, ')
          ..write('groupShortName: $groupShortName, ')
          ..write('gradeId: $gradeId, ')
          ..write('gradeName: $gradeName, ')
          ..write('gradeLabel: $gradeLabel, ')
          ..write('rowid: $rowid')
          ..write(')'))
        .toString();
  }
}

abstract class _$AppDatabase extends GeneratedDatabase {
  _$AppDatabase(QueryExecutor e) : super(e);
  $AppDatabaseManager get managers => $AppDatabaseManager(this);
  late final $AppVersionsTable appVersions = $AppVersionsTable(this);
  late final $BooksTable books = $BooksTable(this);
  @override
  Iterable<TableInfo<Table, Object?>> get allTables =>
      allSchemaEntities.whereType<TableInfo<Table, Object?>>();
  @override
  List<DatabaseSchemaEntity> get allSchemaEntities => [appVersions, books];
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
          PrefetchHooks Function({bool booksRefs})
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
          prefetchHooksCallback: ({booksRefs = false}) {
            return PrefetchHooks(
              db: db,
              explicitlyWatchedTables: [if (booksRefs) db.books],
              addJoins: null,
              getPrefetchedDataCallback: (items) async {
                return [
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
      Value<double> rating,
      Value<int> viewCount,
      Value<int> downloadCount,
      Value<int> bookmarkCount,
      Value<String> coverXs,
      Value<String> coverLg,
      required int categoryId,
      required String categoryName,
      required int groupId,
      required String groupName,
      required String groupShortName,
      required int gradeId,
      required String gradeName,
      required String gradeLabel,
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
      Value<double> rating,
      Value<int> viewCount,
      Value<int> downloadCount,
      Value<int> bookmarkCount,
      Value<String> coverXs,
      Value<String> coverLg,
      Value<int> categoryId,
      Value<String> categoryName,
      Value<int> groupId,
      Value<String> groupName,
      Value<String> groupShortName,
      Value<int> gradeId,
      Value<String> gradeName,
      Value<String> gradeLabel,
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

  ColumnFilters<double> get rating => $composableBuilder(
    column: $table.rating,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<int> get viewCount => $composableBuilder(
    column: $table.viewCount,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<int> get downloadCount => $composableBuilder(
    column: $table.downloadCount,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<int> get bookmarkCount => $composableBuilder(
    column: $table.bookmarkCount,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get coverXs => $composableBuilder(
    column: $table.coverXs,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get coverLg => $composableBuilder(
    column: $table.coverLg,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<int> get categoryId => $composableBuilder(
    column: $table.categoryId,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get categoryName => $composableBuilder(
    column: $table.categoryName,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<int> get groupId => $composableBuilder(
    column: $table.groupId,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get groupName => $composableBuilder(
    column: $table.groupName,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get groupShortName => $composableBuilder(
    column: $table.groupShortName,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<int> get gradeId => $composableBuilder(
    column: $table.gradeId,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get gradeName => $composableBuilder(
    column: $table.gradeName,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get gradeLabel => $composableBuilder(
    column: $table.gradeLabel,
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

  ColumnOrderings<double> get rating => $composableBuilder(
    column: $table.rating,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<int> get viewCount => $composableBuilder(
    column: $table.viewCount,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<int> get downloadCount => $composableBuilder(
    column: $table.downloadCount,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<int> get bookmarkCount => $composableBuilder(
    column: $table.bookmarkCount,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get coverXs => $composableBuilder(
    column: $table.coverXs,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get coverLg => $composableBuilder(
    column: $table.coverLg,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<int> get categoryId => $composableBuilder(
    column: $table.categoryId,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get categoryName => $composableBuilder(
    column: $table.categoryName,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<int> get groupId => $composableBuilder(
    column: $table.groupId,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get groupName => $composableBuilder(
    column: $table.groupName,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get groupShortName => $composableBuilder(
    column: $table.groupShortName,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<int> get gradeId => $composableBuilder(
    column: $table.gradeId,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get gradeName => $composableBuilder(
    column: $table.gradeName,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get gradeLabel => $composableBuilder(
    column: $table.gradeLabel,
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

  GeneratedColumn<double> get rating =>
      $composableBuilder(column: $table.rating, builder: (column) => column);

  GeneratedColumn<int> get viewCount =>
      $composableBuilder(column: $table.viewCount, builder: (column) => column);

  GeneratedColumn<int> get downloadCount => $composableBuilder(
    column: $table.downloadCount,
    builder: (column) => column,
  );

  GeneratedColumn<int> get bookmarkCount => $composableBuilder(
    column: $table.bookmarkCount,
    builder: (column) => column,
  );

  GeneratedColumn<String> get coverXs =>
      $composableBuilder(column: $table.coverXs, builder: (column) => column);

  GeneratedColumn<String> get coverLg =>
      $composableBuilder(column: $table.coverLg, builder: (column) => column);

  GeneratedColumn<int> get categoryId => $composableBuilder(
    column: $table.categoryId,
    builder: (column) => column,
  );

  GeneratedColumn<String> get categoryName => $composableBuilder(
    column: $table.categoryName,
    builder: (column) => column,
  );

  GeneratedColumn<int> get groupId =>
      $composableBuilder(column: $table.groupId, builder: (column) => column);

  GeneratedColumn<String> get groupName =>
      $composableBuilder(column: $table.groupName, builder: (column) => column);

  GeneratedColumn<String> get groupShortName => $composableBuilder(
    column: $table.groupShortName,
    builder: (column) => column,
  );

  GeneratedColumn<int> get gradeId =>
      $composableBuilder(column: $table.gradeId, builder: (column) => column);

  GeneratedColumn<String> get gradeName =>
      $composableBuilder(column: $table.gradeName, builder: (column) => column);

  GeneratedColumn<String> get gradeLabel => $composableBuilder(
    column: $table.gradeLabel,
    builder: (column) => column,
  );

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
          PrefetchHooks Function({bool versionId})
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
                Value<double> rating = const Value.absent(),
                Value<int> viewCount = const Value.absent(),
                Value<int> downloadCount = const Value.absent(),
                Value<int> bookmarkCount = const Value.absent(),
                Value<String> coverXs = const Value.absent(),
                Value<String> coverLg = const Value.absent(),
                Value<int> categoryId = const Value.absent(),
                Value<String> categoryName = const Value.absent(),
                Value<int> groupId = const Value.absent(),
                Value<String> groupName = const Value.absent(),
                Value<String> groupShortName = const Value.absent(),
                Value<int> gradeId = const Value.absent(),
                Value<String> gradeName = const Value.absent(),
                Value<String> gradeLabel = const Value.absent(),
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
                rating: rating,
                viewCount: viewCount,
                downloadCount: downloadCount,
                bookmarkCount: bookmarkCount,
                coverXs: coverXs,
                coverLg: coverLg,
                categoryId: categoryId,
                categoryName: categoryName,
                groupId: groupId,
                groupName: groupName,
                groupShortName: groupShortName,
                gradeId: gradeId,
                gradeName: gradeName,
                gradeLabel: gradeLabel,
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
                Value<double> rating = const Value.absent(),
                Value<int> viewCount = const Value.absent(),
                Value<int> downloadCount = const Value.absent(),
                Value<int> bookmarkCount = const Value.absent(),
                Value<String> coverXs = const Value.absent(),
                Value<String> coverLg = const Value.absent(),
                required int categoryId,
                required String categoryName,
                required int groupId,
                required String groupName,
                required String groupShortName,
                required int gradeId,
                required String gradeName,
                required String gradeLabel,
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
                rating: rating,
                viewCount: viewCount,
                downloadCount: downloadCount,
                bookmarkCount: bookmarkCount,
                coverXs: coverXs,
                coverLg: coverLg,
                categoryId: categoryId,
                categoryName: categoryName,
                groupId: groupId,
                groupName: groupName,
                groupShortName: groupShortName,
                gradeId: gradeId,
                gradeName: gradeName,
                gradeLabel: gradeLabel,
                rowid: rowid,
              ),
          withReferenceMapper: (p0) => p0
              .map(
                (e) =>
                    (e.readTable(table), $$BooksTableReferences(db, table, e)),
              )
              .toList(),
          prefetchHooksCallback: ({versionId = false}) {
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
      PrefetchHooks Function({bool versionId})
    >;

class $AppDatabaseManager {
  final _$AppDatabase _db;
  $AppDatabaseManager(this._db);
  $$AppVersionsTableTableManager get appVersions =>
      $$AppVersionsTableTableManager(_db, _db.appVersions);
  $$BooksTableTableManager get books =>
      $$BooksTableTableManager(_db, _db.books);
}
