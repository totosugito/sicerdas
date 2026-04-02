const version = {
  title: "Versi Aplikasi",
  menu: "Manajemen Versi",
  fields: {
    appVersion: "Versi Aplikasi",
    dbVersion: "Versi Database",
    dataType: "Tipe Data",
    status: "Status",
    name: "Nama",
    note: "Catatan",
    publishedAt: "Dipublikasikan Pada",
  },
  table: {
    search: "Cari versi...",
    noResult: "Versi tidak ditemukan",
    columns: {
      appVersion: "Versi App",
      dbVersion: "Versi DB",
      dataType: "Tipe Data",
      status: "Status",
      name: "Nama",
      updatedAt: "Terakhir Diperbarui",
    },
  },
  delete: {
    confirmTitle: "Hapus Versi",
    confirmDesc:
      "Apakah Anda yakin ingin menghapus versi {{title}}? Tindakan ini tidak dapat dibatalkan.",
    deleteInfo: "Menghapus versi ini akan menghapus data versi secara permanen.",
    success: "Versi berhasil dihapus",
    error: "Gagal memuat detail versi",
  },
  create: {
    title: "Buat Versi Baru",
    description: "Tambahkan versi aplikasi atau database baru ke sistem.",
  },
  edit: {
    title: "Edit Versi",
    description: "Perbarui informasi versi aplikasi atau database.",
  },
  backToPage: "Kembali ke Daftar Versi",
  form: {
    appVersion: {
      label: "Versi Aplikasi",
      placeholder: "Masukkan versi aplikasi (misal: 1)",
      required: "Versi aplikasi wajib diisi",
    },
    dbVersion: {
      label: "Versi Database (yyMMDD)",
      placeholder: "Masukkan versi database (misal: 260403)",
      required: "Versi database wajib diisi",
    },
    dataType: {
      label: "Tipe Data",
      placeholder: "Pilih tipe data",
      required: "Tipe data wajib diisi",
      options: {
        book: "Buku",
        exam: "Ujian",
        test: "Tes",
        course: "Kursus",
        other: "Lainnya",
      },
    },
    status: {
      label: "Status",
      placeholder: "Pilih status",
      required: "Status wajib diisi",
      options: {
        published: "Dipublikasikan",
        unpublished: "Belum Dipublikasikan",
        archived: "Diarsipkan",
        deleted: "Dihapus",
      },
    },
    name: {
      label: "Nama Versi",
      placeholder: "Masukkan nama versi",
      required: "Nama versi wajib diisi",
    },
    note: {
      label: "Catatan Perubahan",
    },
  },
  notifications: {
    createSuccess: "Versi berhasil dibuat",
    updateSuccess: "Versi berhasil diperbarui",
  },
};

export default version;
