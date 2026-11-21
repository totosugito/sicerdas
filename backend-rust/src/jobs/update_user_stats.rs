use chrono::{Datelike, Duration, NaiveDate, TimeZone, Utc};
use sea_orm::{ConnectionTrait, DatabaseConnection, DbBackend, FromQueryResult, Statement, Value};
use serde_json::{json, Map, Value as JsonValue};

#[derive(Debug, FromQueryResult)]
struct SnapshotRow {
    total_users: i32,
    banned_users: i32,
    role_admin: i32,
    role_teacher: i32,
    role_user: i32,
    role_guest: i32,
    daily_new_users: i32,
}

#[derive(Debug, FromQueryResult)]
struct BreakdownRow {
    key: String,
    total: i32,
}

#[derive(Debug, FromQueryResult)]
struct ActiveRow {
    dau: i32,
    wau: i32,
    mau: i32,
}

#[derive(Debug, FromQueryResult)]
struct SumRow {
    total: i64,
}

pub async fn run(db: &DatabaseConnection) -> Result<(), String> {
    let today = Utc::now().date_naive();
    let start_of_day = Utc.from_utc_datetime(&today.and_hms_opt(0, 0, 0).unwrap());
    let end_of_day = start_of_day + Duration::days(1);

    let iso_week = today.iso_week();
    let week_key = format!("{}-W{:02}", iso_week.year(), iso_week.week());
    let days_from_monday = today.weekday().num_days_from_monday() as i64;
    let week_start_date = today - Duration::days(days_from_monday);
    let week_end_date = week_start_date + Duration::days(7);
    let start_of_week = Utc.from_utc_datetime(&week_start_date.and_hms_opt(0, 0, 0).unwrap());
    let end_of_week = Utc.from_utc_datetime(&week_end_date.and_hms_opt(0, 0, 0).unwrap());

    let month_key = format!("{:04}-{:02}", today.year(), today.month());
    let month_start_date = NaiveDate::from_ymd_opt(today.year(), today.month(), 1).unwrap();
    let (ny, nm) = if today.month() == 12 {
        (today.year() + 1, 1)
    } else {
        (today.year(), today.month() + 1)
    };
    let month_end_date = NaiveDate::from_ymd_opt(ny, nm, 1).unwrap();
    let start_of_month = Utc.from_utc_datetime(&month_start_date.and_hms_opt(0, 0, 0).unwrap());
    let end_of_month = Utc.from_utc_datetime(&month_end_date.and_hms_opt(0, 0, 0).unwrap());
    let daily_key = today.format("%Y-%m-%d").to_string();

    let snap = SnapshotRow::find_by_statement(Statement::from_sql_and_values(
        DbBackend::Postgres,
        r#"
        SELECT
            COUNT(id)::int AS total_users,
            COALESCE(SUM(CASE WHEN banned = true THEN 1 ELSE 0 END), 0)::int AS banned_users,
            COALESCE(SUM(CASE WHEN role = 'admin' THEN 1 ELSE 0 END), 0)::int AS role_admin,
            COALESCE(SUM(CASE WHEN role = 'teacher' THEN 1 ELSE 0 END), 0)::int AS role_teacher,
            COALESCE(SUM(CASE WHEN role = 'user' THEN 1 ELSE 0 END), 0)::int AS role_user,
            COALESCE(SUM(CASE WHEN role = 'guest' THEN 1 ELSE 0 END), 0)::int AS role_guest,
            COALESCE(SUM(CASE WHEN created_at >= $1 AND created_at < $2 THEN 1 ELSE 0 END), 0)::int AS daily_new_users
        FROM users
        "#,
        vec![
            Value::ChronoDateTimeUtc(Some(Box::new(start_of_day))),
            Value::ChronoDateTimeUtc(Some(Box::new(end_of_day))),
        ],
    ))
    .one(db)
    .await
    .map_err(|e| e.to_string())?
    .unwrap_or(SnapshotRow {
        total_users: 0,
        banned_users: 0,
        role_admin: 0,
        role_teacher: 0,
        role_user: 0,
        role_guest: 0,
        daily_new_users: 0,
    });

    let tier_rows = BreakdownRow::find_by_statement(Statement::from_sql_and_values(
        DbBackend::Postgres,
        "SELECT tier_id AS key, COUNT(id)::int AS total FROM users_profiles WHERE tier_id IS NOT NULL GROUP BY tier_id",
        vec![],
    ))
    .all(db)
    .await
    .map_err(|e| e.to_string())?;
    let mut tier_map = Map::new();
    for r in tier_rows {
        tier_map.insert(r.key, JsonValue::from(r.total));
    }

    let edu_rows = BreakdownRow::find_by_statement(Statement::from_sql_and_values(
        DbBackend::Postgres,
        "SELECT education_level::text AS key, COUNT(id)::int AS total FROM users_profiles WHERE education_level IS NOT NULL GROUP BY education_level",
        vec![],
    ))
    .all(db)
    .await
    .map_err(|e| e.to_string())?;
    let mut edu_map = Map::new();
    for r in edu_rows {
        edu_map.insert(r.key, JsonValue::from(r.total));
    }

    let active = ActiveRow::find_by_statement(Statement::from_sql_and_values(
        DbBackend::Postgres,
        r#"
        SELECT
            COUNT(DISTINCT CASE WHEN created_at >= $1 AND created_at < $2 THEN user_id END)::int AS dau,
            COUNT(DISTINCT CASE WHEN created_at >= $3 AND created_at < $4 THEN user_id END)::int AS wau,
            COUNT(DISTINCT CASE WHEN created_at >= $5 AND created_at < $6 THEN user_id END)::int AS mau
        FROM users_sessions
        WHERE created_at >= $5 AND created_at < $6
        "#,
        vec![
            Value::ChronoDateTimeUtc(Some(Box::new(start_of_day))),
            Value::ChronoDateTimeUtc(Some(Box::new(end_of_day))),
            Value::ChronoDateTimeUtc(Some(Box::new(start_of_week))),
            Value::ChronoDateTimeUtc(Some(Box::new(end_of_week))),
            Value::ChronoDateTimeUtc(Some(Box::new(start_of_month))),
            Value::ChronoDateTimeUtc(Some(Box::new(end_of_month))),
        ],
    ))
    .one(db)
    .await
    .map_err(|e| e.to_string())?
    .unwrap_or(ActiveRow {
        dau: 0,
        wau: 0,
        mau: 0,
    });

    let weekly_sum = SumRow::find_by_statement(Statement::from_sql_and_values(
        DbBackend::Postgres,
        "SELECT COALESCE(SUM(new_users_count), 0)::bigint AS total FROM users_stats WHERE period_type = 'daily' AND date >= $1::date AND date < $2::date",
        vec![
            Value::String(Some(Box::new(week_start_date.format("%Y-%m-%d").to_string()))),
            Value::String(Some(Box::new(week_end_date.format("%Y-%m-%d").to_string()))),
        ],
    ))
    .one(db)
    .await
    .map_err(|e| e.to_string())?
    .map(|r| r.total as i32)
    .unwrap_or(0);
    let weekly_new = if weekly_sum > 0 { weekly_sum } else { snap.daily_new_users };

    let monthly_sum = SumRow::find_by_statement(Statement::from_sql_and_values(
        DbBackend::Postgres,
        "SELECT COALESCE(SUM(new_users_count), 0)::bigint AS total FROM users_stats WHERE period_type = 'daily' AND date >= $1::date AND date < $2::date",
        vec![
            Value::String(Some(Box::new(month_start_date.format("%Y-%m-%d").to_string()))),
            Value::String(Some(Box::new(month_end_date.format("%Y-%m-%d").to_string()))),
        ],
    ))
    .one(db)
    .await
    .map_err(|e| e.to_string())?
    .map(|r| r.total as i32)
    .unwrap_or(0);
    let monthly_new = if monthly_sum > 0 { monthly_sum } else { snap.daily_new_users };

    let role_json = json!({
        "admin": snap.role_admin,
        "teacher": snap.role_teacher,
        "user": snap.role_user,
        "guest": snap.role_guest,
    });
    let tier_json = JsonValue::Object(tier_map);
    let edu_json = JsonValue::Object(edu_map);

    for (period_type, period_key, new_users, active_users) in [
        ("daily", daily_key.as_str(), snap.daily_new_users, active.dau),
        ("weekly", week_key.as_str(), weekly_new, active.wau),
        ("monthly", month_key.as_str(), monthly_new, active.mau),
    ] {
        db.execute(Statement::from_sql_and_values(
            DbBackend::Postgres,
            r#"
            INSERT INTO users_stats (
                id, period_type, period_key, date, new_users_count, active_users_count,
                total_users_count, banned_users_count, role_breakdown, tier_breakdown, education_breakdown
            )
            VALUES (
                gen_random_uuid(), $1::stats_period_type, $2, $3::date, $4, $5,
                $6, $7, $8::jsonb, $9::jsonb, $10::jsonb
            )
            ON CONFLICT (period_type, period_key) DO UPDATE SET
                date = EXCLUDED.date,
                new_users_count = EXCLUDED.new_users_count,
                active_users_count = EXCLUDED.active_users_count,
                total_users_count = EXCLUDED.total_users_count,
                banned_users_count = EXCLUDED.banned_users_count,
                role_breakdown = EXCLUDED.role_breakdown,
                tier_breakdown = EXCLUDED.tier_breakdown,
                education_breakdown = EXCLUDED.education_breakdown
            WHERE
                users_stats.new_users_count IS DISTINCT FROM EXCLUDED.new_users_count OR
                users_stats.active_users_count IS DISTINCT FROM EXCLUDED.active_users_count OR
                users_stats.total_users_count IS DISTINCT FROM EXCLUDED.total_users_count OR
                users_stats.banned_users_count IS DISTINCT FROM EXCLUDED.banned_users_count
            "#,
            vec![
                Value::String(Some(Box::new(period_type.to_string()))),
                Value::String(Some(Box::new(period_key.to_string()))),
                Value::String(Some(Box::new(daily_key.clone()))),
                Value::Int(Some(new_users)),
                Value::Int(Some(active_users)),
                Value::Int(Some(snap.total_users)),
                Value::Int(Some(snap.banned_users)),
                Value::Json(Some(Box::new(role_json.clone()))),
                Value::Json(Some(Box::new(tier_json.clone()))),
                Value::Json(Some(Box::new(edu_json.clone()))),
            ],
        ))
        .await
        .map_err(|e| e.to_string())?;
    }

    tracing::info!(daily_key, week_key, month_key, "[Job] update-user-stats complete");
    Ok(())
}
