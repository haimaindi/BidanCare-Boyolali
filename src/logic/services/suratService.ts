import { getSupabaseClient, isSupabaseConfigured } from '../libs/supabaseClient.js';

export async function saveSuratSakit(data: any): Promise<void> {
  const supabase = getSupabaseClient();
  if (supabase && isSupabaseConfigured()) {
    try {
      await supabase.from('surat_sakit').upsert({
        id: data.id || `SS-${Date.now()}`,
        pemeriksaan_id: data.pemeriksaanId,
        patient_name: data.patientName,
        patient_age: data.patientAge,
        patient_job: data.patientJob,
        patient_address: data.patientAddress,
        start_date: data.startDate,
        end_date: data.endDate,
        duration_days: data.durationDays,
        doctor_name: data.doctorName,
        updated_at: new Date().toISOString()
      });
    } catch (e) {
      console.error('Failed to save surat_sakit:', e);
    }
  }
}

export async function saveSuratKeteranganLahir(data: any): Promise<void> {
  const supabase = getSupabaseClient();
  if (supabase && isSupabaseConfigured()) {
    try {
      await supabase.from('surat_keterangan_lahir').upsert({
        id: data.id || `SKL-${Date.now()}`,
        pemeriksaan_id: data.pemeriksaanId,
        mother_name: data.motherName,
        mother_age: data.motherAge,
        mother_job: data.motherJob,
        mother_address: data.motherAddress,
        father_name: data.fatherName,
        father_age: data.fatherAge,
        father_job: data.fatherJob,
        baby_name: data.babyName,
        baby_gender: data.babyGender,
        baby_weight: data.babyWeight,
        baby_length: data.babyLength,
        birth_date: data.birthDate,
        birth_time: data.birthTime,
        birth_type: data.birthType,
        doctor_name: data.doctorName,
        updated_at: new Date().toISOString()
      });
    } catch (e) {
      console.error('Failed to save surat_keterangan_lahir:', e);
    }
  }
}

export async function saveSuratPengantarLab(data: any): Promise<void> {
  const supabase = getSupabaseClient();
  if (supabase && isSupabaseConfigured()) {
    try {
      await supabase.from('surat_pengantar_lab').upsert({
        id: data.id || `SPL-${Date.now()}`,
        pemeriksaan_id: data.pemeriksaanId,
        patient_name: data.patientName,
        patient_age: data.patientAge,
        patient_gender: data.patientGender,
        patient_address: data.patientAddress,
        clinical_diagnosis: data.clinicalDiagnosis,
        lab_tests: data.labTests,
        doctor_name: data.doctorName,
        updated_at: new Date().toISOString()
      });
    } catch (e) {
      console.error('Failed to save surat_pengantar_lab:', e);
    }
  }
}
