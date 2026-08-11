import { Billing, Piutang, PaymentLog } from '../../modules/kasir/types.js';
import { getSupabaseClient, isSupabaseConfigured } from '../libs/supabaseClient.js';
import { realtimeService } from './realtimeService.js';

const STORAGE_KEY_TAGIHAN = 'kasir_tagihan_items';
const STORAGE_KEY_PIUTANG = 'kasir_piutang_items';

let tagihanCache: Billing[] = [];
let piutangCache: Piutang[] = [];

function initTagihanCache(): Billing[] {
  if (tagihanCache.length > 0) return tagihanCache;
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY_TAGIHAN);
      if (stored) {
        tagihanCache = JSON.parse(stored);
        return tagihanCache;
      }
    } catch {}
  }
  tagihanCache = [];
  return tagihanCache;
}

function saveTagihanCache(data: Billing[]) {
  tagihanCache = data;
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      window.localStorage.setItem(STORAGE_KEY_TAGIHAN, JSON.stringify(data));
    } catch {}
  }
}

function initPiutangCache(): Piutang[] {
  if (piutangCache.length > 0) return piutangCache;
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY_PIUTANG);
      if (stored) {
        piutangCache = JSON.parse(stored);
        return piutangCache;
      }
    } catch {}
  }
  piutangCache = [];
  return piutangCache;
}

function savePiutangCache(data: Piutang[]) {
  piutangCache = data;
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      window.localStorage.setItem(STORAGE_KEY_PIUTANG, JSON.stringify(data));
    } catch {}
  }
}

export async function fetchBillings(): Promise<Billing[]> {
  const supabase = getSupabaseClient();
  if (supabase && isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase.from('tagihan_pasien').select('*').order('created_at', { ascending: false });
      if (!error && data) {
        const parsed = data.map(mapTagihanRowToData);
        saveTagihanCache(parsed);
        return parsed;
      }
    } catch (e) {
      console.error('fetchBillings supabase error:', e);
    }
  }
  return initTagihanCache();
}

export async function fetchPiutang(): Promise<Piutang[]> {
  const supabase = getSupabaseClient();
  if (supabase && isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase.from('piutang_pasien').select('*').order('created_at', { ascending: false });
      if (!error && data) {
        const parsed = data.map(mapPiutangRowToData);
        savePiutangCache(parsed);
        return parsed;
      }
    } catch (e) {
      console.error('fetchPiutang supabase error:', e);
    }
  }
  return initPiutangCache();
}

