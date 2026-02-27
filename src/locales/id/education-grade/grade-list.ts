export default {
    title: "Tingkat Pendidikan",
    description: "Kelola data tingkat pendidikan untuk dihubungkan ke kelas",
    createDescription: "Tambahkan tingkat pendidikan baru",
    editDescription: "Ubah data tingkat pendidikan ini",
    table: {
        search: "Cari tingkat pendidikan...",
        noResult: "Tingkat pendidikan tidak ditemukan.",
        columns: {
            grade: "Kode",
            name: "Nama",
            desc: "Deskripsi",
            updatedAt: "Diperbarui",
            actions: "Aksi",
        },
        actions: {
            openMenu: "Buka menu",
            edit: "Ubah",
            delete: "Hapus",
        },
    },
    form: {
        grade: {
            label: "Kode Tingkat",
            placeholder: "Contoh: 1, 2, tk, sma",
            required: "Kode tingkat harus diisi",
            invalidFormat: "Kode hanya boleh berisi huruf kecil, angka, garis bawah (_), atau setrip (-)"
        },
        name: {
            label: "Nama Tingkat",
            placeholder: "Contoh: Kelas 1, Taman Kanak-Kanak, Sekolah Menengah Atas",
            required: "Nama tingkat harus diisi"
        },
        desc: {
            label: "Deskripsi",
            placeholder: "Masukkan deskripsi singkat",
        }
    },
    delete: {
        success: "Tingkat pendidikan berhasil dihapus",
        confirmTitle: "Hapus Tingkat Pendidikan",
        confirmDesc: "Apakah Anda yakin ingin menghapus '{{name}}'?",
        deleteInfo: "Tindakan ini tidak dapat dibatalkan. Menghapus data ini juga akan menghapus referensi dari komponen lain.",
        notFound: "Tingkat pendidikan tidak ditemukan."
    },
    notifications: {
        createSuccess: "Tingkat pendidikan berhasil ditambahkan",
        updateSuccess: "Tingkat pendidikan berhasil diperbarui"
    }
}
