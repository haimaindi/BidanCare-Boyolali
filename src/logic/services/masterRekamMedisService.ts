/**
 * Service Logic: Master Rekam Medis (Patient Database)
 * Path: /src/logic/services/masterRekamMedisService.ts
 * Manages patient records, search, auto-synchronization on registration update,
 * and visit logs with LocalStorage fallback & Supabase integration.
 */

import { Patient, VisitLog } from '../../modules/master-rekam-medis/types.js';
import { dummyPatients, dummyVisitLogs } from '../../modules/master-rekam-medis/data/dummy.js';
import { getLimitForPage } from './fetchingCenter.js';
import { getSupabaseClient, isSupabaseConfigured } from '../libs/supabaseClient.js';
import { realtimeService } from './realtimeService.js';

const PATIENTS_STORAGE_KEY = 'master_rekam_medis_patients';
const VISITS_STORAGE_KEY = 'master_rekam_medis_visits';

let patientsCache: Patient[] = [];
let visitsCache: VisitLog[] = [];

function initPatientsCache(): Patient[] {
  if (patientsCache.length > 0) return patientsCache;

  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      const stored = window.localStorage.getItem(PATIENTS_STORAGE_KEY);
      if (stored) {
        patientsCache = JSON.parse(stored);
        return patientsCache;
      }
    } catch {
      // Fallback
    }
  }

  patientsCache = [...dummyPatients];
  savePatientsCache(patientsCache);
  return patientsCache;
}

function savePatientsCache(data: Patient[]): void {
  patientsCache = data;
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      window.localStorage.setItem(PATIENTS_STORAGE_KEY, JSON.stringify(data));
    } catch {
      // Ignore write errors
    }
  }
}

function initVisitsCache(): VisitLog[] {
  if (visitsCache.length > 0) return visitsCache;

  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      const stored = window.localStorage.getItem(VISITS_STORAGE_KEY);
      if (stored) {
        visitsCache = JSON.parse(stored);
        return visitsCache;
      }
    } catch {
      // Fallback
    }
  }

  visitsCache = [...dummyVisitLogs];
  saveVisitsCache(visitsCache);
  return visitsCache;
}

function saveVisitsCache(data: VisitLog[]): void {
  visitsCache = data;
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      window.localStorage.setItem(VISITS_STORAGE_KEY, JSON.stringify(data));
    } catch {
      // Ignore write errors
    }
  }
}

export interface FetchPatientsParams {
  strategy?: 'full' | 'lazy';
  page?: number;
  limit?: number;
  offset?: number;
  search?: string;
}

export interface FetchPatientsResult {
  items: Patient[];
  totalCount: number;
}

