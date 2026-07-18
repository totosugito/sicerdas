import type { ServiceResponse } from "../../../types/index.ts";
import type { DictionaryPackage } from "../dictionary.schema.ts";

export interface ListDictionaryResponse extends ServiceResponse {
  data?: DictionaryPackage[];
}

export async function listDictionaryService(): Promise<ListDictionaryResponse> {
  const packages: DictionaryPackage[] = [
    {
      packId: 3,
      packName: "003_id_en_01_50F2",
      packReleaseDate: "24 Juni 2026",
      packFileSize: 5542985,
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
      packName: "004_kb_kb_01_eb22",
      packReleaseDate: "24 Juni 2026",
      packFileSize: 14489769,
      packTitle: "KBBI Edisi VI",
      packSource: "https://kbbi.kemdikbud.go.id",
      packDesc: "Kamus Besar Bahasa Indonesia Edisi VI",
      packUrl: "https://storage.sicerdas.com/dictionary/004_kb_kb_01_eb22.zip",
      packWordInfo: ["194.692 kosakata KBBI"],
      packSampleScreen: [
        "https://storage.sicerdas.com/dictionary/images/004_kbbi_00_01.png",
        "https://storage.sicerdas.com/dictionary/images/004_kbbi_00_02.png",
        "https://storage.sicerdas.com/dictionary/images/004_kbbi_00_03.png",
        "https://storage.sicerdas.com/dictionary/images/004_kbbi_00_04.png",
      ],
    },
  ];

  return { success: true, data: packages };
}
