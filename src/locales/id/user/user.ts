export default {
  title: "Pengguna",
  userNotFound: "Pengguna tidak ditemukan.",
  accountNotFound: "Akun login tidak ditemukan.",
  accountHasNoPassword: "Akun ini tidak memiliki kata sandi (mungkin menggunakan login sosial).",
  passwordUpdatedSuccessfully: "Kata sandi berhasil diperbarui.",
  currentPasswordIncorrect: "Kata sandi saat ini salah.",
  currentPasswordRequired: "Kata sandi saat ini wajib diisi.",
  newPasswordRequired: "Kata sandi baru wajib diisi.",
  passwordsMustBeDifferent: "Kata sandi baru tidak boleh sama dengan kata sandi lama.",
  management: {
    title: "Manajemen Pengguna",
    description:
      "Kelola daftar seluruh pengguna aplikasi, atur tingkat akses (role), serta lakukan pemblokiran jika diperlukan.",
    table: {
      search: "Cari nama atau email...",
      noData: "Tidak ada data pengguna ditemukan.",
    },
    list: {
      success: "Daftar pengguna berhasil dimuat.",
    },
    dialog: {
      addTitle: "Tambah Pengguna Baru",
      editTitle: "Perbarui Data Pengguna",
      addDescription: "Masukkan detail informasi untuk membuat akun pengguna baru secara manual.",
      editDescription: "Ubah informasi profil, email, atau tingkat jabatan (role) pengguna.",
      resetPasswordTitle: "Reset Kata Sandi",
      resetPasswordDesc:
        "Tetapkan kata sandi baru secara paksa untuk {name}. Tindakan ini akan mengganti kata sandi lama mereka.",
      banReason: "Alasan Pemblokiran",
      banTitle: "Blokir Akses",
      unbanTitle: "Aktifkan Kembali",
      banConfirmTitle: "Blokir Pengguna",
      banConfirmDesc: "Apakah Anda yakin ingin memblokir akses {{name}}?",
      unbanConfirmTitle: "Aktifkan Kembali Pengguna",
      unbanConfirmDesc: "Apakah Anda yakin ingin mengembalikan akses untuk {{name}}?",
      banReasonPlaceholder: "Masukkan alasan pemblokiran agar pengguna mengetahui penyebabnya...",
      banInfo:
        "Akun yang terblokir tidak akan bisa mengakses area privat, namun data histori mereka tetap tersimpan di sistem.",
      cannotBanSelf: "Anda tidak dapat mengubah status blokir akun Anda sendiri.",
      changeAvatarTitle: "Ubah Foto Profil",
      deleteAvatar: "Hapus Foto Profil",
      avatarInfo: "Klik pada foto profil di atas untuk mengunggah atau mengganti gambar.",
    },
    delete: {
      confirmTitle: "Hapus Pengguna",
      confirmDesc: "Apakah Anda yakin ingin menghapus permanen pengguna {name}?",
      deleteInfo: "Data akses dan riwayat pengguna ini akan ditiadakan dari sistem.",
      success: "Pengguna berhasil dihapus.",
    },
    create: {
      success: "Akun pengguna baru berhasil didaftarkan.",
      emailExists: "Alamat email ini sudah terdaftar di sistem.",
    },
    update: {
      success: "Perubahan profil pengguna berhasil disimpan.",
      emailExists: "Alamat email ini sudah terdaftar di sistem.",
    },
    notifications: {
      createSuccess: "Akun pengguna baru berhasil didaftarkan.",
      updateSuccess: "Perubahan profil pengguna berhasil disimpan.",
      resetPasswordSuccess: "Kata sandi baru telah berhasil ditetapkan.",
      banSuccess: "Akses akun telah berhasil diblokir.",
      unbanSuccess: "Akses akun telah berhasil diaktifkan kembali.",
    },
  },
};