export async function fetchPatientList(
  params: FetchPatientsParams = {}
): Promise<FetchPatientsResult> {
  const supabase = getSupabaseClient();
  const search = (params.search || '').trim().toLowerCase();

  if (supabase && isSupabaseConfigured()) {
    try {
      let query = supabase
        .from('master_rekam_medis')
        .select('*', { count: 'exact' });

      if (search) {
        query = query.or(`nama.ilike.%${search}%,nik.ilike.%${search}%,no_rm.ilike.%${search}%`);
      }

      const strategy = params.strategy || 'full';
      if (strategy === 'lazy') {
        const pageLimit = params.limit && params.limit > 0 ? params.limit : getLimitForPage('MasterRekamMedis');
        const offset = params.offset !== undefined ? params.offset : 0;
        query = query.range(offset, offset + pageLimit - 1);
      }

      const { data, count, error } = await query;

      if (!error && data) {
        const items: Patient[] = data.map((row: any) => ({
          id: row.id,
          noRm: row.no_rm,
          nik: row.nik,
          kk: row.kk || '',
          noBpjs: row.no_bpjs || '',
          panggilan: row.panggilan || 'Ny.',
          nama: row.nama,
          provinsiLahir: row.provinsi_lahir || '',
          tempatLahir: row.tempat_lahir || '',
          tanggalLahir: row.tanggal_lahir,
          jenisKelamin: row.jenis_kelamin,
          golDarah: row.gol_darah || '',
          pekerjaan: row.pekerjaan || '',
          noWhatsapp: row.no_whatsapp || row.no_hp || '',
          noHp: row.no_hp || row.no_whatsapp || '',
          provinsi: row.provinsi || '',
          kabupaten: row.kabupaten || '',
          kecamatan: row.kecamatan || '',
          kelurahan: row.kelurahan || '',
          alamat: row.alamat || '',
          puskesmas: row.puskesmas || '',
          namaSuamiIstri: row.nama_suami_isti || '',
          nikSuami: row.nik_suami || '',
          noTelpSuami: row.no_telp_suami || '',
          namaOrangTua: row.nama_orang_tua || '',
          nikOrangTua: row.nik_orang_tua || '',
          noTelpOrangTua: row.no_telp_orang_tua || '',
          catatanKhusus: row.catatan_khusus || '',
          createdAt: row.created_at,
          updatedAt: row.updated_at,
        }));

        savePatientsCache(items);
        return {
          items,
          totalCount: count ?? items.length,
        };
      }
    } catch {
      // Fallback to local cache
    }
  }

  const localCache = initPatientsCache();
  let filtered = localCache;
  if (search) {
    filtered = localCache.filter(
      (p) =>
        (p.nama?.toLowerCase() || '').includes(search) ||
        (p.nik?.toLowerCase() || '').includes(search) ||
        (p.noRm?.toLowerCase() || '').includes(search)
    );
  }

  const totalCount = filtered.length;
  const strategy = params.strategy || 'full';

  if (strategy === 'full') {
    return { items: filtered, totalCount };
  }

  const pageLimit = params.limit && params.limit > 0 ? params.limit : getLimitForPage('MasterRekamMedis');
  const offset = params.offset !== undefined ? params.offset : 0;
  const items = filtered.slice(offset, offset + pageLimit);

  return { items, totalCount };
}

export async function findPatientByNikOrRm(identifier: string): Promise<Patient | null> {
  const query = identifier.trim().toLowerCase();
  if (!query) return null;

  const res = await fetchPatientList({ search: query, strategy: 'full' });
  const exactMatch = res.items.find(
    (p) => (p.nik?.toLowerCase() || '') === query || (p.noRm?.toLowerCase() || '') === query
  );

  return exactMatch || res.items[0] || null;
}

export async function searchPatients(query: string): Promise<Patient[]> {
  if (!query || query.length < 3) return [];
  const res = await fetchPatientList({ search: query, strategy: 'full' });
  return res.items;
}

export async function getPatientByNIK(nik: string): Promise<Patient | null> {
  if (!nik) return null;
  const res = await fetchPatientList({ search: nik, strategy: 'full' });
  return res.items.find(p => p.nik === nik) || null;
}

