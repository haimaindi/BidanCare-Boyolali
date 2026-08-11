/**
 * Custom Hook: Master Rekam Medis (Patient Database)
 * Path: /src/logic/hooks/useMasterRekamMedis.ts
 */

import { useState, useEffect, useCallback } from 'react';
import { Patient, VisitLog } from '../../modules/master-rekam-medis/types.js';
import {
  fetchPatientList,
  findPatientByNikOrRm,
  createPatientItem,
  updatePatientItem,
  syncPatientFromRegistration,
  fetchVisitLogsForPatient,
  createVisitLog,
  FetchPatientsParams,
  searchPatients as searchPatientsService,
  getPatientByNIK as getPatientByNIKService,
} from '../services/masterRekamMedisService.js';
import { realtimeService } from '../services/realtimeService.js';

export function useMasterRekamMedis(initialParams: FetchPatientsParams = {}) {
  const { strategy: initStrategy, page: initPage, limit: initLimit, offset: initOffset, search: initSearch = '' } = initialParams;
  const [patients, setPatients] = useState<Patient[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>(initSearch);

  useEffect(() => {
    setSearchQuery(initSearch);
  }, [initSearch]);

  const loadPatients = useCallback(async (customParams?: FetchPatientsParams, silent = false) => {
    if (!silent) {
      setLoading(true);
    }
    setError(null);
    try {
      const mergedParams = {
        strategy: initStrategy,
        page: initPage,
        limit: initLimit,
        offset: initOffset,
        search: searchQuery,
        ...customParams,
      };
      const result = await fetchPatientList(mergedParams);
      setPatients(result.items);
      setTotalCount(result.totalCount);
    } catch (err: any) {
      setError(err?.message || 'Gagal memuat data pasien.');
    } finally {
      setLoading(false);
    }
  }, [initStrategy, initPage, initLimit, initOffset, searchQuery]);

  useEffect(() => {
    loadPatients();
    const unsubscribe = realtimeService.subscribeTable(
      { table: 'master_rekam_medis' },
      () => {
        loadPatients(undefined, true);
      }
    );
    return () => {
      unsubscribe();
    };
  }, [loadPatients]);

  const searchPatient = useCallback(async (nikOrRm: string) => {
    return await findPatientByNikOrRm(nikOrRm);
  }, []);

  const searchPatients = useCallback(async (query: string) => {
    return await searchPatientsService(query);
  }, []);

  const getPatientByNIK = useCallback(async (nik: string) => {
    return await getPatientByNIKService(nik);
  }, []);

  const addPatient = useCallback(
    async (data: Omit<Patient, 'id' | 'createdAt' | 'updatedAt'>) => {
      const created = await createPatientItem(data);
      await loadPatients();
      return created;
    },
    [loadPatients]
  );

  const editPatient = useCallback(
    async (id: string, updatedFields: Partial<Omit<Patient, 'id' | 'createdAt'>>) => {
      const updated = await updatePatientItem(id, updatedFields);
      await loadPatients();
      return updated;
    },
    [loadPatients]
  );

  const syncPatient = useCallback(
    async (regData: Parameters<typeof syncPatientFromRegistration>[0]) => {
      const synced = await syncPatientFromRegistration(regData);
      await loadPatients();
      return synced;
    },
    [loadPatients]
  );

  const getPatientVisits = useCallback(async (patientId: string): Promise<VisitLog[]> => {
    return await fetchVisitLogsForPatient(patientId);
  }, []);

  const addVisit = useCallback(async (visit: Omit<VisitLog, 'id'>): Promise<VisitLog> => {
    return await createVisitLog(visit);
  }, []);

  return {
    patients,
    totalCount,
    loading,
    error,
    searchQuery,
    setSearchQuery,
    reload: loadPatients,
    searchPatient,
    searchPatients,
    getPatientByNIK,
    addPatient,
    editPatient,
    syncPatient,
    getPatientVisits,
    addVisit,
  };
}
