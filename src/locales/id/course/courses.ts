export default {
  menu: "Daftar Kursus",
  title: "Manajemen Kursus",
  description: "Kelola katalog kursus, buat draft, dan atur materi pembelajaran.",
  table: {
    search: "Cari kursus...",
    noData: "Tidak ada data kursus.",
    columns: {
      code: "Kode",
      name: "Nama Kursus",
      category: "Kategori",
      price: "Harga",
      status: "Status",
      createdAt: "Dibuat Pada",
      actions: "Aksi",
    },
    statusFilter: "Semua Status",
    categoryFilter: "Semua Kategori",
    gradeFilter: "Semua Tingkat",
    sort: {
      placeholder: "Urutkan Berdasarkan",
      courseCode: "Kode Kursus",
      courseName: "Nama Kursus",
      createdAt: "Terbaru",
      updatedAt: "Terakhir Diperbarui",
      price: "Harga",
      status: "Status",
    },
    viewModes: {
      table: "Tabel",
      card: "Kartu",
    },
    cardLabels: {
      chapters: "Bab",
      lectures: "Materi",
      enrolled: "Peserta",
    },
  },
  delete: {
    confirmTitle: "Hapus Kursus",
    confirmDesc: "Apakah Anda yakin ingin menghapus kursus",
    deleteInfo: "Data yang dihapus tidak bisa dikembalikan. Semua bab dan materi di dalam kursus ini juga akan ikut terhapus.",
  },
  create: {
    title: "Tambah Kursus",
    description: "Tambah kursus draft baru untuk materi pembelajaran.",
  },
  edit: {
    title: "Ubah Kursus",
    description: "Perbarui detail dan informasi kursus.",
  },
  detail: {
    title: "Detail Kursus",
    description: "Lihat rincian informasi dan struktur materi kursus.",
  },
  form: {
    courseCode: {
      label: "Kode Kursus",
      placeholder: "Masukkan kode kursus (cth: MATH101)",
      required: "Kode kursus wajib diisi",
    },
    courseName: {
      label: "Nama Kursus",
      placeholder: "Masukkan nama kursus",
      required: "Nama kursus wajib diisi",
    },
    categoryId: {
      label: "Kategori",
      placeholder: "Pilih kategori",
      required: "Kategori wajib dipilih",
    },
    educationGradeId: {
      label: "Tingkat Pendidikan",
      placeholder: "Pilih tingkat pendidikan",
      required: "Tingkat pendidikan wajib dipilih",
    },
    price: {
      label: "Harga (Rp)",
      placeholder: "0",
    },
    status: {
      label: "Status",
      placeholder: "Pilih status",
    },
    courseDescription: {
      label: "Deskripsi Kursus",
      placeholder: "Masukkan deskripsi singkat...",
    },
    whatYouWillLearn: {
      label: "Materi Yang Akan Dipelajari",
      placeholder: "Deskripsi hasil pembelajaran...",
    },
    isPublic: {
      label: "Publik",
      description: "Dapat diakses secara umum",
    },
    isSequential: {
      label: "Pembelajaran Berurutan",
      description: "Modul harus diselesaikan secara berurutan",
    },
    versionId: {
      label: "Versi",
      placeholder: "Pilih versi",
      required: "Versi wajib dipilih",
    },
    thumbnail: {
      label: "Thumbnail Kursus",
      upload: "Unggah Gambar",
      change: "Ganti Gambar",
      remove: "Hapus",
    },
    infoTitle: "Informasi Utama",
    livePreview: "Pratinjau Langsung",
    preview: {
      thumbnailPlaceholder: "Pratinjau Thumbnail",
      defaultCode: "KODE-KURSUS",
      defaultName: "Nama Kursus",
      defaultDescription: "Deskripsi kursus akan muncul di sini.",
      freeText: "Gratis",
    },
  },
};