export function generateNextNoRm(existingPatients: Patient[]): string {
  const now = new Date();
  const yearMonth = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`;
  const prefix = `RM-${yearMonth}-`;
  
  let maxNum = 0;
  existingPatients.forEach((p) => {
    if (p.noRm && p.noRm.startsWith(prefix)) {
      const numPart = parseInt(p.noRm.replace(prefix, ''), 10);
      if (!isNaN(numPart) && numPart > maxNum) {
        maxNum = numPart;
      }
    }
  });

  const nextNum = String(maxNum + 1).padStart(3, '0');
  return `${prefix}${nextNum}`;
}

export async function createPatientItem(
  patientData: Omit<Patient, 'id' | 'createdAt' | 'updatedAt'>
): Promise<Patient> {
  const supabase = getSupabaseClient();
  const localCache = initPatientsCache();
  const nowIso = new Date().toISOString();

  const finalNoRm = patientData.noRm || generateNextNoRm(localCache);

  const newPatient: Patient = {
    ...patientData,
    id: `patient-${Date.now()}`,
    noRm: finalNoRm,
    createdAt: nowIso,
    updatedAt: nowIso,
  };

  if (supabase && isSupabaseConfigured()) {
    try {
      await supabase.from('master_rekam_medis').insert({
        id: newPatient.id,
        no_rm: newPatient.noRm,
        nik: newPatient.nik,
        kk: newPatient.kk || null,
        no_bpjs: newPatient.noBpjs || null,
        panggilan: newPatient.panggilan || 'Ny.',
        nama: newPatient.nama,
        provinsi_lahir: newPatient.provinsiLahir || null,
        tempat_lahir: newPatient.tempatLahir || null,
        tanggal_lahir: newPatient.tanggalLahir,
        jenis_kelamin: newPatient.jenisKelamin,
        gol_darah: newPatient.golDarah || null,
        pekerjaan: newPatient.pekerjaan || null,
        no_whatsapp: newPatient.noWhatsapp || newPatient.noHp || null,
        no_hp: newPatient.noHp || newPatient.noWhatsapp || null,
        provinsi: newPatient.provinsi || null,
        kabupaten: newPatient.kabupaten || null,
        kecamatan: newPatient.kecamatan || null,
        kelurahan: newPatient.kelurahan || null,
        alamat: newPatient.alamat || null,
        puskesmas: newPatient.puskesmas || null,
        nama_suami_isti: newPatient.namaSuamiIstri || null,
        nik_suami: newPatient.nikSuami || null,
        no_telp_suami: newPatient.noTelpSuami || null,
        nama_orang_tua: newPatient.namaOrangTua || null,
        nik_orang_tua: newPatient.nikOrangTua || null,
        no_telp_orang_tua: newPatient.noTelpOrangTua || null,
        catatan_khusus: newPatient.catatanKhusus || null,
      });
    } catch {
      // Local fallback
    }
  }

  const updated = [newPatient, ...localCache];
  savePatientsCache(updated);
  realtimeService.emitEvent('master_rekam_medis', 'INSERT', newPatient);
  return newPatient;
}

export async function updatePatientItem(
  id: string,
  updatedFields: Partial<Omit<Patient, 'id' | 'createdAt'>>
): Promise<Patient> {
  const supabase = getSupabaseClient();
  const localCache = initPatientsCache();
  let updatedPatient: Patient | null = null;
  const nowIso = new Date().toISOString();

  const updated = localCache.map((p) => {
    if (p.id === id) {
      updatedPatient = {
        ...p,
        ...updatedFields,
        updatedAt: nowIso,
      };
      return updatedPatient;
    }
    return p;
  });

  if (!updatedPatient) {
    throw new Error(`Pasien dengan ID "${id}" tidak ditemukan.`);
  }

  if (supabase && isSupabaseConfigured()) {
    try {
      const payload: Record<string, any> = { updated_at: nowIso };
      if (updatedFields.nama !== undefined) payload.nama = updatedFields.nama;
      if (updatedFields.nik !== undefined) payload.nik = updatedFields.nik;
      if (updatedFields.panggilan !== undefined) payload.panggilan = updatedFields.panggilan;
      if (updatedFields.tanggalLahir !== undefined) payload.tanggal_lahir = updatedFields.tanggalLahir;
      if (updatedFields.jenisKelamin !== undefined) payload.jenis_kelamin = updatedFields.jenisKelamin;
      if (updatedFields.alamat !== undefined) payload.alamat = updatedFields.alamat;
      if (updatedFields.noWhatsapp !== undefined) payload.no_whatsapp = updatedFields.noWhatsapp;
      if (updatedFields.puskesmas !== undefined) payload.puskesmas = updatedFields.puskesmas;
      if (updatedFields.pekerjaan !== undefined) payload.pekerjaan = updatedFields.pekerjaan;
      if (updatedFields.kk !== undefined) payload.kk = updatedFields.kk;
      if (updatedFields.noBpjs !== undefined) payload.no_bpjs = updatedFields.noBpjs;
      if (updatedFields.provinsi !== undefined) payload.provinsi = updatedFields.provinsi;
      if (updatedFields.kabupaten !== undefined) payload.kabupaten = updatedFields.kabupaten;
      if (updatedFields.kecamatan !== undefined) payload.kecamatan = updatedFields.kecamatan;
      if (updatedFields.kelurahan !== undefined) payload.kelurahan = updatedFields.kelurahan;

      await supabase.from('master_rekam_medis').update(payload).eq('id', id);
    } catch {
      // Fallback
    }
  }

  savePatientsCache(updated);
  if (updatedPatient) {
    realtimeService.emitEvent('master_rekam_medis', 'UPDATE', updatedPatient);
  }
  return updatedPatient;
}

/**
 * Upserts patient when registering from Pendaftaran Form.
 * If patient exists (matched by NIK or No RM), updates patient data if modified.
 * If patient does not exist, auto-creates patient in Master Rekam Medis database.
 */
export async function syncPatientFromRegistration(regData: {
  nik: string;
  noRm?: string;
  panggilan?: string;
  nama: string;
  jenisKelamin: 'L' | 'P';
  tanggalLahir: string;
  alamat?: string;
  noWhatsapp?: string;
  puskesmas?: string;
  pekerjaan?: string;
  provinsi?: string;
  kabupaten?: string;
  kecamatan?: string;
  kelurahan?: string;
  kk?: string;
  noBpjs?: string;
  provinsiLahir?: string;
  tempatLahir?: string;
  golDarah?: string;
  namaSuamiIstri?: string;
  nikSuami?: string;
  noTelpSuami?: string;
  namaOrangTua?: string;
  nikOrangTua?: string;
  noTelpOrangTua?: string;
  catatanKhusus?: string;
}): Promise<Patient> {
  const localCache = initPatientsCache();

  let existing = localCache.find(
    (p) =>
      (regData.nik && p.nik === regData.nik) ||
      (regData.noRm && p.noRm === regData.noRm)
  );

  if (!existing && getSupabaseClient()) {
    existing = await findPatientByNikOrRm(regData.nik || regData.noRm || '');
  }

  if (existing) {
    // Check if any fields changed
    const changes: Partial<Patient> = {};
    if (regData.nama && regData.nama !== existing.nama) changes.nama = regData.nama;
    if (regData.panggilan && regData.panggilan !== existing.panggilan) changes.panggilan = regData.panggilan;
    if (regData.jenisKelamin && regData.jenisKelamin !== existing.jenisKelamin) changes.jenisKelamin = regData.jenisKelamin;
    if (regData.tanggalLahir && regData.tanggalLahir !== existing.tanggalLahir) changes.tanggalLahir = regData.tanggalLahir;
    if (regData.alamat && regData.alamat !== existing.alamat) changes.alamat = regData.alamat;
    if (regData.noWhatsapp && regData.noWhatsapp !== existing.noWhatsapp) changes.noWhatsapp = regData.noWhatsapp;
    if (regData.puskesmas && regData.puskesmas !== existing.puskesmas) changes.puskesmas = regData.puskesmas;
    if (regData.provinsi && regData.provinsi !== existing.provinsi) changes.provinsi = regData.provinsi;
    if (regData.kabupaten && regData.kabupaten !== existing.kabupaten) changes.kabupaten = regData.kabupaten;
    if (regData.kecamatan && regData.kecamatan !== existing.kecamatan) changes.kecamatan = regData.kecamatan;
    if (regData.kelurahan && regData.kelurahan !== existing.kelurahan) changes.kelurahan = regData.kelurahan;
    if (regData.pekerjaan && regData.pekerjaan !== existing.pekerjaan) changes.pekerjaan = regData.pekerjaan;
    if (regData.kk && regData.kk !== existing.kk) changes.kk = regData.kk;
    if (regData.noBpjs && regData.noBpjs !== existing.noBpjs) changes.noBpjs = regData.noBpjs;
    if (regData.provinsiLahir && regData.provinsiLahir !== existing.provinsiLahir) changes.provinsiLahir = regData.provinsiLahir;
    if (regData.tempatLahir && regData.tempatLahir !== existing.tempatLahir) changes.tempatLahir = regData.tempatLahir;
    if (regData.golDarah && regData.golDarah !== existing.golDarah) changes.golDarah = regData.golDarah;
    if (regData.namaSuamiIstri && regData.namaSuamiIstri !== existing.namaSuamiIstri) changes.namaSuamiIstri = regData.namaSuamiIstri;
    if (regData.nikSuami && regData.nikSuami !== existing.nikSuami) changes.nikSuami = regData.nikSuami;
    if (regData.noTelpSuami && regData.noTelpSuami !== existing.noTelpSuami) changes.noTelpSuami = regData.noTelpSuami;
    if (regData.namaOrangTua && regData.namaOrangTua !== existing.namaOrangTua) changes.namaOrangTua = regData.namaOrangTua;
    if (regData.nikOrangTua && regData.nikOrangTua !== existing.nikOrangTua) changes.nikOrangTua = regData.nikOrangTua;
    if (regData.noTelpOrangTua && regData.noTelpOrangTua !== existing.noTelpOrangTua) changes.noTelpOrangTua = regData.noTelpOrangTua;
    if (regData.catatanKhusus && regData.catatanKhusus !== existing.catatanKhusus) changes.catatanKhusus = regData.catatanKhusus;

    if (Object.keys(changes).length > 0) {
      return await updatePatientItem(existing.id, changes);
    }
    return existing;
  }

  // Create new patient record in Master Rekam Medis database
  const nextNoRm = regData.noRm || generateNextNoRm(localCache);
  return await createPatientItem({
    noRm: nextNoRm,
    nik: regData.nik,
    panggilan: regData.panggilan || 'Ny.',
    nama: regData.nama,
    jenisKelamin: regData.jenisKelamin,
    tanggalLahir: regData.tanggalLahir,
    alamat: regData.alamat || '',
    noWhatsapp: regData.noWhatsapp || '',
    puskesmas: regData.puskesmas || '',
    pekerjaan: regData.pekerjaan || '',
    provinsi: regData.provinsi || '',
    kabupaten: regData.kabupaten || '',
    kecamatan: regData.kecamatan || '',
    kelurahan: regData.kelurahan || '',
    kk: regData.kk || '',
    noBpjs: regData.noBpjs || '',
    provinsiLahir: regData.provinsiLahir || '',
    tempatLahir: regData.tempatLahir || '',
    golDarah: regData.golDarah || '',
    namaSuamiIstri: regData.namaSuamiIstri || '',
    nikSuami: regData.nikSuami || '',
    noTelpSuami: regData.noTelpSuami || '',
    namaOrangTua: regData.namaOrangTua || '',
    nikOrangTua: regData.nikOrangTua || '',
    noTelpOrangTua: regData.noTelpOrangTua || '',
    catatanKhusus: regData.catatanKhusus || '',
  });
}

export async function fetchVisitLogsForPatient(patientId: string): Promise<VisitLog[]> {
  const cache = initVisitsCache();
  return cache.filter((v) => v.patientId === patientId);
}

export async function createVisitLog(visit: Omit<VisitLog, 'id'>): Promise<VisitLog> {
  const cache = initVisitsCache();
  const newVisit: VisitLog = {
    ...visit,
    id: `visit-${Date.now()}`,
  };
  const updated = [newVisit, ...cache];
  saveVisitsCache(updated);
  return newVisit;
}
