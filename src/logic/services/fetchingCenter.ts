/**
 * Fetching Center Service
 * Central registry for controlling page-specific lazy loading data limits (chunk size / page size).
 * Prevents excessive bandwidth consumption and data egress across modules.
 */

export interface PageFetchingConfig {
  limit: number;
  description?: string;
}

/**
 * Registry of max records fetched per batch for modules using Lazy Loading Strategy.
 * Add new page keys here as needed.
 */
export const PAGE_FETCHING_LIMITS: Record<string, PageFetchingConfig> = {
  // Default fallback limit if pageKey is not explicitly defined
  DEFAULT: {
    limit: 20,
    description: 'Ukuran default standar untuk lazy loading halaman umum',
  },

  // Dummy page example
  dummypage: {
    limit: 15,
    description: 'Ukuran fetch untuk pengujian halaman dummy',
  },

  // Modul / Halaman spesifik dengan data bervolume tinggi
  StokBerjalanObat: {
    limit: 25,
    description: 'Daftar stok berjalan obat yang berukuran besar',
  },
  ObatMasuk: {
    limit: 20,
    description: 'Daftar riwayat obat masuk',
  },
  ObatKeluar: {
    limit: 20,
    description: 'Daftar riwayat obat keluar',
  },
  StokBerjalanBhp: {
    limit: 25,
    description: 'Daftar stok berjalan barang habis pakai',
  },
  BhpMasuk: {
    limit: 20,
    description: 'Daftar riwayat BHP masuk',
  },
  BhpKeluar: {
    limit: 20,
    description: 'Daftar riwayat BHP keluar',
  },
  RiwayatPemeriksaan: {
    limit: 20,
    description: 'Log riwayat pemeriksaan medis pasien',
  },
  KasirPiutang: {
    limit: 30,
    description: 'Daftar piutang dan tagihan pembayaran kasir',
  },
  LaporanObatBhp: {
    limit: 50,
    description: 'Laporan pergerakan obat dan BHP',
  },
  DaftarAkun: {
    limit: 20,
    description: 'Pengaturan lazy loading untuk modul akun/user berukuran besar',
  },
  MasterKB: {
    limit: 20,
    description: 'Daftar data master KB dan durasi tier kunjungan ulang',
  },
  MasterImunisasi: {
    limit: 20,
    description: 'Daftar data master jenis imunisasi',
  },
  MasterLayananLain: {
    limit: 20,
    description: 'Daftar data master tindakan medis dan layanan tambahan',
  },
  MasterPuskesmas: {
    limit: 20,
    description: 'Daftar unit pelaksana teknis puskesmas',
  },
  MasterUser: {
    limit: 20,
    description: 'Daftar data user dan hak akses sistem',
  },
  MasterHargaDasar: {
    limit: 20,
    description: 'Daftar data master harga dasar per jenis layanan',
  },
  MasterBroadcast: {
    limit: 20,
    description: 'Pengaturan jadwal dan template broadcast follow up & reminder',
  },
  MasterRekamMedis: {
    limit: 25,
    description: 'Daftar data master pasien dan rekam medis',
  },
  PendaftaranPasien: {
    limit: 25,
    description: 'Daftar antrean dan pendaftaran pasien offline/online',
  },
};

/**
 * Helper function to retrieve the configured fetch limit for a given page/module key.
 * Automatically falls back to the DEFAULT rule if key is not found or invalid.
 */
export function getLimitForPage(pageKey?: string): number {
  if (!pageKey) {
    return PAGE_FETCHING_LIMITS.DEFAULT.limit;
  }

  const config = PAGE_FETCHING_LIMITS[pageKey];
  if (config && typeof config.limit === 'number' && config.limit > 0) {
    return config.limit;
  }

  return PAGE_FETCHING_LIMITS.DEFAULT.limit;
}
