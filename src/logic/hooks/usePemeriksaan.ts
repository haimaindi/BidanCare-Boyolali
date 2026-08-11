/**
 * Custom Hook: usePemeriksaan
 * Path: /src/logic/hooks/usePemeriksaan.ts
 * Coordinates loading and saving examination records for a given registration.
 */

import { useState, useEffect, useCallback } from 'react';
import { PemeriksaanData } from '../../modules/pemeriksaan/types.js';
import { fetchPemeriksaanByPendaftaranId, savePemeriksaan } from '../services/pemeriksaanService.js';

export function usePemeriksaan(pendaftaranId: string | undefined) {
  const [data, setData] = useState<PemeriksaanData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const loadPemeriksaan = useCallback(async () => {
    if (!pendaftaranId) {
      setData(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetchPemeriksaanByPendaftaranId(pendaftaranId);
      setData(res);
    } catch (err: any) {
      setError(err?.message || 'Gagal memuat data pemeriksaan.');
    } finally {
      setLoading(false);
    }
  }, [pendaftaranId]);

  useEffect(() => {
    loadPemeriksaan();
  }, [loadPemeriksaan]);

  const save = useCallback(async (formData: Omit<PemeriksaanData, 'id' | 'patientId'>) => {
    if (!pendaftaranId) throw new Error('ID pendaftaran tidak valid.');
    setLoading(true);
    setError(null);
    try {
      const saved = await savePemeriksaan(pendaftaranId, formData);
      setData(saved);
      return saved;
    } catch (err: any) {
      setError(err?.message || 'Gagal menyimpan pemeriksaan.');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [pendaftaranId]);

  return {
    data,
    loading,
    error,
    refresh: loadPemeriksaan,
    save
  };
}
