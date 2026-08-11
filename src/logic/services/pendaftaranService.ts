/**
 * Service Logic: Pendaftaran Pasien (Offline & Online Queue & History Management)
 * Path: /src/logic/services/pendaftaranService.ts
 * Manages queue records, booking online, check-in, status changes,
 * auto-syncing with Master Rekam Medis and Master Puskesmas.
 */

import { PasienAntrean } from '../../modules/pendaftaran-offline/data/dummy.js';
import { DUMMY_ANTREAN } from '../../modules/pendaftaran-offline/data/dummy.js';
import { getLimitForPage } from './fetchingCenter.js';
import { getSupabaseClient, isSupabaseConfigured } from '../libs/supabaseClient.js';
import { syncPatientFromRegistration } from './masterRekamMedisService.js';
import { fetchMasterPuskesmasList, createMasterPuskesmasItem } from './masterPuskesmasService.js';
import { realtimeService } from './realtimeService.js';
import { deletePemeriksaanByPendaftaranId } from './pemeriksaanService.js';

const PENDAFTARAN_STORAGE_KEY = 'pendaftaran_pasien_items';

export interface RegistrationRecord extends Omit<PasienAntrean, 'status'> {
  nik: string;
  alamat?: string;
  noWhatsapp?: string;
  puskesmas?: string;
  penanggungJawab?: string;
  penjamin?: string;
  tanggalBooking?: string;
  jamBooking?: string;
  patientId?: string;
  createdAt?: string;
  updatedAt?: string;
  status: 'Menunggu' | 'Menunggu Check-In' | 'Diperiksa' | 'Selesai' | 'Batal';
}

let registrationCache: RegistrationRecord[] = [];

function initRegistrationCache(): RegistrationRecord[] {
  if (registrationCache.length > 0) return registrationCache;

  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      const stored = window.localStorage.getItem(PENDAFTARAN_STORAGE_KEY);
      if (stored) {
        registrationCache = JSON.parse(stored);
        return registrationCache;
      }
    } catch {
      // Storage fallback
    }
  }

  // Populate initial cache from dummy antrean
  registrationCache = DUMMY_ANTREAN.map((item, idx) => ({
    ...item,
    nik: `123456789012340${idx + 1}`,
    alamat: 'Jl. Merdeka No. 10',
    noWhatsapp: '081234567890',
    puskesmas: 'Puskesmas Tebet',
    penanggungJawab: 'Pribadi / Umum',
    penjamin: 'Umum',
    status: item.status as any,
  }));

  saveRegistrationCache(registrationCache);
  return registrationCache;
}

function saveRegistrationCache(data: RegistrationRecord[]): void {
  registrationCache = data;
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      window.localStorage.setItem(PENDAFTARAN_STORAGE_KEY, JSON.stringify(data));
    } catch {
      // Ignore write error
    }
  }
}

export interface FetchPendaftaranParams {
  strategy?: 'full' | 'lazy';
  page?: number;
  limit?: number;
  offset?: number;
  search?: string;
  statusFilter?: string; // 'Menunggu' | 'Menunggu Check-In' | 'Diperiksa' | 'Selesai' | 'All'
  sumberFilter?: 'Online' | 'Offline' | 'All';
}

export interface FetchPendaftaranResult {
  items: RegistrationRecord[];
  totalCount: number;
}

