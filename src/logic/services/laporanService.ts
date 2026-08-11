import { getSupabaseClient, isSupabaseConfigured } from '../libs/supabaseClient.js';

export async function fetchLaporanKeuangan(startDate: string, endDate: string) {
  const supabase = getSupabaseClient();
  if (!supabase || !isSupabaseConfigured()) return { trend: [], piutang: [], paymentTypes: [], paymentStatus: [], records: [] };
  
  const end = new Date(endDate);
  end.setHours(23, 59, 59, 999);
  
  const { data: billings } = await supabase.from('kasir_tagihan')
    .select('*')
    .gte('created_at', new Date(startDate).toISOString())
    .lte('created_at', end.toISOString());
    
  if (!billings) return { trend: [], piutang: [], paymentTypes: [], paymentStatus: [], records: [] };

  const records = billings;
  
  const lunasCount = records.filter(r => r.status === 'Lunas').length;
  const piutangCount = records.filter(r => r.status === 'Piutang').length;
  
  const paymentStatus = [
    { name: 'Lunas', value: lunasCount, color: '#10b981' },
    { name: 'Piutang', value: piutangCount, color: '#f59e0b' }
  ];

  const types: Record<string, number> = {};
  records.filter(r => r.status === 'Lunas').forEach(r => {
    types[r.metode_pembayaran] = (types[r.metode_pembayaran] || 0) + r.total_pembayaran;
  });
  const paymentTypes = Object.entries(types).map(([name, value]) => ({ name, value }));

  const trendDict: Record<string, any> = {};
  records.forEach(r => {
    const d = new Date(r.created_at).toISOString().split('T')[0];
    if (!trendDict[d]) trendDict[d] = { date: d, pendapatan: 0, piutang: 0 };
    if (r.status === 'Lunas') trendDict[d].pendapatan += r.total_pembayaran;
    if (r.status === 'Piutang') trendDict[d].piutang += r.total_tagihan;
  });
  
  const trend = Object.values(trendDict).sort((a: any, b: any) => a.date.localeCompare(b.date));
  const piutang = trend.map((t: any) => ({ date: t.date, piutangBaru: t.piutang, pelunasan: 0 })); // pelunasan could be added if tracking payment dates

  return { trend, piutang, paymentTypes, paymentStatus, records };
}

export async function fetchLaporanPasien(startDate: string, endDate: string) {
  const supabase = getSupabaseClient();
  if (!supabase || !isSupabaseConfigured()) return { trend: [], demografi: [], poli: [], records: [] };

  const end = new Date(endDate);
  end.setHours(23, 59, 59, 999);
  
  const { data: pendaftarans } = await supabase.from('pendaftaran_pasien')
    .select('*')
    .gte('created_at', new Date(startDate).toISOString())
    .lte('created_at', end.toISOString());
    
  if (!pendaftarans) return { trend: [], demografi: [], poli: [], records: [] };

  const records = pendaftarans;

  const trendDict: Record<string, any> = {};
  records.forEach(r => {
    const d = new Date(r.created_at).toISOString().split('T')[0];
    if (!trendDict[d]) trendDict[d] = { date: d, umum: 0, bpjs: 0, baru: 0, lama: 0 };
    if (r.penjamin === 'Umum') trendDict[d].umum += 1;
    else trendDict[d].bpjs += 1;
    // For simplicity, just randomize or use logic if pasion baru
    trendDict[d].baru += 1; 
  });
  const trend = Object.values(trendDict).sort((a: any, b: any) => a.date.localeCompare(b.date));

  const males = records.filter(r => r.jenis_kelamin === 'L').length;
  const females = records.filter(r => r.jenis_kelamin === 'P').length;
  const demografi = [
    { name: 'Laki-laki', value: males, color: '#3b82f6' },
    { name: 'Perempuan', value: females, color: '#ec4899' }
  ];

  const poliDict: Record<string, number> = {};
  records.forEach(r => {
    poliDict[r.jenis_layanan] = (poliDict[r.jenis_layanan] || 0) + 1;
  });
  const poli = Object.entries(poliDict).map(([name, value]) => ({ name, value }));

  return { trend, demografi, poli, records };
}

export async function fetchLaporanObatBhp(startDate: string, endDate: string) {
  const supabase = getSupabaseClient();
  if (!supabase || !isSupabaseConfigured()) return { trend: [], margin: [], records: [] };

  const end = new Date(endDate);
  end.setHours(23, 59, 59, 999);
  
  const { data: trx } = await supabase.from('obat_transactions')
    .select('*, master_obat(nama, harga_beli, harga_jual)')
    .gte('tanggal', new Date(startDate).toISOString())
    .lte('tanggal', end.toISOString());
    
  if (!trx) return { trend: [], margin: [], records: [] };

  const records = trx;

  const trendDict: Record<string, any> = {};
  records.forEach(r => {
    const d = new Date(r.tanggal).toISOString().split('T')[0];
    if (!trendDict[d]) trendDict[d] = { date: d, masuk: 0, keluar: 0 };
    if (r.tipe === 'Masuk') trendDict[d].masuk += r.jumlah;
    if (r.tipe === 'Keluar') trendDict[d].keluar += r.jumlah;
  });
  const trend = Object.values(trendDict).sort((a: any, b: any) => a.date.localeCompare(b.date));

  // Margin logic
  const marginData = [
    { name: 'Jan', pendapatan: 0, hpp: 0, profit: 0 }
  ];

  return { trend, margin: marginData, records };
}
