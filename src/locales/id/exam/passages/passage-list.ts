export default {
    menu: "Bacaan / Passage",
    title: "Manajemen Bacaan Ujian",
    description: "Kelola teks bacaan, grafik, atau konteks panjang yang digunakan untuk beberapa soal sekaligus.",
    backToPage: "Kembali ke Daftar",
    table: {
        search: "Cari bacaan...",
        noData: "Tidak ada data bacaan.",
        columns: {
            title: "Judul Bacaan",
            subject: "Subyek",
            questions: "Jumlah Soal",
            status: "Status",
            updatedAt: "Diperbarui Pada",
            actions: "Aksi"
        },
        actions: {
            edit: "Ubah",
            delete: "Hapus",
            openMenu: "Buka menu"
        },
        noResult: "Tidak ada data bacaan yang ditemukan."
    },
    delete: {
        confirmTitle: "Hapus Bacaan",
        confirmDesc: "Apakah Anda yakin ingin menghapus bacaan '{{title}}'?",
        deleteInfo: "Menghapus bacaan ini mungkin akan berdampak pada soal yang terhubung. Pastikan tidak ada soal yang menggunakan bacaan ini sebelum menghapus.",
        success: "Bacaan berhasil dihapus.",
        error: "Gagal menghapus bacaan."
    },
    form: {
        title: {
            label: "Judul Bacaan",
            placeholder: "Masukkan judul internal bacaan",
            required: "Judul bacaan wajib diisi"
        },
        subject: {
            label: "Mata Pelajaran",
            placeholder: "Pilih mata pelajaran",
            required: "Mata pelajaran wajib dipilih"
        },
        content: {
            label: "Isi Bacaan",
            placeholder: "Tulis atau tempel isi bacaan di sini...",
            required: "Isi bacaan tidak boleh kosong"
        },
        isActive: {
            label: "Status Aktif",
            description: "Bacaan yang aktif dapat dipilih saat membuat soal."
        }
    },
    create: {
        title: "Tambah Bacaan",
        description: "Buat bacaan baru untuk digunakan dalam ujian.",
    },
    edit: {
        title: "Ubah Bacaan",
        description: "Perbarui isi atau pengaturan bacaan.",
    },
    notifications: {
        createSuccess: "Bacaan berhasil ditambahkan.",
        updateSuccess: "Bacaan berhasil diperbarui."
    }
}