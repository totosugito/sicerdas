export default {
  title: "Pembahasan & Solusi",
  description: "Berikan penjelasan langkah demi langkah dan tips untuk menjawab soal.",
  addButton: "Solusi Baru",
  empty:
    'Klik tombol "Solusi Baru" untuk menambahkan pembahasan tambahan seperti trik cepat atau tips khusus.',
  form: {
    title: {
      label: "Judul Pembahasan",
      placeholder: "Contoh: Cara Cepat Aljabar",
    },
    type: {
      label: "Jenis Solusi",
      placeholder: "Pilih Jenis",
      options: {
        general: "Umum",
        fast_method: "Cara Cepat",
        video_link: "Link Video",
        tips: "Tips & Trik",
      },
    },
    requiredTier: {
      label: "Tier Minimal",
      placeholder: "Pilih Tier",
    },
    content: {
      label: "Isi Pembahasan",
      placeholder: "Tulis langkah-langkah pembahasan di sini...",
    },
  },
  orderSuccess: "Urutan pembahasan berhasil diperbarui.",
  orderError: "Gagal memperbarui urutan pembahasan.",
  dialog: {
    addTitle: "Tambah Pembahasan",
    editTitle: "Ubah Pembahasan",
    createDescription: "Tambahkan pembahasan baru untuk membantu siswa memahami soal.",
    editDescription: "Perbarui konten atau pengaturan dari pembahasan ini.",
  },
  delete: {
    confirmTitle: "Hapus Pembahasan",
    confirmDesc: "Apakah Anda yakin ingin menghapus pembahasan ini?",
    deleteInfo: "Data yang dihapus tidak bisa dikembalikan.",
    success: "Pembahasan berhasil dihapus.",
    error: "Gagal menghapus pembahasan.",
  },
};
