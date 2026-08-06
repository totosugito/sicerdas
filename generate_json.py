import json

# Define the variable sets
variables = [
    {"m": 0.5, "v0": 100, "t1": 2, "s1": 80, "tC": 18, "v_tC": -80, "s_tC": 80, "tE": 20, "v_tE": -100, "s_tE": 100, "tA": 8, "tB": 10, "tD": 19},
    {"m": 0.4, "v0": 60, "t1": 2, "s1": 40, "tC": 10, "v_tC": -40, "s_tC": 40, "tE": 12, "v_tE": -60, "s_tE": 60, "tA": 5, "tB": 6, "tD": 11},
    {"m": 1.5, "v0": 80, "t1": 3, "s1": 50, "tC": 13, "v_tC": -50, "s_tC": 50, "tE": 16, "v_tE": -80, "s_tE": 80, "tA": 5, "tB": 8, "tD": 15},
    {"m": 1.2, "v0": 70, "t1": 2, "s1": 50, "tC": 12, "v_tC": -50, "s_tC": 50, "tE": 14, "v_tE": -70, "s_tE": 70, "tA": 6, "tB": 7, "tD": 13},
    {"m": 0.8, "v0": 90, "t1": 4, "s1": 50, "tC": 14, "v_tC": -50, "s_tC": 50, "tE": 18, "v_tE": -90, "s_tE": 90, "tA": 7, "tB": 9, "tD": 16}
]

