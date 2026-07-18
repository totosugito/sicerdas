import { db } from "../../../db/db-pool.ts";
import { contentReport } from "../../../db/schema/content-report/index.ts";
import type { ServiceResponse } from "../../../types/index.ts";
import type { CreateReportParams, CreateReportData } from "../content-report.schema.ts";

export interface CreateReportResult extends ServiceResponse {
  data?: CreateReportData;
}

export async function createReportService(
  params: CreateReportParams,
  reporterId: string | null,
): Promise<CreateReportResult> {
  const [newReport] = await db
    .insert(contentReport)
    .values({
      name: params.name,
      email: params.email,
      title: params.title,
      contentType: params.contentType,
      referenceId: params.referenceId,
      reason: params.reason,
      description: params.description,
      reporterId,
      extra: params.extra || {},
    })
    .returning({ id: contentReport.id });

  if (!newReport) {
    return { success: false, statusCode: 500, errorKey: ($) => $.report.create.error };
  }

  return {
    success: true,
    data: { id: newReport.id },
  };
}
