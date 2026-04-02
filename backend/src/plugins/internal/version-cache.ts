import fp from "fastify-plugin";
import { db } from "../../db/db-pool.ts";
import { appVersion } from "../../db/schema/app/app-version.ts";
import { EnumContentStatus } from "../../db/schema/enum/enum-app.ts";
import { and, eq, desc } from "drizzle-orm";

export interface VersionCache {
  get(type: string): number | null;
  refresh(type?: string): Promise<void>;
}

const versionCachePlugin = async (fastify: any) => {
  const cache = new Map<string, number>();

  const refresh = async (type?: string) => {
    try {
      const baseQuery = db
        .select({ id: appVersion.id, dataType: appVersion.dataType })
        .from(appVersion)
        .where(eq(appVersion.status, EnumContentStatus.PUBLISHED));

      if (type) {
        const result = await db
          .select({ id: appVersion.id, dataType: appVersion.dataType })
          .from(appVersion)
          .where(
            and(
              eq(appVersion.status, EnumContentStatus.PUBLISHED),
              eq(appVersion.dataType, type as any),
            ),
          )
          .orderBy(desc(appVersion.id))
          .limit(1);

        if (result.length > 0) {
          cache.set(result[0].dataType, result[0].id);
        }
      } else {
        const results = await baseQuery.orderBy(desc(appVersion.id));

        const processedTypes = new Set<string>();
        for (const row of results) {
          if (!processedTypes.has(row.dataType)) {
            cache.set(row.dataType, row.id);
            processedTypes.add(row.dataType);
          }
        }
      }
      fastify.log.info({ cache: Object.fromEntries(cache) }, "Version cache refreshed");
    } catch (error) {
      fastify.log.error(error, "Failed to refresh version cache");
    }
  };

  // Initial load
  await refresh();

  fastify.decorate("versionCache", {
    get: (type: string) => cache.get(type) ?? null,
    refresh,
  });
};

export default fp(versionCachePlugin, {
  name: "version-cache",
  dependencies: ["db-plugin"],
});

declare module "fastify" {
  interface FastifyInstance {
    versionCache: VersionCache;
  }
}
