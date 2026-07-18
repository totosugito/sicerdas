import { db } from "../../../db/db-pool.ts";
import { aiModels } from "../../../db/schema/ai/index.ts";
import { eq, or, and } from "drizzle-orm";
import type { ServiceResponse } from "../../../types/index.ts";
import type { CreateModelParams, ModelData } from "../ai.schema.ts";

export interface CreateModelResult extends ServiceResponse {
  data?: ModelData;
}

export async function createModelService(
  params: CreateModelParams,
): Promise<CreateModelResult> {
  const existingModel = await db.query.aiModels.findFirst({
    where: or(
      eq(aiModels.name, params.name),
      and(
        eq(aiModels.provider, params.provider),
        eq(aiModels.modelIdentifier, params.modelIdentifier),
      ),
    ),
  });

  if (existingModel) {
    return { success: false, statusCode: 409, errorKey: ($) => $.chatAi.model.create.exists };
  }

  const [newModel] = await db
    .insert(aiModels)
    .values({
      ...params,
      requiredTierId: params.requiredTierId || null,
      isDefault: params.isDefault || false,
      isEnabled: params.isEnabled !== undefined ? params.isEnabled : true,
      supportsImage: params.supportsImage || false,
      supportsFile: params.supportsFile || false,
    })
    .returning();

  if (!newModel) {
    return { success: false, statusCode: 500, errorKey: ($) => $.chatAi.model.create.exists };
  }

  return {
    success: true,
    data: {
      ...newModel,
      description: newModel.description ?? undefined,
      maxTokens: newModel.maxTokens ?? undefined,
      requiredTierId: newModel.requiredTierId ?? undefined,
      acceptedImageExtensions: newModel.acceptedImageExtensions ?? undefined,
      acceptedFileExtensions: newModel.acceptedFileExtensions ?? undefined,
      maxFileSize: newModel.maxFileSize ?? undefined,
      tierCapabilities: newModel.tierCapabilities ?? undefined,
      createdAt: newModel.createdAt.toISOString(),
      updatedAt: newModel.updatedAt.toISOString(),
    },
  };
}
