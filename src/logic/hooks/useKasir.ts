import { useState, useEffect } from 'react';
import { Billing, Piutang } from '../../modules/kasir/types.js';
import { fetchBillings, fetchPiutang, savePayment, updatePiutang } from '../services/kasirService.js';
import { realtimeService } from '../services/realtimeService.js';

export function useKasir() {
  const [billings, setBillings] = useState<Billing[]>([]);
  const [piutangData, setPiutangData] = useState<Piutang[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    const [bRes, pRes] = await Promise.all([
      fetchBillings(),
      fetchPiutang()
    ]);
    setBillings(bRes);
    setPiutangData(pRes);
    setLoading(false);
  };

  useEffect(() => {
    loadData();

    const unsubTagihan = realtimeService.subscribeTable({ table: 'tagihan_pasien' }, (payload) => {
      if (payload.eventType === 'INSERT') {
        setBillings(prev => [payload.newRecord, ...prev]);
      } else if (payload.eventType === 'UPDATE') {
        setBillings(prev => {
          if (payload.newRecord.status === 'Lunas') {
            return prev.filter(t => t.id !== payload.newRecord.id);
          }
          return prev.map(t => t.id === payload.newRecord.id ? payload.newRecord : t);
        });
      }
    });

    const unsubPiutang = realtimeService.subscribeTable({ table: 'piutang_pasien' }, (payload) => {
      if (payload.eventType === 'INSERT') {
        setPiutangData(prev => [payload.newRecord, ...prev]);
      } else if (payload.eventType === 'UPDATE') {
        setPiutangData(prev => prev.map(p => p.visitId === payload.newRecord.visitId ? payload.newRecord : p));
      }
    });

    return () => {
      unsubTagihan();
      unsubPiutang();
    };
  }, []);

  const handleSavePayment = async (paymentData: any) => {
    await savePayment(paymentData);
    await loadData();
  };

  const handleUpdatePiutang = async (piutang: Piutang) => {
    await updatePiutang(piutang);
    await loadData();
  };

  return {
    billings,
    piutangData,
    loading,
    handleSavePayment,
    handleUpdatePiutang
  };
}