export async function fetchPendaftaranList(
  params: FetchPendaftaranParams = {}
): Promise<FetchPendaftaranResult> {
  const supabase = getSupabaseClient();
  const search = (params.search || '').trim().toLowerCase();

  if (supabase && isSupabaseConfigured()) {
    try {
      let query = supabase.from('pendaftaran_pasien').select('*', { count: 'exact' });

      if (search) {
        query = query.or(`nama.ilike.%${search}%,no_antrean.ilike.%${search}%,no_rm.ilike.%${search}%,nik.ilike.%${search}%`);
      }

      if (params.statusFilter && params.statusFilter !== 'All') {
        query = query.eq('status', params.statusFilter);
      }

      if (params.sumberFilter && params.sumberFilter !== 'All') {
        query = query.eq('sumber_pendaftaran', params.sumberFilter);
      }

      const strategy = params.strategy || 'full';
      if (strategy === 'lazy') {
        const pageLimit = params.limit && params.limit > 0 ? params.limit : getLimitForPage('PendaftaranPasien');
        const offset = params.offset !== undefined ? params.offset : 0;
        query = query.range(offset, offset + pageLimit - 1);
      }

      const { data, count, error } = await query;

      if (!error && data) {
        const items: RegistrationRecord[] = data.map((row: any) => ({
          id: row.id,
          noAntrean: row.no_antrean,
          jenisLayanan: row.jenis_layanan,
          panggilan: row.panggilan || 'Ny.',
          nama: row.nama,
          noRm: row.no_rm,
          nik: row.nik,
          jenisKelamin: row.jenis_kelamin,
          tanggalLahir: row.tanggal_lahir,
          usia: row.usia || '',
          waktuRegistrasi: row.waktu_registrasi || row.created_at,
          sumberPendaftaran: row.sumber_pendaftaran,
          status: row.status,
          alamat: row.alamat || '',
          noWhatsapp: row.no_whatsapp || '',
          puskesmas: row.puskesmas || '',
          penanggungJawab: row.penanggung_jawab || 'Pribadi / Umum',
          penjamin: row.penjamin || 'Umum',
          tanggalBooking: row.tanggal_booking || '',
          jamBooking: row.jam_booking || '',
          patientId: row.patient_id || '',
          createdAt: row.created_at,
          updatedAt: row.updated_at,
        }));

        saveRegistrationCache(items);
        return {
          items,
          totalCount: count ?? items.length,
        };
      }
    } catch {
      // Fallback
    }
  }

  const localCache = initRegistrationCache();
  let filtered = localCache;

  if (search) {
    filtered = filtered.filter(
      (item) =>
        (item.nama?.toLowerCase() || "").includes(search) ||
        (item.noAntrean?.toLowerCase() || "").includes(search) ||
        (item.noRm?.toLowerCase() || "").includes(search) ||
        (item.nik?.toLowerCase() || "").includes(search)
    );
  }

  if (params.statusFilter && params.statusFilter !== 'All') {
    filtered = filtered.filter((item) => item.status === params.statusFilter);
  }

  if (params.sumberFilter && params.sumberFilter !== 'All') {
    filtered = filtered.filter((item) => item.sumberPendaftaran === params.sumberFilter);
  }

  const totalCount = filtered.length;
  const strategy = params.strategy || 'full';

  if (strategy === 'full') {
    return { items: filtered, totalCount };
  }

  const pageLimit = params.limit && params.limit > 0 ? params.limit : getLimitForPage('PendaftaranPasien');
  const offset = params.offset !== undefined ? params.offset : 0;
  const items = filtered.slice(offset, offset + pageLimit);

  return { items, totalCount };
}

export function generateAntreanNumber(jenisLayanan: string, currentList: RegistrationRecord[]): string {
  let prefix = 'A';
  if (jenisLayanan.toLowerCase().includes('imunisasi')) prefix = 'B';
  else if (jenisLayanan.toLowerCase().includes('antenatal') || jenisLayanan.toLowerCase().includes('post natal') || jenisLayanan.toLowerCase().includes('kia')) prefix = 'C';
  else if (jenisLayanan.toLowerCase().includes('kb')) prefix = 'D';

  let maxNum = 0;
  currentList.forEach((item) => {
    if (item.noAntrean && item.noAntrean.startsWith(`${prefix}-`)) {
      const numStr = item.noAntrean.split('-')[1];
      const num = parseInt(numStr, 10);
      if (!isNaN(num) && num > maxNum) {
        maxNum = num;
      }
    }
  });

  const nextNum = String(maxNum + 1).padStart(3, '0');
  return `${prefix}-${nextNum}`;
}

function calculateAgeString(birthDateStr: string): string {
  if (!birthDateStr) return '0 th';
  const birth = new Date(birthDateStr);
  const now = new Date();
  let years = now.getFullYear() - birth.getFullYear();
  let months = now.getMonth() - birth.getMonth();

  if (months < 0 || (months === 0 && now.getDate() < birth.getDate())) {
    years--;
    months = (months + 12) % 12;
  }

  if (years > 0) {
    return `${years} th${months > 0 ? ` ${months} bln` : ''}`;
  }
  return `${months > 0 ? months : 1} bln`;
}

export interface RegisterPatientInput {
  nik: string;
  noRm?: string;
  panggilan: string;
  nama: string;
  jenisKelamin: 'L' | 'P';
  tanggalLahir: string;
  alamat?: string;
  noWhatsapp?: string;
  puskesmas?: string;
  jenisLayanan: string;
  penanggungJawab?: string;
  penjamin?: string;
  sumberPendaftaran: 'Offline' | 'Online';
  tanggalBooking?: string;
  jamBooking?: string;
  isMenungguCheckIn?: boolean;
}