export async function savePayment(paymentData: any): Promise<void> {
  const supabase = getSupabaseClient();
  const isLunas = paymentData.status === 'Lunas';
  const tagihanId = paymentData.billingId;
  const visitId = paymentData.visitId;

  const tagihanList = initTagihanCache();
  const tagihanIndex = tagihanList.findIndex(t => t.id === tagihanId);
  const tagihan = tagihanIndex >= 0 ? tagihanList[tagihanIndex] : null;
  
  if (!tagihan) {
    throw new Error("Tagihan not found");
  }

  tagihan.status = isLunas ? 'Lunas' : 'Belum Lunas';
  
  // Local logic for updating piutang
  const piutangList = initPiutangCache();
  const piutangIndex = piutangList.findIndex(p => p.visitId === visitId);
  let updatedPiutang: Piutang | null = null;
  
  if (!isLunas) {
    const newPaymentLog: PaymentLog = {
      id: `LOG-${Date.now()}`,
      amount: paymentData.amountPaid,
      date: paymentData.paymentDate,
      paymentType: paymentData.paymentType,
      nextDueDate: paymentData.dueDate
    };
    
    if (piutangIndex >= 0) {
      piutangList[piutangIndex].paymentHistory.push(newPaymentLog);
      piutangList[piutangIndex].nextDueDate = paymentData.dueDate;
      updatedPiutang = piutangList[piutangIndex];
    } else {
      updatedPiutang = {
        visitId: tagihan.visitId,
        patientName: tagihan.patientName,
        totalBill: tagihan.totalBill,
        paymentHistory: [newPaymentLog],
        nextDueDate: paymentData.dueDate,
        status: 'Belum Lunas'
      };
      piutangList.push(updatedPiutang);
    }
  } else if (piutangIndex >= 0) {
    // If lunas, mark piutang as Lunas
    piutangList[piutangIndex].status = 'Lunas';
    const newPaymentLog: PaymentLog = {
      id: `LOG-${Date.now()}`,
      amount: paymentData.amountPaid,
      date: paymentData.paymentDate,
      paymentType: paymentData.paymentType,
    };
    piutangList[piutangIndex].paymentHistory.push(newPaymentLog);
    updatedPiutang = piutangList[piutangIndex];
  }

  if (isLunas) {
    tagihanList.splice(tagihanIndex, 1);
  } else {
    tagihanList[tagihanIndex] = tagihan;
  }
  
  saveTagihanCache(tagihanList);
  savePiutangCache(piutangList);

  if (supabase && isSupabaseConfigured()) {
    try {
      if (isLunas) {
        await supabase.from('tagihan_pasien').update({ status: 'Lunas', updated_at: new Date().toISOString() }).eq('id', tagihanId);
      } else {
        await supabase.from('tagihan_pasien').update({ status: 'Belum Lunas', updated_at: new Date().toISOString() }).eq('id', tagihanId);
      }

      if (updatedPiutang) {
        await supabase.from('piutang_pasien').upsert({
          visit_id: updatedPiutang.visitId,
          patient_name: updatedPiutang.patientName,
          total_bill: updatedPiutang.totalBill,
          payment_history: updatedPiutang.paymentHistory,
          next_due_date: updatedPiutang.nextDueDate,
          status: updatedPiutang.status,
          updated_at: new Date().toISOString()
        });
      }
    } catch (e) {
      console.error('savePayment supabase error:', e);
    }
  }

  realtimeService.emitEvent('tagihan_pasien', 'UPDATE', paymentData);
}

export async function updatePiutang(updatedPiutang: Piutang): Promise<void> {
  const supabase = getSupabaseClient();
  const list = initPiutangCache();
  const idx = list.findIndex(p => p.visitId === updatedPiutang.visitId);
  if (idx >= 0) {
    list[idx] = updatedPiutang;
    savePiutangCache(list);
  }

  if (supabase && isSupabaseConfigured()) {
    try {
      await supabase.from('piutang_pasien').update({
        payment_history: updatedPiutang.paymentHistory,
        next_due_date: updatedPiutang.nextDueDate,
        status: updatedPiutang.status,
        updated_at: new Date().toISOString()
      }).eq('visit_id', updatedPiutang.visitId);
    } catch (e) {
      console.error('updatePiutang supabase error:', e);
    }
  }
  realtimeService.emitEvent('piutang_pasien', 'UPDATE', updatedPiutang);
}

