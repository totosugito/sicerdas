use crate::modules::app::types::DictionaryPackage;

pub fn list_dictionary_packages() -> Vec<DictionaryPackage> {
    vec![
        DictionaryPackage {
            pack_id: 3,
            pack_name: "003_id_en_01_50F2".to_string(),
            pack_release_date: "24 Juni 2026".to_string(),
            pack_file_size: 5_542_985,
            pack_title: "Kamus Indonesia - Inggris".to_string(),
            pack_source: "https://www.dictionarist.com".to_string(),
            pack_desc: "Kamus terjemahan dari bahasa Indonesia ke Inggris dan sebaliknya.".to_string(),
            pack_url: "https://storage.sicerdas.com/dictionary/003_id_en_01_50F2.zip".to_string(),
            pack_word_info: vec![
                "60.210 kosakata Indonesia".to_string(),
                "55.978 kosakata Inggris".to_string(),
            ],
            pack_sample_screen: vec![
                "https://storage.sicerdas.com/dictionary/images/003_id_en_10_01.png".to_string(),
                "https://storage.sicerdas.com/dictionary/images/003_id_en_10_02.png".to_string(),
                "https://storage.sicerdas.com/dictionary/images/003_id_en_10_03.png".to_string(),
                "https://storage.sicerdas.com/dictionary/images/003_id_en_11_02.png".to_string(),
                "https://storage.sicerdas.com/dictionary/images/003_id_en_11_03.png".to_string(),
                "https://storage.sicerdas.com/dictionary/images/003_id_en_11_04.png".to_string(),
            ],
        },
        DictionaryPackage {
            pack_id: 4,
            pack_name: "004_kb_kb_01_eb22".to_string(),
            pack_release_date: "24 Juni 2026".to_string(),
            pack_file_size: 14_489_769,
            pack_title: "KBBI Edisi VI".to_string(),
            pack_source: "https://kbbi.kemdikbud.go.id".to_string(),
            pack_desc: "Kamus Besar Bahasa Indonesia Edisi VI".to_string(),
            pack_url: "https://storage.sicerdas.com/dictionary/004_kb_kb_01_eb22.zip".to_string(),
            pack_word_info: vec!["194.692 kosakata KBBI".to_string()],
            pack_sample_screen: vec![
                "https://storage.sicerdas.com/dictionary/images/004_kbbi_00_01.png".to_string(),
                "https://storage.sicerdas.com/dictionary/images/004_kbbi_00_02.png".to_string(),
                "https://storage.sicerdas.com/dictionary/images/004_kbbi_00_03.png".to_string(),
                "https://storage.sicerdas.com/dictionary/images/004_kbbi_00_04.png".to_string(),
            ],
        },
    ]
}
