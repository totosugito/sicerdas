export default {
  menu: "Daftar Soal",
  title: "Manajemen Soal Ujian",
  description: "Kelola bank soal ujian, tingkat kesulitan, dan kategori soal.",
  backToPage: "Kembali ke Daftar",
  importJson: "Impor dari JSON",
  table: {
    search: "Cari soal...",
    noData: "Tidak ada data soal.",
    columns: {
      content: "Konten Soal",
      subject: "Subyek",
      difficulty: "Kesulitan",
      type: "Jenis",
      educationGrade: "Jenjang / Kelas",
      maxScore: "Skor Maks",
      scoringStrategy: "Strategi Skor",
      requiredTier: "Tier",
      totalOptions: "Opsi",
      status: "Status",
      updatedAt: "Diperbarui Pada",
      actions: "Aksi",
    },
    actions: {
      edit: "Ubah",
      delete: "Hapus",
      openMenu: "Buka menu",
    },
    noResult: "Tidak ada data soal yang ditemukan.",
  },
  delete: {
    confirmTitle: "Hapus Soal",
    confirmDesc: "Apakah Anda yakin ingin menghapus soal ini?",
    deleteInfo: "Menghapus soal akan menghilangkan data soal dari bank soal secara permanen.",
    success: "Soal berhasil dihapus.",
    error: "Gagal menghapus soal.",
  },
  form: {
    subject: {
      label: "Subyek",
      placeholder: "Pilih Subyek",
      required: "Subyek wajib dipilih",
    },
    passage: {
      label: "Bacaan / Passage",
      placeholder: "Pilih Bacaan",
    },
    package: {
      label: "Paket Ujian",
      placeholder: "Pilih Paket...",
    },
    section: {
      label: "Sesi Ujian / Bagian",
      placeholder: "Pilih Sesi...",
      required: "Sesi ujian wajib dipilih jika paket ditentukan",
    },
    content: {
      label: "Konten Soal",
      placeholder: "Tulis or tempel konten soal di sini...",
      required: "Konten soal tidak boleh kosong",
    },
    difficulty: {
      label: "Tingkat Kesulitan",
      placeholder: "Pilih Kesulitan",
      required: "Tingkat kesulitan wajib dipilih",
      options: {
        easy: "Mudah",
        medium: "Sedang",
        hard: "Sulit",
      },
    },
    type: {
      label: "Jenis Soal",
      placeholder: "Pilih Jenis",
      required: "Jenis soal wajib dipilih",
      options: {
        multiple_choice: "Pilihan Tunggal",
        multiple_select: "Pilihan Ganda",
        essay: "Esai",
        statement_reasoning: "Pernyataan-Alasan",
      },
    },
    reasonContent: {
      label: "Konten Alasan (Sebab)",
      placeholder: "Tulis konten alasan di sini...",
    },
    requiredTier: {
      label: "Tier Minimal",
      placeholder: "Pilih Tier",
      required: "Tier minimal wajib dipilih",
    },
    educationGrade: {
      label: "Jenjang / Kelas",
      placeholder: "Pilih Jenjang",
    },
    isActive: {
      label: "Status Aktif",
      description: "Soal yang aktif dapat dipilih saat membuat ujian.",
    },
    scoringStrategy: {
      label: "Strategi Penilaian",
      placeholder: "Pilih Strategi",
      required: "Strategi penilaian wajib dipilih",
      options: {
        all_or_nothing: "Semua / Tidak",
        partial: "Parsial",
        partial_with_penalty: "Parsial + Penalti",
      },
    },
    maxScore: {
      label: "Skor Maksimal",
      placeholder: "Masukkan skor maksimal",
      required: "Skor maksimal wajib diisi",
    },
  },
  create: {
    title: "Tambah Soal",
    description: "Buat soal baru untuk bank soal.",
    success: "Soal berhasil ditambahkan.",
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
      tags: "Tag",
    },
    settings: {
      title: "Pengaturan Umum",
      description:
        "Konfigurasi subyek, tingkat kesulitan, tier, dan jenjang pendidikan untuk soal ini.",
    },
    content: {
      title: "Isi Pertanyaan",
      description: "Masukkan teks pertanyaan menggunakan editor rich-text di bawah ini.",
    },
    notFound: {
      title: "Pertanyaan Tidak Ditemukan",
      message:
        "Data pertanyaan tidak ditemukan atau terjadi kesalahan saat mengambil data dari server.",
      retryButton: "Coba Lagi",
    },
    loading: "Memuat data pertanyaan...",
    loadingTitle: "Sedang Memuat",
    tags: {
      title: "Tag Topik",
      description: "Kelola daftar tag untuk klasifikasi soal ini.",
      placeholder: "Tambah tag...",
      addButton: "Tambah",
      empty: "Belum ada tag yang ditambahkan.",
      noResult: "Tidak ada tag yang ditemukan.",
      addAsNew: 'Tambah "{{name}}" sebagai tag baru',
      existingTags: "Tag yang Sudah Ada",
    },
  },
  detail: {
    title: "Detail Soal",
    description: "Lihat informasi lengkap, konten, pilihan jawaban, dan solusi dari soal ini.",
    editButton: "Ubah Soal",
    tabs: {
      info: "Informasi Umum",
      content: "Konten & Jawaban",
      solutions: "Solusi",
    },
    info: {
      title: "Informasi Umum",
      description: "Detail metadata dan pengaturan soal.",
    },
    content: {
      title: "Konten Pertanyaan",
      noPassage: "Tidak ada bacaan terkait.",
    },
    options: {
      title: "Pilihan Jawaban",
      correctAnswer: "Jawaban Benar",
    },
    solutions: {
      title: "Pembahasan / Solusi",
      empty: "Belum ada pembahasan untuk soal ini.",
    },
  },
  jsonQuestions: {
    title: "Pratinjau JSON Soal",
    description:
      "Pratinjau soal ujian dari berkas JSON secara lokal tanpa menyimpannya ke database.",
    importButton: "Impor JSON",
    pasteButton: "Tempel JSON",
    clearButton: "Bersihkan",
    questionNumber: "Soal",
    selectQuestion: "Pilih soal untuk melihat detailnya.",
    noJsonImported: "Belum ada soal JSON yang diimpor.",
    noJsonImportedDesc: 'Klik tombol "Impor JSON" atau "Tempel JSON" untuk memuat soal.',
    pasteModalTitle: "Tempel Data JSON",
    pasteModalPlaceholder: "Tempel konten JSON Anda di sini...",
    cancel: "Batal",
    submit: "Kirim",
    invalidFormat: "Format JSON tidak valid: Diharapkan objek soal atau array.",
    parseError: "Gagal mem-parsing JSON.",
    exportSelected: "Ekspor Terpilih",
    exportSuccess: "Berhasil mengekspor {count} soal.",
    exportError: "Gagal mengekspor soal: {error}",
    exporting: "Mengekspor...",
    globalParameters: {
      title: "Parameter Global",
      overrideNote:
        "Catatan: Parameter di atas akan menggantikan (override) nilai yang ada di berkas JSON saat melakukan ekspor ke bank soal.",
      selectAll: "Pilih Semua ({selected}/{total})",
    },
    packageParameters: {
      title: "Parameter Paket Ujian",
      description: "Pilih paket dan sesi ujian untuk menugaskan soal yang diekspor.",
      overrideNote:
        "Catatan: Jika dipilih, soal yang diekspor akan secara otomatis ditugaskan ke paket dan sesi ujian ini.",
    },
  },
};
