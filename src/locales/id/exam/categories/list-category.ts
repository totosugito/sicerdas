export default {
    menu: "Kategori",
    title: "Manajemen Kategori",
    description: "Kelola kategori ujian untuk mempermudah organisasi paket soal.",
    editDescription: "Edit kategori ujian untuk mempermudah organisasi paket soal.",
    createDescription: "Tambah kategori ujian untuk mempermudah organisasi paket soal.",
    table: {
        search: "Cari kategori...",
        noData: "Tidak ada data kategori.",
        columns: {
            name: "Nama Kategori",
            description: "Deskripsi",
            status: "Status",
            createdAt: "Dibuat Pada",
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
        }
    },
    form: {
        name: {
            label: "Nama Kategori",
            placeholder: "Contoh: UTBK SNBT 2026",
            required: "Nama wajib diisi"
        },
        description: {
            label: "Deskripsi",
            placeholder: "Deskripsi singkat mengenai kategori ini..."
        },
        isActive: {
            label: "Status Aktif",
            description: "Kategori yang aktif dapat dilihat oleh pengguna."
        }
    },
    dialog: {
        addTitle: "Tambah Kategori",
        editTitle: "Ubah Kategori",
        nameLabel: "Nama Kategori",
        descriptionLabel: "Deskripsi",
        submit: "Simpan",
        cancel: "Batal"
    },
    delete: {
        confirmTitle: "Hapus Kategori",
        confirmDesc: "Apakah Anda yakin ingin menghapus kategori '{{name}}'?",
        deleteInfo: "Data yang sudah dihapus tidak bisa dibatalkan dan semua paket soal yang terkait dengan kategori ini akan kehilangan referensi kategorinya.",
        success: "Kategori berhasil dihapus.",
        error: "Gagal menghapus kategori."
    },
    notifications: {
        createSuccess: "Kategori berhasil ditambahkan.",
        updateSuccess: "Kategori berhasil diperbarui.",
    }
}