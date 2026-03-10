export default {
    menu: "Daftar Soal",
    title: "Manajemen Soal Ujian",
    description: "Kelola bank soal ujian, tingkat kesulitan, dan kategori soal.",
    backToPage: "Kembali ke Daftar",
    table: {
        search: "Cari soal...",
        noData: "Tidak ada data soal.",
        columns: {
            content: "Konten Soal",
            subject: "Subyek",
            difficulty: "Kesulitan",
            type: "Jenis",
            educationGrade: "Jenjang / Kelas",
            requiredTier: "Tier",
            totalOptions: "Opsi",
            status: "Status",
            updatedAt: "Diperbarui Pada",
            actions: "Aksi"
        },
        actions: {
            edit: "Ubah",
            delete: "Hapus",
            openMenu: "Buka menu"
        },
        noResult: "Tidak ada data soal yang ditemukan."
    },
    delete: {
        confirmTitle: "Hapus Soal",
        confirmDesc: "Apakah Anda yakin ingin menghapus soal ini?",
        deleteInfo: "Menghapus soal akan menghilangkan data soal dari bank soal secara permanen.",
        success: "Soal berhasil dihapus.",
        error: "Gagal menghapus soal."
    },
    form: {
        subject: {
            label: "Subyek",
            placeholder: "Pilih Subyek",
            required: "Subyek wajib dipilih"
        },
        passage: {
            label: "Bacaan / Passage",
            placeholder: "Pilih Bacaan",
        },
        content: {
            label: "Konten Soal",
            placeholder: "Tulis or tempel konten soal di sini...",
            required: "Konten soal tidak boleh kosong"
        },
        difficulty: {
            label: "Tingkat Kesulitan",
            placeholder: "Pilih Kesulitan",
            required: "Tingkat kesulitan wajib dipilih",
            options: {
                easy: "Mudah",
                medium: "Sedang",
                hard: "Sulit"
            }
        },
        type: {
            label: "Jenis Soal",
            placeholder: "Pilih Jenis",
            required: "Jenis soal wajib dipilih",
            options: {
                multiple_choice: "Pilihan Ganda",
                essay: "Esai"
            }
        },
        requiredTier: {
            label: "Tier Minimal",
            placeholder: "Pilih Tier",
            required: "Tier minimal wajib dipilih"
        },
        educationGrade: {
            label: "Jenjang / Kelas",
            placeholder: "Pilih Jenjang",
        },
        isActive: {
            label: "Status Aktif",
            description: "Soal yang aktif dapat dipilih saat membuat ujian."
        }
    },
    create: {
        title: "Tambah Soal",
        description: "Buat soal baru untuk bank soal.",
        success: "Soal berhasil ditambahkan."
    },
    edit: {
        title: "Ubah Soal",
        description: "Perbarui konten atau pengaturan soal.",
        success: "Soal berhasil diperbarui.",
        tabs: {
            settings: "Pengaturan",
            content: "Isi Soal",
            options: "Pilihan",
            solutions: "Solusi",
            tags: "Tag"
        },
        settings: {
            title: "Pengaturan Umum",
            description: "Konfigurasi subyek, tingkat kesulitan, tier, dan jenjang pendidikan untuk soal ini."
        },
        content: {
            title: "Isi Pertanyaan",
            description: "Masukkan teks pertanyaan menggunakan editor rich-text di bawah ini."
        },
        options: {
            title: "Pilihan Jawaban",
            description: "Tambahkan dan tentukan pilihan jawaban untuk soal pilihan ganda.",
            addButton: "Tambah Pilihan",
            empty: "Belum ada pilihan jawaban yang ditambahkan.",
            correct: "Benar",
            incorrect: "Salah",
            contentPlaceholder: "Pilihan dengan konten teks/gambar...",
            noContent: "Tidak ada konten",
            orderSuccess: "Urutan pilihan berhasil diperbarui.",
            orderError: "Gagal memperbarui urutan pilihan.",
            notifications: {
                createSuccess: "Pilihan jawaban berhasil ditambahkan.",
                updateSuccess: "Pilihan jawaban berhasil diperbarui.",
            },
            form: {
                content: {
                    label: "Konten Pilihan",
                    placeholder: "Tulis konten pilihan di sini...",
                    required: "Konten pilihan tidak boleh kosong"
                },
                isCorrect: {
                    label: "Pilihan Benar",
                    description: "Tandai jika ini adalah jawaban yang benar"
                }
            },
            dialog: {
                addTitle: "Tambah Pilihan Jawaban",
                editTitle: "Ubah Pilihan Jawaban",
                createDescription: "Tambahkan pilihan jawaban baru untuk soal ini.",
                editDescription: "Perbarui konten atau status kebenaran dari pilihan jawaban ini."
            }
        },
        solutions: {
            title: "Pembahasan & Solusi",
            description: "Berikan penjelasan langkah demi langkah dan tips untuk menjawab soal.",
            addButton: "Solusi Baru",
            empty: "Klik tombol \"Solusi Baru\" untuk menambahkan pembahasan tambahan seperti trik cepat atau tips khusus."
        },
        tags: {
            title: "Tagging Materi",
            description: "Hubungkan soal dengan kategori materi atau konsep tertentu untuk keperluan analisis & adaptif learning.",
            label: "Pilih Tag Materi",
            placeholder: "Ketik untuk mencari materi (e.g. Aljabar, Trigonometri)...",
            currentTags: "Tag Saat Ini"
        },
        notFound: {
            title: "Pertanyaan Tidak Ditemukan",
            message: "Data pertanyaan tidak ditemukan atau terjadi kesalahan saat mengambil data dari server.",
            retryButton: "Coba Lagi"
        },
        loading: "Memuat data pertanyaan...",
        loadingTitle: "Sedang Memuat"
    }
}
