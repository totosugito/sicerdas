export default {
  menu: "Paket",
  title: "Manajemen Paket Ujian",
  description:
    "Kelola paket soal ujian, atur waktu, dan kategorikan berdasarkan tingkat pendidikan.",
  backToPage: "Kembali ke Daftar",
  table: {
    search: "Cari paket ujian...",
    noData: "Tidak ada data paket ujian.",
    columns: {
      title: "Judul Paket",
      category: "Kategori",
      examType: "Tipe Ujian",
      sections: "Jumlah Seksi",
      duration: "Durasi (Menit)",
      educationGrade: "Tingkat Pendidikan",
      status: "Status",
      updatedAt: "Diperbarui Pada",
      actions: "Aksi",
    },
    status: {
      active: "Aktif",
      inactive: "Tidak Aktif",
    },
    actions: {
      detail: "Detail",
      edit: "Ubah",
      delete: "Hapus",
      openMenu: "Buka menu",
    },
    noResult: "Tidak ada data paket yang ditemukan.",
  },
  delete: {
    confirmTitle: "Hapus Paket Ujian",
    confirmDesc: "Apakah Anda yakin ingin menghapus paket '{{title}}'?",
    deleteInfo:
      "Data yang dihapus tidak bisa dikembalikan. Semua subtes dan soal di dalam paket ini juga akan ikut terhapus.",
    success: "Paket ujian berhasil dihapus.",
    error: "Gagal menghapus paket ujian.",
  },
  form: {
    title: {
      label: "Judul Paket",
      placeholder: "Masukkan judul paket ujian",
      required: "Judul paket wajib diisi",
    },
    category: {
      label: "Kategori",
      placeholder: "Pilih kategori",
      required: "Kategori wajib dipilih",
    },
    examType: {
      label: "Tipe Ujian",
      placeholder: "Pilih tipe ujian",
      required: "Tipe ujian wajib dipilih",
      options: {
        official: "Resmi",
        custom_practice: "Custom",
      },
    },
    durationMinutes: {
      label: "Durasi (Menit)",
      placeholder: "Contoh: 120",
      required: "Durasi wajib diisi",
      min: "Durasi minimal 0 menit",
      max: "Durasi maksimal 1440 menit",
      description: "Durasi ujian dalam menit. 0 berarti tidak terbatas.",
    },
    educationGradeId: {
      label: "Tingkat Pendidikan",
      placeholder: "Tingkat pendidikan (Opsional)",
    },
    requiredTier: {
      label: "Tier / Subscription",
      placeholder: "Pilih tier minimum",
    },
    description: {
      label: "Deskripsi",
      placeholder: "Keterangan mengenai paket ini...",
    },
    isActive: {
      label: "Status Aktif",
      description: "Paket ujian yang aktif dapat dilihat oleh pengguna.",
    },
    thumbnail: {
      label: "Thumbnail Paket",
      description:
        "Gunakan gambar berkualitas tinggi (1200px+). Area tengah akan digunakan untuk tampilan Card.",
      upload: "Unggah Gambar",
      change: "Ganti Gambar",
      remove: "Hapus Gambar",
      dropzone: "Tarik dan lepas gambar di sini atau klik untuk memilih",
    },
    infoTitle: "Informasi Utama",
    preview: {
      title: "Live Authoring Preview",
      description: "Visualisasikan tampilan paket untuk siswa secara langsung",
      card: "Tampilan Card (Siswa)",
      hero: "Tampilan Hero (Detail)",
      empty: "Pratinjau akan muncul di sini saat data diisi",
      viewDetail: "Lihat Detail",
      multiSections: "Banyak Seksi",
      new: "Baru",
      tipLabel: "Tip",
      tip: "Pastikan teks penting pada gambar thumbnail tidak berada di pinggir (Safe Zone 15% dari setiap sisi) agar tetap terbaca jelas di berbagai ukuran layar.",
      titlePlaceholder: "Judul Paket",
      categoryPlaceholder: "Kategori",
      gradePlaceholder: "Semua Tingkatan",
      durationPlaceholder: "0 Menit",
    },
    versionId: {
      label: "Versi",
      placeholder: "Pilih versi",
      required: "Versi wajib dipilih",
    },
  },
  create: {
    title: "Tambah Paket Ujian",
    description: "Tambah paket soal ujian baru.",
  },
  edit: {
    title: "Ubah Paket Ujian",
    description: "Perbarui detail paket ujian.",
  },
  notifications: {
    createSuccess: "Paket ujian berhasil ditambahkan.",
    updateSuccess: "Paket ujian berhasil diperbarui.",
  },
};