question = {
    "difficulty": "medium",
    "type": "multiple_choice",
    "maxScore": 1,
    "scoringStrategy": "all_or_nothing",
    "isActive": True,
    "tags": ["Fisika", "Kinematika", "Gerak Lurus"],
    "content": [
        {
            "type": "paragraph",
            "content": [
                {"type": "text", "text": "Peluru bermassa "},
                {"type": "latex", "props": {"latex": "{{m}} \\text{ kg}", "displayMode": False}},
                {"type": "text", "text": " dilempar vertikal ke atas dengan kecepatan awal "},
                {"type": "latex", "props": {"latex": "{{v0}} \\text{ m/s}", "displayMode": False}},
                {"type": "text", "text": ". Besar kelajuannya pada detik ke-"},
                {"type": "latex", "props": {"latex": "{{t1}}", "displayMode": False}},
                {"type": "text", "text": " setelah dilempar adalah ..."}
            ]
        }
    ],
    "options": [
        {
            "content": [
                {
                    "type": "paragraph",
                    "content": [
                        {"type": "text", "text": "sama dengan detik ke-"},
                        {"type": "latex", "props": {"latex": "{{tA}}", "displayMode": False}}
                    ]
                }
            ],
            "isCorrect": False,
            "score": 0,
            "order": 1
        },
        {
            "content": [
                {
                    "type": "paragraph",
                    "content": [
                        {"type": "text", "text": "sama dengan detik ke-"},
                        {"type": "latex", "props": {"latex": "{{tB}}", "displayMode": False}}
                    ]
                }
            ],
            "isCorrect": False,
            "score": 0,
            "order": 2
        },
        {
            "content": [
                {
                    "type": "paragraph",
                    "content": [
                        {"type": "text", "text": "lebih besar dari detik ke-"},
                        {"type": "latex", "props": {"latex": "{{tC}}", "displayMode": False}}
                    ]
                }
            ],
            "isCorrect": False,
            "score": 0,
            "order": 3
        },
        {
            "content": [
                {
                    "type": "paragraph",
                    "content": [
                        {"type": "text", "text": "lebih besar dari detik ke-"},
                        {"type": "latex", "props": {"latex": "{{tD}}", "displayMode": False}}
                    ]
                }
            ],
            "isCorrect": False,
            "score": 0,
            "order": 4
        },
        {
            "content": [
                {
                    "type": "paragraph",
                    "content": [
                        {"type": "text", "text": "lebih kecil dari detik ke-"},
                        {"type": "latex", "props": {"latex": "{{tE}}", "displayMode": False}}
                    ]
                }
            ],
            "isCorrect": True,
            "score": 1,
            "order": 5
        }
    ],
    "solutions": [
        {
            "title": "Cara Konseptual",
            "solutionType": "general",
            "order": 1,
            "content": [
                {
                    "type": "paragraph",
                    "content": [
                        {"type": "text", "text": "Diketahui:", "styles": {"bold": True}}
                    ]
                },
                {
                    "type": "bulletListItem",
                    "content": [
                        {"type": "text", "text": "Kecepatan awal "},
                        {"type": "latex", "props": {"latex": "v_0 = {{v0}} \\text{ m/s}", "displayMode": False}},
                        {"type": "text", "text": "."}
                    ]
                },
                {
                    "type": "bulletListItem",
                    "content": [
                        {"type": "text", "text": "Percepatan gravitasi "},
                        {"type": "latex", "props": {"latex": "g = 10 \\text{ m/s}^2", "displayMode": False}},
                        {"type": "text", "text": " (asumsi standar bila tidak disebutkan arah ke bawah)."}
                    ]
                },
                {
                    "type": "bulletListItem",
                    "content": [
                        {"type": "text", "text": "Massa peluru "},
                        {"type": "latex", "props": {"latex": "m = {{m}} \\text{ kg}", "displayMode": False}},
                        {"type": "text", "text": " (tidak memengaruhi perhitungan kelajuan pada gerak jatuh bebas, ini adalah informasi pengecoh)."}
                    ]
                },
                {
                    "type": "paragraph",
                    "content": [
                        {"type": "text", "text": "Ditanya:", "styles": {"bold": True}},
                        {"type": "text", "text": " Perbandingan kelajuan peluru pada detik ke-"},
                        {"type": "latex", "props": {"latex": "{{t1}}", "displayMode": False}},
                        {"type": "text", "text": " dengan waktu-waktu lainnya."}
                    ]
                },
                {
                    "type": "paragraph",
                    "content": [
                        {"type": "text", "text": "Konsep dan Rumus Dasar:", "styles": {"bold": True}}
                    ]
                },
                {
                    "type": "paragraph",
                    "content": [
                        {"type": "text", "text": "Pada gerak vertikal ke atas, kecepatan benda pada waktu tertentu dapat dihitung menggunakan rumus kinematika. Kelajuan adalah nilai mutlak (positif) dari kecepatan, karena kelajuan tidak bergantung pada arah gerak (naik atau turun). Rumusnya adalah:"}
                    ]
                },
                {
                    "type": "equation",
                    "props": {"latex": "v = v_0 - g \\cdot t"},
                    "content": []
                },
                {
                    "type": "paragraph",
                    "content": [
                        {"type": "text", "text": "Langkah Penyelesaian:", "styles": {"bold": True}}
                    ]
                },
                {
                    "type": "numberedListItem",
                    "content": [
                        {"type": "text", "text": "Hitung kelajuan peluru pada detik ke-"},
                        {"type": "latex", "props": {"latex": "{{t1}}", "displayMode": False}},
                        {"type": "text", "text": "."}
                    ],
                    "children": [
                        {
                            "type": "equation",
                            "props": {
                                "latex": "\\begin{aligned} v_{{{t1}}} &= {{v0}} - 10({{t1}}) \\\\ &= {{s1}} \\text{ m/s} \\end{aligned}"
                            },
                            "content": []
                        },
                        {
                            "type": "paragraph",
                            "content": [
                                {"type": "text", "text": "Karena nilainya positif, maka kelajuannya adalah "},
                                {"type": "latex", "props": {"latex": "{{s1}} \\text{ m/s}", "displayMode": False}},
                                {"type": "text", "text": "."}
                            ]
                        }
                    ]
                },
                {
                    "type": "numberedListItem",
                    "content": [
                        {"type": "text", "text": "Kita periksa kelajuan pada detik ke-"},
                        {"type": "latex", "props": {"latex": "{{tC}}", "displayMode": False}},
                        {"type": "text", "text": " (untuk mengecek opsi \"lebih besar dari detik ke-{{tC}}\")."}
                    ],
                    "children": [
                        {
                            "type": "equation",
                            "props": {
                                "latex": "\\begin{aligned} v_{{{tC}}} &= {{v0}} - 10({{tC}}) \\\\ &= {{v_tC}} \\text{ m/s} \\end{aligned}"
                            },
                            "content": []
                        },
                        {
                            "type": "paragraph",
                            "content": [
                                {"type": "text", "text": "Nilai kecepatan negatif menunjukkan peluru sedang bergerak turun. Kelajuannya adalah nilai mutlaknya, yaitu "},
                                {"type": "latex", "props": {"latex": "{{s_tC}} \\text{ m/s}", "displayMode": False}},
                                {"type": "text", "text": ". Apakah "},
                                {"type": "latex", "props": {"latex": "{{s1}} > {{s_tC}}", "displayMode": False}},
                                {"type": "text", "text": "? Tidak, nilainya ternyata sama besar."}
                            ]
                        }
                    ]
                },
                {
                    "type": "numberedListItem",
                    "content": [
                        {"type": "text", "text": "Kita periksa kelajuan pada detik ke-"},
                        {"type": "latex", "props": {"latex": "{{tE}}", "displayMode": False}},
                        {"type": "text", "text": " (untuk mengecek opsi \"lebih kecil dari detik ke-{{tE}}\")."}
                    ],
                    "children": [
                        {
                            "type": "equation",
                            "props": {
                                "latex": "\\begin{aligned} v_{{{tE}}} &= {{v0}} - 10({{tE}}) \\\\ &= {{v_tE}} \\text{ m/s} \\end{aligned}"
                            },
                            "content": []
                        },
                        {
                            "type": "paragraph",
                            "content": [
                                {"type": "text", "text": "Kelajuannya adalah nilai mutlaknya, yaitu "},
                                {"type": "latex", "props": {"latex": "{{s_tE}} \\text{ m/s}", "displayMode": False}},
                                {"type": "text", "text": ". Apakah "},
                                {"type": "latex", "props": {"latex": "{{s1}} < {{s_tE}}", "displayMode": False}},
                                {"type": "text", "text": "? Ya, "},
                                {"type": "latex", "props": {"latex": "{{s1}} < {{s_tE}}", "displayMode": False}},
                                {"type": "text", "text": " bernilai benar."}
                            ]
                        }
                    ]
                },
                {
                    "type": "paragraph",
                    "content": [
                        {"type": "text", "text": "Jadi, jawaban yang benar adalah "},
                        {"type": "text", "text": "lebih kecil dari detik ke-", "styles": {"bold": True}},
                        {"type": "latex", "props": {"latex": "{{tE}}", "displayMode": False}},
                        {"type": "text", "text": "."}
                    ]
                }
            ]
        }
    ],
    "variableFormulas": {
        "variables": variables,
        "solutions": {
            "answer": "v0 - 10 * t1"
        }
    }
}

output_data = [question]

with open("/home/toto/Documents/sicerdas/test/exam/01_q05.json", "w", encoding="utf-8") as f:
    json.dump(output_data, f, indent=2, ensure_ascii=False)

print("JSON successfully generated!")
