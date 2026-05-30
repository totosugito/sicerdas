import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import { Type } from "@sinclair/typebox";
import { withErrorHandler } from "../../utils/withErrorHandler.ts";
import env from "../../config/env.config.ts";
import { getTypedI18n } from "../../utils/i18n-typed.ts";
import axios from "axios";

const periodicDataRoute: FastifyPluginAsyncTypebox = async (app) => {
  app.route({
    url: "/periodic-data",
    method: "GET",
    schema: {
      tags: ["V1/App"],
      summary: "Proxy to download periodic table zip",
      description: "Streams/proxies the periodic table zip file download directly from storage",
      response: {
        200: Type.Any(),
        "4xx": Type.Object({
          success: Type.Boolean({ default: false }),
          message: Type.String(),
        }),
        "5xx": Type.Object({
          success: Type.Boolean({ default: false }),
          message: Type.String(),
        }),
      },
    },
    handler: withErrorHandler(async function handler(
      req,
      reply,
    ) {
      const { t } = getTypedI18n(req);
      const s3Url = env.server.s3Storage.publicUrl;
      const url = `${s3Url}/table-periodic/periodic-table.zip`.replace(/([^:]\/)\/+/g, "$1");

      try {
        const response = await axios({
          method: "get",
          url: url,
          responseType: "stream",
        });

        const contentType = response.headers["content-type"];
        const contentLength = response.headers["content-length"];
        const contentDisposition = response.headers["content-disposition"];

        if (contentType) {
          reply.header("content-type", String(contentType));
        } else {
          reply.header("content-type", "application/zip");
        }

        if (contentLength) {
          reply.header("content-length", String(contentLength));
        }

        if (contentDisposition) {
          reply.header("content-disposition", String(contentDisposition));
        } else {
          reply.header("content-disposition", 'attachment; filename="periodic-table.zip"');
        }

        return reply.send(response.data);
      } catch (error: any) {
        req.log.error(error, "Failed to proxy periodic table zip from storage");
        return reply.status(500).send({
          success: false,
          message: t(($) => $.periodic.downloadFailed),
        });
      }
    }),
  });
};

export default periodicDataRoute;