export async function generateTagihan(pendaftaranId: string): Promise<void> {
  // Compute bill from Master Harga Dasar, Master Layanan Lain, Master Obat, Master BHP
  try {
    const { fetchPendaftaranById } = await import('./pendaftaranService.js');
    const { fetchPemeriksaanByPendaftaranId } = await import('./pemeriksaanService.js');
    const { fetchObatStokBerjalanList } = await import('./manajemenObatService.js');
    const { fetchBhpStokBerjalanList } = await import('./manajemenBhpService.js');
    
    // Fallback static masters if DB not populated, wait no, prompt says 
    // "Kompisisi Harga dasara layanan dari master harga dasar... dll"
    
    const pendaftaran = await fetchPendaftaranById(pendaftaranId);
    const pemeriksaan = await fetchPemeriksaanByPendaftaranId(pendaftaranId);
    
    if (!pendaftaran || !pemeriksaan) return;

    let baseServiceFee = 50000; // Placeholder, better to fetch from Master Harga Dasar based on poli
    // Let's import masterHargaDasarService
    try {
      const { fetchMasterHargaDasarList } = await import('./masterHargaDasarService.js');
      const masterHargaDasar = (await fetchMasterHargaDasarList()).items;
      const hargaPoli = masterHargaDasar.find((h: any) => h.namaLayanan === pendaftaran.jenisLayanan);
      if (hargaPoli) {
        baseServiceFee = hargaPoli.hargaDasar;
      }
    } catch (e) {}

    let medicinePrice = 0;
    let bhpPrice = 0;
    let otherServicePrice = 0;

    // Medicine Price
    const plan = pemeriksaan.plan;
    if (plan && plan.terapiFarmakologi && plan.terapiFarmakologi.length > 0) {
      const masterObat = await fetchObatStokBerjalanList({strategy: 'full'});
      plan.terapiFarmakologi.forEach((terapi: any) => {
        const found = masterObat.items?.find((o: any) => o.sku === terapi.sku);
        if (found) {
          medicinePrice += (found.hargaJual || 0) * (terapi.jumlah || 1);
        }
      });
    }

    // BHP Price
    const bhpItems = pemeriksaan.bhp;
    if (bhpItems && bhpItems.length > 0) {
      const masterBhp = await fetchBhpStokBerjalanList({strategy: 'full'});
      bhpItems.forEach((bhpItem: any) => {
        const found = masterBhp.items?.find((b: any) => b.sku === bhpItem.sku);
        if (found) {
          bhpPrice += (found.hargaJual || 0) * (bhpItem.jumlah || 1);
        }
      });
    }

    // Other Service Price
    if (plan && plan.layananLain && plan.layananLain.length > 0) {
      try {
        const { fetchMasterLayananLainList } = await import('./masterLayananLainService.js');
        const masterLayananLain = (await fetchMasterLayananLainList()).items;
        plan.layananLain.forEach((ll: any) => {
          const found = masterLayananLain.find((m: any) => m.nama === ll.namaLayanan);
          if (found) {
            otherServicePrice += found.harga || 0;
          }
        });
      } catch (e) {}
    }

    const totalBill = baseServiceFee + medicinePrice + bhpPrice + otherServicePrice;

    const newTagihan: Billing = {
      id: `TAG-${Date.now()}`,
      visitId: pendaftaranId,
      patientName: pendaftaran.nama,
      serviceType: pendaftaran.jenisLayanan,
      baseServiceFee,
      medicinePrice,
      bhpPrice,
      otherServicePrice,
      totalBill,
      status: 'Belum Lunas',
      createdAt: new Date().toISOString()
    };

    const supabase = getSupabaseClient();
    if (supabase && isSupabaseConfigured()) {
      await supabase.from('tagihan_pasien').upsert({
        id: newTagihan.id,
        visit_id: newTagihan.visitId,
        patient_name: newTagihan.patientName,
        service_type: newTagihan.serviceType,
        base_service_fee: newTagihan.baseServiceFee,
        medicine_price: newTagihan.medicinePrice,
        bhp_price: newTagihan.bhpPrice,
        other_service_price: newTagihan.otherServicePrice,
        total_bill: newTagihan.totalBill,
        status: newTagihan.status,
        updated_at: new Date().toISOString()
      }, { onConflict: 'visit_id' });
    }

    const list = initTagihanCache();
    const existIdx = list.findIndex(t => t.visitId === pendaftaranId);
    if (existIdx >= 0) {
      list[existIdx] = { ...list[existIdx], ...newTagihan, id: list[existIdx].id };
    } else {
      list.unshift(newTagihan);
    }
    saveTagihanCache(list);
    realtimeService.emitEvent('tagihan_pasien', 'INSERT', newTagihan);

  } catch (error) {
    console.error('generateTagihan failed', error);
  }
}

function mapTagihanRowToData(row: any): Billing {
  return {
    id: row.id,
    visitId: row.visit_id,
    patientName: row.patient_name,
    serviceType: row.service_type || 'Umum',
    baseServiceFee: Number(row.base_service_fee) || 0,
    medicinePrice: Number(row.medicine_price) || 0,
    bhpPrice: Number(row.bhp_price) || 0,
    otherServicePrice: Number(row.other_service_price) || 0,
    totalBill: Number(row.total_bill) || 0,
    status: row.status,
    createdAt: row.created_at || new Date().toISOString()
  };
}

function mapPiutangRowToData(row: any): Piutang {
  return {
    visitId: row.visit_id,
    patientName: row.patient_name,
    totalBill: Number(row.total_bill) || 0,
    paymentHistory: typeof row.payment_history === 'string' ? JSON.parse(row.payment_history) : (row.payment_history || []),
    nextDueDate: row.next_due_date,
    status: row.status
  };
}
