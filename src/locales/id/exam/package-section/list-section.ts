export default {
    menu: "Bagian Paket",
    title: "Daftar Bagian Paket",
    description: "Kelola daftar bagian-bagian untuk paket ujian.",
    formTitleRequired: "Judul wajib diisi",
    formTitle: "Judul",
    formTitlePlaceholder: "Masukkan judul bagian",
    formDuration: "Durasi (Menit)",
    formDurationPlaceholder: "Opsional",
    formDurationHelp: "Masukkan 0 jika tidak ada batas waktu.",
    formDurationRequired: "Durasi wajib diisi",
    formActive: "Aktif",
    formActiveHelp: "Tampilkan bagian ini kepada siswa.",
    formPackage: "Paket Ujian",
    formPackagePlaceholder: "Pilih paket ujian",
    formPackageRequired: "Paket ujian wajib dipilih",
    editTitle: "Edit Bagian",
    createTitle: "Buat Bagian",
    editDesc: "Perbarui detail bagian ini.",
    createDesc: "Tambahkan bagian baru ke paket ujian ini.",
    updateSuccess: "Bagian berhasil diperbarui",
    updateError: "Gagal memperbarui bagian",
    createSuccess: "Bagian berhasil dibuat",
    createError: "Gagal membuat bagian",
    pageTitle: "Detail Paket Ujian",
    createButton: "Tambah Bagian",

    // keys for list table
    table: {
        search: "Cari bagian...",
        noResult: "Tidak ada data bagian.",
        columns: {
            title: "Judul",
            package: "Paket Ujian",
            questions: "Jumlah Soal",
            duration: "Durasi",
            status: "Status",
            updatedAt: "Terakhir Diperbarui",
            actions: "Aksi"
        },
        status: {
            active: "Aktif",
            inactive: "Tidak Aktif"
        },
        actions: {
            openMenu: "Buka menu",
            detail: "Detail",
            edit: "Edit",
            delete: "Hapus"
        }
    },

    // keys for delete dialog
    delete: {
        confirmTitle: "Hapus Bagian",
        confirmDesc: "Apakah Anda yakin ingin menghapus bagian '{{title}}'?",
        deleteInfo: "Menghapus bagian akan menghapus semua data yang tersambung dengan bagian ini secara permanen.",
        success: "Bagian berhasil dihapus",
        error: "Gagal menghapus bagian"
    },

    notFound: {
        title: "Paket Ujian Tidak Ditemukan",
        message: "Paket ujian yang Anda cari tidak ada atau mungkin sudah dihapus.",
        backButton: "Kembali ke Daftar Paket"
    },
    sections: {
        title: "Bagian Paket",
        description: "Daftar bagian pada paket ujian ini.",
        orderSuccess: "Berhasil mengubah urutan bagian",
        orderError: "Gagal mengubah urutan bagian",
        deleteConfirm: {
            title: "Hapus Bagian {{name}}?",
            description: "Apakah Anda yakin ingin menghapus bagian ini?",
            infoTitle: "Menghapus bagian akan berakibat:",
            consequence1: "Bagian ini tidak akan lagi tersedia di paket ujian.",
            consequence2: "Menghapus referensi bagian pada soal yang terkait.",
            consequence3: "Data tidak dapat dikembalikan.",
            cancel: "Batal",
            confirm: "Hapus Bagian"
        },
        deleteSuccess: "Bagian berhasil dihapus",
        deleteError: "Gagal menghapus bagian",
        active: "Aktif",
        inactive: "Tidak Aktif",
        duration: "{{minutes}} menit",
        questions: "{{count}} Soal",
        noDataTitle: "Belum ada bagian",
        noDataDescription: "Klik tombol Tambah Bagian untuk mulai menambahkan."
    }
}