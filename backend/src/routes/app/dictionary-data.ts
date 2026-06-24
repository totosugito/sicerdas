import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import { Type } from "@sinclair/typebox";
import { withErrorHandler } from "../../utils/withErrorHandler.ts";
import { getTypedI18n } from "../../utils/i18n-typed.ts";

const PackageItem = Type.Object({
    packId: Type.Integer(),
    packName: Type.String(),
    packReleaseDate: Type.String(),
    packFileSize: Type.Integer(),
    packTitle: Type.String(),
    packSource: Type.String(),
    packDesc: Type.String(),
    packUrl: Type.String(),
    packWordInfo: Type.Array(Type.String()),
    packSampleScreen: Type.Array(Type.String()),
});

const DictionaryDataResponse = Type.Object({
    success: Type.Boolean(),
    message: Type.String(),
    data: Type.Array(PackageItem),
});

const dictionaryDataRoute: FastifyPluginAsyncTypebox = async (app) => {
    app.route({
        url: "/dictionary-data",
        method: "GET",
        schema: {
            tags: ["V1/App"],
            summary: "Get dictionary package list",
            description: "Returns the list of dictionary database packages",
            response: {
                200: DictionaryDataResponse,
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
        ): Promise<typeof DictionaryDataResponse.static> {
            const { t } = getTypedI18n(req);

            const packages = [
                {
                    packId: 3,
                    packName: "003_id_en_01_50F2",
                    packReleaseDate: "24 Juni 2026",
                    packFileSize: 12242860,
                    packTitle: "Kamus Indonesia - Inggris",
                    packSource: "https://www.dictionarist.com",
                    packDesc: "Kamus terjemahan dari bahasa Indonesia ke Inggris dan sebaliknya.",
                    packUrl: "https://storage.sicerdas.com/dictionary/003_id_en_01_50F2.zip",
                    packWordInfo: ["60.210 kosakata Indonesia", "55.978 kosakata Inggris"],
                    packSampleScreen: [
                        "https://storage.sicerdas.com/dictionary/images/003_id_en_10_01.png",
                        "https://storage.sicerdas.com/dictionary/images/003_id_en_10_02.png",
                        "https://storage.sicerdas.com/dictionary/images/003_id_en_10_03.png",
                        "https://storage.sicerdas.com/dictionary/images/003_id_en_11_02.png",
                        "https://storage.sicerdas.com/dictionary/images/003_id_en_11_03.png",
                        "https://storage.sicerdas.com/dictionary/images/003_id_en_11_04.png",
                    ],
                },
                {
                    packId: 4,
                    packName: "004_kbbi_kbbi_00_00_01_1136",
                    packReleaseDate: "01 Januari 2020",
                    packFileSize: 5808543,
                    packTitle: "KBBI Edisi V",
                    packSource: "https://kbbi.kemdikbud.go.id",
                    packDesc: "Kamus Besar Bahasa Indonesia Edisi V",
                    packUrl: "https://storage.sicerdas.com/dictionary/004_kbbi_kbbi_00_00_01_1136.zip",
                    packWordInfo: ["104.535 kosakata KBBI"],
                    packSampleScreen: [
                        "https://storage.sicerdas.com/dictionary/images/004_kbbi_00_01.png",
                        "https://storage.sicerdas.com/dictionary/images/004_kbbi_00_02.png",
                        "https://storage.sicerdas.com/dictionary/images/004_kbbi_00_03.png",
                        "https://storage.sicerdas.com/dictionary/images/004_kbbi_00_04.png",
                    ],
                },
            ];

            return reply.status(200).send({
                success: true,
                message: t(($) => $.dictionary.success),
                data: packages,
            });
        }),
    });
};

export default dictionaryDataRoute;
