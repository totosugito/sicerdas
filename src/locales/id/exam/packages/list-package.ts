export default {
    menu: "Paket",
    title: "Manajemen Paket Ujian",
    description: "Kelola paket soal ujian, atur waktu, dan kategorikan berdasarkan tingkat pendidikan.",
    table: {
        search: "Cari paket ujian...",
        noData: "Tidak ada data paket ujian.",
        columns: {
            title: "Judul Paket",
            category: "Kategori",
            examType: "Tipe Ujian",
            duration: "Durasi (Menit)",
            educationGrade: "Tingkat Pendidikan",
            status: "Status",
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
        noResult: "Tidak ada data paket yang ditemukan."
    },
    delete: {
        confirmTitle: "Hapus Paket Ujian",
        confirmDesc: "Apakah Anda yakin ingin menghapus paket '{{title}}'?",
        deleteInfo: "Data yang dihapus tidak bisa dikembalikan. Semua subtes dan soal di dalam paket ini juga akan ikut terhapus.",
        success: "Paket ujian berhasil dihapus.",
        error: "Gagal menghapus paket ujian."
    },
    form: {
        title: {
            label: "Judul Paket",
            placeholder: "Masukkan judul paket ujian",
            required: "Judul paket wajib diisi"
        },
        category: {
            label: "Kategori",
            placeholder: "Pilih kategori",
            required: "Kategori wajib dipilih"
        },
        examType: {
            label: "Tipe Ujian",
            placeholder: "Pilih tipe ujian",
            required: "Tipe ujian wajib dipilih",
            options: {
                official: "Resmi",
                custom_practice: "Custom"
            }
        },
        durationMinutes: {
            label: "Durasi (Menit)",
            placeholder: "Contoh: 120",
            required: "Durasi wajib diisi",
            min: "Durasi minimal 1 menit"
        },
        educationGradeId: {
            label: "Tingkat Pendidikan",
            placeholder: "Tingkat pendidikan (Opsional)"
        },
        requiredTier: {
            label: "Tier / Subscription",
            placeholder: "Pilih tier minimum"
        },
        description: {
            label: "Deskripsi",
            placeholder: "Keterangan mengenai paket ini..."
        },
        isActive: {
            label: "Status Aktif",
            description: "Paket ujian yang aktif dapat dilihat oleh pengguna."
        }
    },
    create: {
        title: "Tambah Paket Ujian",
        description: "Tambah paket soal ujian baru.",
    },
    notifications: {
        createSuccess: "Paket ujian berhasil ditambahkan.",
        updateSuccess: "Paket ujian berhasil diperbarui."
    }
}