export default {
  list: {
    success: "Soal berhasil diambil",
  },
  assign: {
    success: "Soal berhasil ditautkan ke paket ujian",
  },
  unassign: {
    success: "Soal berhasil dihapus dari paket ujian",
  },
  addModal: {
    title: "Pilih Soal untuk Ditambahkan",
    description:
      "Pilih satu atau lebih soal dari daftar di bawah ini untuk dimasukkan ke dalam seksi ini.",
    filterTitle: "Filter Soal",
    resetFilter: "Reset Filter",
    cancel: "Batal",
    confirm: "Tambah {{count}} Soal",
    options: {
      allSubjects: "Semua Subyek",
      allGrades: "Semua Jenjang",
      allTiers: "Semua Tier",
      allTypes: "Semua Jenis",
      allDifficulties: "Semua Kesulitan",
    },
  },
  detail: {
    subtitle: "Kelola dan lihat daftar soal yang termasuk dalam bagian ini.",
    totalCount: "{{count}} Soal",
    addButton: "Tambah Soal",
    createButton: "Buat Soal Baru",
    errors: {
      assign: "Gagal menambahkan soal",
      unassign: "Gagal menghapus soal",
      reorder: "Gagal mengurutkan soal",
      load: {
        title: "Gagal Memuat Soal",
        message: "Sistem gagal mengambil daftar soal untuk bagian ini.",
        retry: "Coba Lagi",
      },
    },
  },
  removeModal: {
    title: "Hapus Soal dari Seksi",
    description:
      "Apakah Anda yakin ingin menghapus soal ini dari seksi? Tindakan ini tidak dapat dibatalkan.",
    confirm: "Ya, Hapus",
    cancel: "Batal",
  },
};
