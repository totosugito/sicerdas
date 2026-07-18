import { db } from "../../../db/db-pool.ts";
import { aiModels } from "../../../db/schema/ai/index.ts";
import { eq, ne, and, or } from "drizzle-orm";
import type { ServiceResponse } from "../../../types/index.ts";
import type { UpdateModelParams, ModelData } from "../ai.schema.ts";

export interface UpdateModelResult extends ServiceResponse {
  data?: ModelData;
}

export async function updateModelService(
  id: string,
  params: UpdateModelParams,
): Promise<UpdateModelResult> {
  const [existingModel] = await db
    .select()
    .from(aiModels)
    .where(eq(aiModels.id, id));

  if (!existingModel) {
    return { success: false, statusCode: 404, errorKey: ($) => $.chatAi.model.update.notFound };
  }

  if (params.name || (params.provider && params.modelIdentifier)) {
    const targetName = params.name || existingModel.name;
    const targetProvider = params.provider || existingModel.provider;
    const targetIdentifier = params.modelIdentifier || existingModel.modelIdentifier;

    const duplicateCheck = await db.query.aiModels.findFirst({
      where: and(
        ne(aiModels.id, id),
        or(
          eq(aiModels.name, targetName),
          and(
            eq(aiModels.provider, targetProvider),
            eq(aiModels.modelIdentifier, targetIdentifier),
          ),
        ),
      ),
    });

    if (duplicateCheck) {
      return { success: false, statusCode: 409, errorKey: ($) => $.chatAi.model.create.exists };
    }
  }

  const [updatedModel] = await db
    .update(aiModels)
    .set({ ...params, updatedAt: new Date() })
    .where(eq(aiModels.id, id))
    .returning();

  return {
    success: true,
    data: {
      ...updatedModel,
      description: updatedModel.description ?? undefined,
      maxTokens: updatedModel.maxTokens ?? undefined,
      requiredTierId: updatedModel.requiredTierId ?? undefined,
      acceptedImageExtensions: updatedModel.acceptedImageExtensions ?? undefined,
      acceptedFileExtensions: updatedModel.acceptedFileExtensions ?? undefined,
      maxFileSize: updatedModel.maxFileSize ?? undefined,
      tierCapabilities: updatedModel.tierCapabilities ?? undefined,
      createdAt: updatedModel.createdAt.toISOString(),
      updatedAt: updatedModel.updatedAt.toISOString(),
    },
  };
}
