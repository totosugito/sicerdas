export const detailPackage = {
    pageTitle: "Detail Paket Ujian",
    description: "Kelola seksi dan soal yang ada di dalam paket ujian ini.",
    createButton: "Tambah Seksi",
    notFound: {
        title: "Paket Ujian Tidak Ditemukan",
        message: "Paket ujian yang Anda cari tidak ada atau mungkin sudah dihapus.",
        backButton: "Kembali ke Daftar Paket"
    },
    sections: {
        title: "Seksi Paket",
        description: "Daftar seksi pada paket ujian ini.",
        orderSuccess: "Berhasil mengubah urutan seksi",
        orderError: "Gagal mengubah urutan seksi",
        deleteConfirm: {
            title: "Hapus Seksi {{name}}?",
            description: "Apakah Anda yakin ingin menghapus seksi ini?",
            infoTitle: "Menghapus seksi akan berakibat:",
            consequence1: "Seksi ini tidak akan lagi tersedia di paket ujian.",
            consequence2: "Menghapus referensi seksi pada soal yang terkait.",
            consequence3: "Data tidak dapat dikembalikan.",
            cancel: "Batal",
            confirm: "Hapus Seksi"
        },
        deleteSuccess: "Seksi berhasil dihapus",
        deleteError: "Gagal menghapus seksi",
        active: "Aktif",
        inactive: "Tidak Aktif",
        duration: "Durasi: {{minutes}} menit",
        questions: "{{count}} Soal",
        noDataTitle: "Belum ada seksi",
        noDataDescription: "Klik tombol Tambah Seksi untuk mulai menambahkan."
    }
}
