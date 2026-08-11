import { getSupabaseClient, isSupabaseConfigured } from '../libs/supabaseClient.js';
import { FollowUpItem } from '../../modules/follow-up/types.js';

export async function fetchFollowUpList(): Promise<FollowUpItem[]> {
  const supabase = getSupabaseClient();
  if (!supabase || !isSupabaseConfigured()) {
    return [];
  }
  try {
    const { data: masterBroadcasts } = await supabase.from('master_broadcast').select('*');
    if (!masterBroadcasts || masterBroadcasts.length === 0) return [];
    
    // We fetch recent pemeriksaans (for Follow Up) and kbs/imunisasi (for Reminder)
    // To make it simple, we fetch all pemeriksaan in the last 14 days and check
    const twoWeeksAgo = new Date();
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
    
    const { data: pemeriksaanList } = await supabase.from('pemeriksaan_pasien')
      .select('id, created_at, plan, kb, imunisasi, anc, pnc, pendaftaran_pasien (nama, no_whatsapp, jenis_layanan)')
      .gte('created_at', twoWeeksAgo.toISOString());
    
    if (!pemeriksaanList) return [];

    const followUpList: FollowUpItem[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (const px of pemeriksaanList) {
      const pendaftaran = px.pendaftaran_pasien as any;
      if (!pendaftaran) continue;

      const category = pendaftaran.jenis_layanan;
      const broadcastConfig = masterBroadcasts.find(b => b.category === category);
      
      if (!broadcastConfig) continue;

      // Check Follow Up
      if (broadcastConfig.follow_up_days !== null && broadcastConfig.follow_up_template) {
        const visitDate = new Date(px.created_at);
        visitDate.setHours(0, 0, 0, 0);
        const diffDays = Math.floor((today.getTime() - visitDate.getTime()) / (1000 * 3600 * 24));
        
        if (diffDays === broadcastConfig.follow_up_days) {
          const template = broadcastConfig.follow_up_template.replace('{{A}}', pendaftaran.nama);
          followUpList.push({
            id: `FU-${px.id}`,
            patientName: pendaftaran.nama,
            whatsapp: pendaftaran.no_whatsapp || '-',
            visitType: category,
            panggilanType: 'Follow Up',
            templateMessage: template,
            status: "Pending"
          });
        }
      }

      // Check Reminder (based on next visit date)
      if (broadcastConfig.reminder_days !== null && broadcastConfig.reminder_template) {
        let nextVisitDateStr = null;
        if (px.kb && px.kb.kunjunganUlangDate) nextVisitDateStr = px.kb.kunjunganUlangDate;
        else if (px.imunisasi && px.imunisasi.tglKembali) nextVisitDateStr = px.imunisasi.tglKembali;
        else if (px.anc && px.anc.tglKembaliAnc) nextVisitDateStr = px.anc.tglKembaliAnc;
        else if (px.pnc && px.pnc.kf && px.pnc.kf.tglKembali) nextVisitDateStr = px.pnc.kf.tglKembali;
        else if (px.pnc && px.pnc.kn && px.pnc.kn.tglKembali) nextVisitDateStr = px.pnc.kn.tglKembali;
        else if (px.pnc && px.pnc.akhirNifas && px.pnc.akhirNifas.tglKembali) nextVisitDateStr = px.pnc.akhirNifas.tglKembali;

        if (nextVisitDateStr) {
          const nextVisitDate = new Date(nextVisitDateStr);
          nextVisitDate.setHours(0, 0, 0, 0);
          const diffDays = Math.floor((nextVisitDate.getTime() - today.getTime()) / (1000 * 3600 * 24));
          
          if (diffDays === broadcastConfig.reminder_days) {
            const template = broadcastConfig.reminder_template
              .replace('{{A}}', pendaftaran.nama)
              .replace('{{B}}', nextVisitDateStr);
              
            followUpList.push({
              id: `REM-${px.id}`,
              patientName: pendaftaran.nama,
              whatsapp: pendaftaran.no_whatsapp || '-',
              visitType: category,
              panggilanType: 'Reminder',
              templateMessage: template,
            status: "Pending"
            });
          }
        }
      }
    }

    return followUpList;
  } catch (e) {
    console.error('Failed to fetch follow up list:', e);
    return [];
  }
}
