pub mod entities;

use crate::config::AppConfig;
use sea_orm::{ConnectOptions, Database, DatabaseConnection, DbErr};
use std::time::Duration;

pub async fn connect_db(config: &AppConfig) -> Result<DatabaseConnection, DbErr> {
    let mut opt = ConnectOptions::new(&config.database_url);
    opt.max_connections(4)
        .min_connections(1)
        .connect_timeout(Duration::from_secs(5))
        .idle_timeout(Duration::from_secs(5))
        .sqlx_logging(false);

    Database::connect(opt).await
}
