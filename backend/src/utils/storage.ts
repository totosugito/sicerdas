import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  ListObjectsV2Command,
  DeleteObjectsCommand,
} from "@aws-sdk/client-s3";
import env from "../config/env.config.ts";

export const s3Client = new S3Client({
  region: env.server.s3Storage.region || "auto",
  endpoint: env.server.s3Storage.endpoint,
  credentials: {
    accessKeyId: env.server.s3Storage.accessKeyId || "",
    secretAccessKey: env.server.s3Storage.secretAccessKey || "",
  },
});

export { PutObjectCommand, DeleteObjectCommand, ListObjectsV2Command, DeleteObjectsCommand };
