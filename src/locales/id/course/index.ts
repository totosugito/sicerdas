export default {
  menu: "Kursus",
  title: "Manajemen Kursus",
  description: "Kelola materi kursus, bab, modul, dan tingkat pendidikan.",
  courses: {
    menu: "Daftar Kursus",
    title: "Manajemen Kursus",
    description: "Kelola katalog kursus, buat draft, dan atur materi pembelajaran.",
    table: {
      search: "Cari kursus...",
      noData: "Tidak ada data kursus.",
      columns: {
        code: "Kode",
        name: "Nama Kursus",
        category: "Kategori",
        price: "Harga",
        status: "Status",
        createdAt: "Dibuat Pada",
        actions: "Aksi",
      },
      sort: {
        placeholder: "Urutkan Berdasarkan",
        courseCode: "Kode Kursus",
        courseName: "Nama Kursus",
        createdAt: "Terbaru",
        updatedAt: "Terakhir Diperbarui",
        price: "Harga",
        status: "Status",
      },
      viewModes: {
        table: "Tabel",
        card: "Kartu",
      },
    },
    delete: {
      confirmTitle: "Hapus Kursus",
      confirmDesc: "Apakah Anda yakin ingin menghapus kursus '{{title}}'?",
      deleteInfo: "Data yang dihapus tidak bisa dikembalikan. Semua bab dan materi di dalam kursus ini juga akan ikut terhapus.",
    },
    create: {
      title: "Tambah Kursus",
      description: "Tambah kursus baru untuk materi pembelajaran.",
    },
    edit: {
      title: "Ubah Kursus",
      description: "Perbarui detail dan informasi kursus.",
    },
    detail: {
      title: "Detail Kursus",
      description: "Lihat rincian informasi dan struktur materi kursus.",
    },
  },
};
