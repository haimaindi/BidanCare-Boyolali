# Panduan Modul Pendaftaran (Offline & Online)

Modul ini mengelola proses pendaftaran pasien, baik yang datang langsung (Offline) maupun melalui booking (Online). Sistem menggunakan **NIK (Nomor Induk Kependudukan)** sebagai kunci utama identitas pasien untuk memastikan sinkronisasi data antar modul.

---

## 1. Pendaftaran Offline (Petugas)

Pendaftaran offline dilakukan oleh petugas di klinik. Fokus utamanya adalah kecepatan dan akurasi data.

### Fitur Utama & UX:
- **NIK-First Workflow**: Field NIK dipindahkan ke bagian atas (Data Kunjungan) untuk mempercepat pengecekan status pasien.
- **Smart NIK Search**:
  - Menggunakan `ComboBox` untuk input NIK.
  - Jika NIK yang diketik sesuai dengan data di `PATIENT_DATABASE`, sistem akan otomatis memuat data identitas pasien.
- **Sinkronisasi Status Pasien**:
  - Jika NIK terdeteksi sebagai pasien lama, Switch "Jenis Pasien" akan terkunci pada **Lama**.
  - Jika NIK tidak ditemukan, status default adalah **Baru**.
- **Mekanisme Proteksi Data (Reset vs Maintain)**:
  - Jika form sudah terisi (baik manual maupun auto-fill) lalu NIK diubah, sistem akan memunculkan modal konfirmasi.
  - **Reset & Update**: Menghapus data lama dan memuat data baru sesuai NIK (digunakan jika pasien memang berbeda).
  - **Pertahankan Data**: Menjaga data yang sudah diisi dan hanya memperbarui NIK (digunakan untuk koreksi typo NIK).
- **No RM (Rekam Medis)**:
  - Pasien Baru: Dibuat otomatis dengan format `RM-YYYYMM-XXXX` (Editable).
  - Pasien Lama: Memuat No RM lama dari database (Editable untuk revisi).

---

## 2. Pendaftaran Online (Mandiri)

Pendaftaran online digunakan oleh pasien secara mandiri. Data dari sini nantinya akan muncul di tabel **Booking Online** pada dashboard pendaftaran offline untuk diverifikasi petugas.

### Alur Kerja:
- Pasien mengisi NIK dan data identitas secara mandiri.
- Sistem memvalidasi kelengkapan data wajib (Layanan, Waktu, NIK, Nama, Alamat, dll).
- Tombol simpan hanya aktif jika data minimal terpenuhi.

---

## 3. Struktur Data & Teknis

### Interface Pasien (`src/modules/pendaftaran-offline/data/dummy.ts`):
```typescript
interface Pasien {
  nik: string;
  panggilan: string;
  nama: string;
  noRm: string;
  jenisKelamin: "P" | "L";
  tanggalLahir: string;
  alamat?: string;
  noHp?: string;
}
```

### Aturan Penomoran:
- **ID Kunjungan**: `KJ-[timestamp_6_digit]` (Otomatis).
- **Nomor Antrean**: `A-XXX` atau `B-XXX` sesuai jenis layanan.

---

## 4. Lokasi File Utama
- **Modul Offline**: `src/modules/pendaftaran-offline/PendaftaranOfflineModule.tsx`
- **Form Offline**: `src/modules/pendaftaran-offline/components/PendaftaranForm.tsx`
- **Modul Online**: `src/modules/pendaftaran-online/PendaftaranOnlineModule.tsx`
- **Form Online**: `src/modules/pendaftaran-online/components/PendaftaranOnlineForm.tsx`
- **Database Dummy**: `src/modules/pendaftaran-offline/data/dummy.ts`

---

*Panduan ini dibuat sebagai acuan standar UX dan Sinkronisasi Data Modul Pendaftaran.*
