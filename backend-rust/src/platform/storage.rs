use crate::config::AppConfig;
use crate::error::AppError;
use aws_sdk_s3::config::{Credentials, Region};
use aws_sdk_s3::primitives::ByteStream;
use aws_sdk_s3::types::{Delete, ObjectIdentifier};
use aws_sdk_s3::Client as S3Client;
use chrono::{DateTime, Datelike, Utc};
use std::path::{Path, PathBuf};
use tokio::fs;

#[derive(Clone)]
pub struct StorageClient {
    s3: Option<S3Client>,
    bucket: Option<String>,
    upload_dir: String,
    uploads_prefix: String,
    api_url: String,
    s3_public_url: Option<String>,
}

impl StorageClient {
    pub fn from_config(config: &AppConfig) -> Self {
        let s3 = if config.use_s3_storage {
            let access_key = config.s3_access_key_id.clone().unwrap_or_default();
            let secret_key = config.s3_secret_access_key.clone().unwrap_or_default();
            let region = config
                .s3_region
                .clone()
                .unwrap_or_else(|| "auto".to_string());

            let creds = Credentials::new(access_key, secret_key, None, None, "sicerdas-env");
            let mut builder = aws_sdk_s3::Config::builder()
                .behavior_version_latest()
                .credentials_provider(creds)
                .region(Region::new(region));

            if let Some(endpoint) = &config.s3_endpoint {
                builder = builder.endpoint_url(endpoint);
            }

            Some(S3Client::from_conf(builder.build()))
        } else {
            None
        };

        let uploads_prefix = Path::new(&config.upload_dir)
            .file_name()
            .and_then(|s| s.to_str())
            .unwrap_or("uploads")
            .trim_matches('/')
            .to_string();

        Self {
            s3,
            bucket: config.s3_bucket_name.clone(),
            upload_dir: config.upload_dir.clone(),
            uploads_prefix,
            api_url: config.api_url.clone(),
            s3_public_url: config.s3_public_url.clone(),
        }
    }

    fn s3_key(&self, relative_path: &str) -> String {
        let rel = relative_path.trim_start_matches('/');
        if self.uploads_prefix.is_empty() {
            rel.to_string()
        } else {
            format!("{}/{}", self.uploads_prefix, rel)
        }
    }

    fn local_path(&self, relative_path: &str) -> PathBuf {
        Path::new(&self.upload_dir).join(relative_path.trim_start_matches('/'))
    }

    pub async fn save_file(
        &self,
        relative_path: &str,
        bytes: Vec<u8>,
        content_type: &str,
    ) -> Result<(), AppError> {
        if let (Some(s3), Some(bucket)) = (&self.s3, &self.bucket) {
            let key = self.s3_key(relative_path);
            s3.put_object()
                .bucket(bucket)
                .key(&key)
                .body(ByteStream::from(bytes))
                .content_type(content_type)
                .send()
                .await
                .map_err(|e| {
                    tracing::error!(err = %e, key = %key, "Failed to upload file to S3");
                    AppError::Internal(format!("S3 upload failed: {e}"))
                })?;
            return Ok(());
        }

        let full_path = self.local_path(relative_path);
        if let Some(parent) = full_path.parent() {
            fs::create_dir_all(parent).await.map_err(|e| {
                tracing::error!(err = %e, dir = %parent.display(), "Failed to create upload directory");
                AppError::Internal(format!("Failed to create directory: {e}"))
            })?;
        }
        fs::write(&full_path, bytes).await.map_err(|e| {
            tracing::error!(err = %e, path = %full_path.display(), "Failed to write file");
            AppError::Internal(format!("Failed to write file: {e}"))
        })?;
        Ok(())
    }

    pub async fn delete_file(&self, relative_path: &str) {
        if let (Some(s3), Some(bucket)) = (&self.s3, &self.bucket) {
            let key = self.s3_key(relative_path);
            if let Err(e) = s3.delete_object().bucket(bucket).key(&key).send().await {
                tracing::error!(err = %e, key = %key, "Error deleting object from S3");
            }
            return;
        }

        let file_path = self.local_path(relative_path);
        if fs::try_exists(&file_path).await.unwrap_or(false) {
            if let Err(e) = fs::remove_file(&file_path).await {
                tracing::error!(err = %e, path = %file_path.display(), "Error deleting file from disk");
            }
        }
    }

    pub async fn delete_storage_directory(
        &self,
        sub_dir: &str,
        entity_id: &str,
        created_at: DateTime<Utc>,
    ) {
        let year_month = format!("{:04}-{:02}", created_at.year(), created_at.month());
        let rel_dir = format!("{}/{}/{}", sub_dir.trim_matches('/'), year_month, entity_id);

        if let (Some(s3), Some(bucket)) = (&self.s3, &self.bucket) {
            let prefix = format!("{}/", self.s3_key(&rel_dir));
            let mut continuation: Option<String> = None;
            loop {
                let mut req = s3.list_objects_v2().bucket(bucket).prefix(&prefix);
                if let Some(token) = continuation.take() {
                    req = req.continuation_token(token);
                }
                let Ok(resp) = req.send().await else {
                    tracing::error!(prefix = %prefix, "Error listing S3 objects for deletion");
                    break;
                };

                let keys: Vec<ObjectIdentifier> = resp
                    .contents()
                    .iter()
                    .filter_map(|obj| obj.key().map(|k| ObjectIdentifier::builder().key(k).build().ok()))
                    .flatten()
                    .collect();

                if keys.is_empty() {
                    break;
                }

                if let Ok(delete) = Delete::builder().set_objects(Some(keys)).build() {
                    if let Err(e) = s3
                        .delete_objects()
                        .bucket(bucket)
                        .delete(delete)
                        .send()
                        .await
                    {
                        tracing::error!(err = %e, prefix = %prefix, "Error deleting S3 objects");
                        break;
                    }
                }

                if resp.is_truncated().unwrap_or(false) {
                    continuation = resp.next_continuation_token().map(|s| s.to_string());
                } else {
                    break;
                }
            }
            return;
        }

        let dir_path = self.local_path(&rel_dir);
        if fs::try_exists(&dir_path).await.unwrap_or(false) {
            if let Err(e) = fs::remove_dir_all(&dir_path).await {
                tracing::error!(err = %e, path = %dir_path.display(), "Error deleting directory from disk");
            }
        }
    }

    pub fn public_url(&self, relative_path: &str) -> String {
        let rel = relative_path.trim_start_matches('/');
        if self.s3.is_some() {
            if let Some(public_url) = &self.s3_public_url {
                let base = public_url.trim_end_matches('/');
                return format!("{base}/{}/{}", self.uploads_prefix, rel);
            }
        }
        format!("{}/uploads/{rel}", self.api_url.trim_end_matches('/'))
    }
}