export async function createRegistration(
  input: RegisterPatientInput
): Promise<RegistrationRecord> {
  const localCache = initRegistrationCache();
  const supabase = getSupabaseClient();

  // 1. Check & Sync Puskesmas: If user typed a custom puskesmas not in master list, auto-add to master puskesmas
  if (input.puskesmas && input.puskesmas.trim()) {
    const puskName = input.puskesmas.trim();
    const puskList = await fetchMasterPuskesmasList({ strategy: 'full' });
    const exists = puskList.items.some(
      (p) => p.nama.toLowerCase() === puskName.toLowerCase()
    );
    if (!exists) {
      await createMasterPuskesmasItem({
        nama: puskName,
        alamat: '',
        noTelepon: '',
      });
    }
  }

  // 2. Sync to Master Rekam Medis (Auto Create if new, Auto Update if patient info changed)
  const patientRecord = await syncPatientFromRegistration({
    nik: input.nik,
    noRm: input.noRm,
    panggilan: input.panggilan,
    nama: input.nama,
    jenisKelamin: input.jenisKelamin,
    tanggalLahir: input.tanggalLahir,
    alamat: input.alamat,
    noWhatsapp: input.noWhatsapp,
    puskesmas: input.puskesmas,
  });

  // 3. Generate queue number and prepare registration entry
  const noAntrean = generateAntreanNumber(input.jenisLayanan, localCache);
  const usia = calculateAgeString(input.tanggalLahir);
  const nowIso = new Date().toISOString();

  let status: 'Menunggu' | 'Menunggu Check-In' = 'Menunggu';
  if (input.isMenungguCheckIn || input.sumberPendaftaran === 'Online' && input.tanggalBooking) {
    status = 'Menunggu Check-In';
  }

  const newReg: RegistrationRecord = {
    id: `reg-${Date.now()}`,
    noAntrean,
    jenisLayanan: input.jenisLayanan,
    panggilan: input.panggilan,
    nama: input.nama,
    noRm: patientRecord.noRm,
    nik: input.nik,
    jenisKelamin: input.jenisKelamin,
    tanggalLahir: input.tanggalLahir,
    usia,
    waktuRegistrasi: nowIso,
    sumberPendaftaran: input.sumberPendaftaran,
    status,
    alamat: input.alamat || patientRecord.alamat || '',
    noWhatsapp: input.noWhatsapp || patientRecord.noWhatsapp || '',
    puskesmas: input.puskesmas || patientRecord.puskesmas || '',
    penanggungJawab: input.penanggungJawab || 'Pribadi / Umum',
    penjamin: input.penjamin || 'Umum',
    tanggalBooking: input.tanggalBooking || '',
    jamBooking: input.jamBooking || '',
    patientId: patientRecord.id,
    createdAt: nowIso,
    updatedAt: nowIso,
  };

  if (supabase && isSupabaseConfigured()) {
    try {
      await supabase.from('pendaftaran_pasien').insert({
        id: newReg.id,
        no_antrean: newReg.noAntrean,
        jenis_layanan: newReg.jenisLayanan,
        patient_id: patientRecord.id,
        no_rm: newReg.noRm,
        nik: newReg.nik,
        panggilan: newReg.panggilan,
        nama: newReg.nama,
        jenis_kelamin: newReg.jenisKelamin,
        tanggal_lahir: newReg.tanggalLahir,
        usia: newReg.usia,
        alamat: newReg.alamat,
        no_whatsapp: newReg.noWhatsapp,
        puskesmas: newReg.puskesmas,
        penanggung_jawab: newReg.penanggungJawab,
        penjamin: newReg.penjamin,
        sumber_pendaftaran: newReg.sumberPendaftaran,
        status: newReg.status,
        tanggal_booking: newReg.tanggalBooking || null,
        jam_booking: newReg.jamBooking || null,
        waktu_registrasi: nowIso,
      });
    } catch {
      // Local fallback
    }
  }

  const updated = [newReg, ...localCache];
  saveRegistrationCache(updated);
  realtimeService.emitEvent('pendaftaran_pasien', 'INSERT', newReg);
  return newReg;
}

