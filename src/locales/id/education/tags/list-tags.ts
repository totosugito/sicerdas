export default {
    menu: "Tag",
    title: "Manajemen Tag",
    description: "Kelola label atau tag untuk mempermudah pencarian dan filter soal ujian.",
    editDescription: "Ubah data tag yang dipilih untuk menyesuaikan kebutuhan soal ujian.",
    createDescription: "Tambah tag baru untuk memperkaya kategorisasi soal ujian.",
    table: {
        search: "Cari tag...",
        noData: "Tidak ada data tag.",
        columns: {
            name: "Nama Tag",
            description: "Deskripsi",
            status: "Status",
            totalQuestions: "Total Soal",
            createdAt: "Dibuat Pada",
            updatedAt: "Diperbarui Pada",
            actions: "Aksi"
        },
        status: {
            active: "Aktif",
            inactive: "Tidak Aktif"
        },
        actions: {
            edit: "Ubah",
            delete: "Hapus",
            openMenu: "Buka menu"
        },
        noResult: "Tidak ada data tag yang ditemukan."
    },
    form: {
        name: {
            label: "Nama Tag",
            placeholder: "Contoh: Sulit, Mudah, HOTS",
            required: "Nama tag wajib diisi"
        },
        description: {
            label: "Deskripsi",
            placeholder: "Tambahkan penjelasan singkat mengenai tag ini..."
        },
        isActive: {
            label: "Status Aktif",
            description: "Tag yang aktif akan tersedia di pilihan soal."
        }
    },
    delete: {
        confirmTitle: "Hapus Tag",
        confirmDesc: "Apakah Anda yakin ingin menghapus tag '{{name}}'?",
        deleteInfo: "Data yang dihapus tidak bisa dikembalikan. Tag ini akan dihilangkan dari semua soal ujian yang menggunakannya.",
        success: "Tag berhasil dihapus.",
        error: "Gagal menghapus tag. Pastikan tidak sedang digunakan."
    },
    notifications: {
        createSuccess: "Tag berhasil ditambahkan.",
        updateSuccess: "Tag berhasil diperbarui.",
    }
}