export default {
    menu: "Subyek",
    title: "Manajemen Subyek",
    description: "Kelola subyek atau mata pelajaran ujian.",
    editDescription: "Ubah data subyek atau mata pelajaran ujian.",
    createDescription: "Tambah subyek atau mata pelajaran ujian baru.",
    table: {
        search: "Cari subyek...",
        noData: "Tidak ada data subyek.",
        columns: {
            name: "Nama Subyek",
            description: "Deskripsi",
            status: "Status",
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
        noResult: "Tidak ada data subyek."
    },
    form: {
        name: {
            label: "Nama Subyek",
            placeholder: "Contoh: Tes Intelegensia Umum (TIU)",
            required: "Nama wajib diisi"
        },
        description: {
            label: "Deskripsi",
            placeholder: "Deskripsi singkat mengenai subyek ini..."
        },
        isActive: {
            label: "Status Aktif",
            description: "Subyek yang aktif dapat dilihat oleh pengguna."
        }
    },
    dialog: {
        addTitle: "Tambah Subyek",
        editTitle: "Ubah Subyek",
        nameLabel: "Nama Subyek",
        descriptionLabel: "Deskripsi",
        submit: "Simpan",
        cancel: "Batal"
    },
    delete: {
        confirmTitle: "Hapus Subyek",
        confirmDesc: "Apakah Anda yakin ingin menghapus subyek '{{name}}'?",
        deleteInfo: "Data yang sudah dihapus tidak bisa dibatalkan.",
        success: "Subyek berhasil dihapus.",
        error: "Gagal menghapus subyek."
    },
    notifications: {
        createSuccess: "Subyek berhasil ditambahkan.",
        updateSuccess: "Subyek berhasil diperbarui.",
    }
}