export interface Pasien {
  nik: string;
  panggilan: string;
  nama: string;
  noRm: string;
  jenisKelamin: "P" | "L";
  tanggalLahir: string;
  alamat?: string;
  noHp?: string;
}

export const PATIENT_DATABASE: Pasien[] = [
  {
    nik: "1234567890123456",
    panggilan: "Ny.",
    nama: "Rina Wati",
    noRm: "RM-202408-001",
    jenisKelamin: "P",
    tanggalLahir: "1990-05-12",
    alamat: "Jl. Merdeka No. 10, Jakarta",
    noHp: "081234567890",
  },
  {
    nik: "6543210987654321",
    panggilan: "An.",
    nama: "Budi Susanto",
    noRm: "RM-202408-002",
    jenisKelamin: "L",
    tanggalLahir: "2023-01-15",
    alamat: "Jl. Sudirman No. 5, Bandung",
    noHp: "089876543210",
  },
  {
    nik: "1122334455667788",
    panggilan: "Ny.",
    nama: "Siti Halimah",
    noRm: "RM-202408-003",
    jenisKelamin: "P",
    tanggalLahir: "1995-10-20",
    alamat: "Jl. Thamrin No. 2, Surabaya",
    noHp: "081122334455",
  },
];

export interface PasienAntrean {
  id: string;
  noAntrean: string;
  jenisLayanan: string;
  panggilan: string;
  nama: string;
  noRm: string;
  jenisKelamin: "P" | "L";
  tanggalLahir: string;
  usia: string;
  waktuRegistrasi: string;
  sumberPendaftaran: "Online" | "Offline";
  status: "Menunggu" | "Diperiksa" | "Selesai";
}

export const DUMMY_ANTREAN: PasienAntrean[] = [
  {
    id: "1",
    noAntrean: "A-001",
    jenisLayanan: "Umum",
    panggilan: "Ny.",
    nama: "Rina Wati",
    noRm: "RM-202408-001",
    jenisKelamin: "P",
    tanggalLahir: "1990-05-12",
    usia: "34 th",
    waktuRegistrasi: "2024-08-09T08:15:00",
    sumberPendaftaran: "Offline",
    status: "Diperiksa",
  },
  {
    id: "2",
    noAntrean: "B-001",
    jenisLayanan: "Imunisasi",
    panggilan: "An.",
    nama: "Budi Susanto",
    noRm: "RM-202408-002",
    jenisKelamin: "L",
    tanggalLahir: "2023-01-15",
    usia: "1 th 7 bln",
    waktuRegistrasi: "2024-08-09T08:30:00",
    sumberPendaftaran: "Online",
    status: "Menunggu",
  },
  {
    id: "3",
    noAntrean: "C-001",
    jenisLayanan: "AnteNatal (Kehamilan) - USG 2D",
    panggilan: "Ny.",
    nama: "Siti Halimah",
    noRm: "RM-202408-003",
    jenisKelamin: "P",
    tanggalLahir: "1995-10-20",
    usia: "28 th",
    waktuRegistrasi: "2024-08-09T08:45:00",
    sumberPendaftaran: "Offline",
    status: "Menunggu",
  },
  {
    id: "4",
    noAntrean: "C-002",
    jenisLayanan: "Post Natal (Nifas) - KF",
    panggilan: "Ny.",
    nama: "Dewi Lestari",
    noRm: "RM-202408-004",
    jenisKelamin: "P",
    tanggalLahir: "1992-03-15",
    usia: "32 th",
    waktuRegistrasi: "2024-08-09T09:00:00",
    sumberPendaftaran: "Online",
    status: "Menunggu",
  },
];