export async function updateRegistrationStatus(
  id: string,
  newStatus: 'Menunggu' | 'Menunggu Check-In' | 'Diperiksa' | 'Selesai' | 'Batal'
): Promise<RegistrationRecord> {
  const localCache = initRegistrationCache();
  const supabase = getSupabaseClient();
  let updatedRecord: RegistrationRecord | null = null;
  const nowIso = new Date().toISOString();

  const updated = localCache.map((reg) => {
    if (reg.id === id) {
      updatedRecord = {
        ...reg,
        status: newStatus,
        updatedAt: nowIso,
      };
      return updatedRecord;
    }
    return reg;
  });

  if (!updatedRecord) {
    throw new Error(`Pendaftaran dengan ID "${id}" tidak ditemukan.`);
  }

  if (supabase && isSupabaseConfigured()) {
    try {
      await supabase
        .from('pendaftaran_pasien')
        .update({ status: newStatus, updated_at: nowIso })
        .eq('id', id);
    } catch {
      // Fallback
    }
  }

  saveRegistrationCache(updated);
  realtimeService.emitEvent('pendaftaran_pasien', 'UPDATE', updatedRecord);

  if (newStatus === 'Selesai' && updatedRecord) {
    try {
      const { fetchPemeriksaanByPendaftaranId } = await import('./pemeriksaanService.js');
      const { saveLoketObat } = await import('./loketObatService.js');
      const { generateTagihan } = await import('./kasirService.js');
      const exam = await fetchPemeriksaanByPendaftaranId(id);
      
      const hasDrugs = exam && exam.plan && Array.isArray(exam.plan.terapiFarmakologi) && exam.plan.terapiFarmakologi.length > 0;
      
      if (hasDrugs) {
        await saveLoketObat({
          id: `LO-${id.replace('reg-', '')}`,
          noRm: updatedRecord.noRm,
          namaPasien: updatedRecord.nama,
          jenisKelamin: updatedRecord.jenisKelamin,
          tanggalLahir: updatedRecord.tanggalLahir,
          usia: updatedRecord.usia,
          waktuPesan: nowIso,
          sumber: 'Pemeriksaan',
          status: 'Menunggu',
          pemeriksaanId: id,
          items: exam.plan.terapiFarmakologi.map((t: any) => ({
            sku: t.sku,
            namaObat: t.namaObat,
            dosis: t.dosis,
            aturanPakai: t.aturanPakai,
            jumlah: t.jumlah,
          })),
        });
      } else {
        // If no drugs, send straight to Kasir Tagihan
        await generateTagihan(id);
      }
    } catch (e) {
      console.error('Failed to auto-create Loket Obat or Kasir Tagihan on completion:', e);
    }
  }

  return updatedRecord;
}

export async function deleteRegistration(id: string): Promise<boolean> {
  const localCache = initRegistrationCache();
  const supabase = getSupabaseClient();

  if (supabase && isSupabaseConfigured()) {
    try {
      await supabase
        .from('pendaftaran_pasien')
        .delete()
        .eq('id', id);
    } catch {
      // Fallback
    }
  }

  const updated = localCache.filter((reg) => reg.id !== id);
  saveRegistrationCache(updated);

  // Cascade delete examination in local cache & DB
  await deletePemeriksaanByPendaftaranId(id);

  realtimeService.emitEvent('pendaftaran_pasien', 'DELETE', { id });
  return true;
}

export async function fetchPendaftaranById(id: string): Promise<RegistrationRecord | null> {
  const supabase = getSupabaseClient();
  if (supabase && isSupabaseConfigured()) {
    const { data } = await supabase.from('pendaftaran_pasien').select('*').eq('id', id).single();
    if (data) {
      return {
        id: data.id,
        noAntrean: data.no_antrean,
        jenisLayanan: data.jenis_layanan,
        patientId: data.patient_id,
        noRm: data.no_rm,
        nik: data.nik,
        panggilan: data.panggilan,
        nama: data.nama,
        jenisKelamin: data.jenis_kelamin,
        tanggalLahir: data.tanggal_lahir,
        usia: data.usia,
        alamat: data.alamat,
        noWhatsapp: data.no_whatsapp,
        puskesmas: data.puskesmas,
        penanggungJawab: data.penanggung_jawab,
        penjamin: data.penjamin,
        sumberPendaftaran: data.sumber_pendaftaran as any,
        status: data.status as any,
        tanggalBooking: data.tanggal_booking,
        jamBooking: data.jam_booking,
        waktuRegistrasi: data.waktu_registrasi,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };
    }
  }
  return null;
}
