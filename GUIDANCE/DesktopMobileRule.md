# GUIDANCE: Desktop/Mobile Priorities & Adaptive Layout Rule (DesktopMobileRule)

Dokumen ini merupakan panduan dan prinsip arsitektur standar untuk pengembangan antarmuka pengguna (UI/UX) yang **Desktop-First** namun **Dynamic & Native Mobile Friendly**.

---

## 1. Prinsip Utama Utamanya (Desktop-First with Dynamic Mobile UX)

1. **Desktop-First Priority**:
   - Aplikasi dirancang dan dioptimalkan secara mendalam untuk produktivitas layar besar (Desktop / Laptop) dengan kepadatan informasi (*data density*) yang tinggi, tabel multidimensi, keyboard shortcuts, dan visualisasi komprehensif.

2. **Native Mobile-Friendly Experience**:
   - Saat diakses dari perangkat seluler (Mobile / Smartphone), tampilan tidak sekadar "dikecilkan" (*scaled down*), melainkan secara dinamis berubah (*adaptive transformation*) menyerupai aplikasi mobile native yang responsif, halus (*smooth*), dan ringkas (*compact*).
   - Tabel lebar pada desktop berubah secara otomatis menjadi susunan kartu (*Card View / List View*) pada mobile.
   - Modal dialog besar pada desktop dapat berubah menjadi *Bottom Sheet / Drawer* pada tampilan mobile.

3. **Restriksi Zooming (Strict No-Zoom)**:
   - Aplikasi dikunci agar **tidak bisa di-zoom-in maupun zoom-out** (`user-scalable=no`) melalui Meta Viewport pada HTML. Hal ini menjamin konsistensi skala komponen UI, kepastian touch-target minimum (44px), serta sensasi aplikasi native yang kokoh.

---

## 2. Breakpoint Adaptif & Viewport Engine

Aplikasi menyediakan `ViewportContext` terpusat (`src/logic/context/ViewportContext.tsx`) yang menyediakan status boolean reaktif terhadap ukuran layar perangkat:

| Variable | Condition (Width) | Deskripsi Peruntukan |
| :--- | :--- | :--- |
| **`isDesktop`** | `width >= 1024px` (≥ `lg`) | Layar Desktop/Laptop. Menampilkan Sidebar penuh, Tabel dengan banyak kolom, Modal standar. |
| **`isTablet`** | `768px <= width < 1024px` (`md` to `lg`) | Layar Tablet/iPad. Menampilkan Layout semi-compact, Sidebar dapat di-collapse, Grid 2 kolom. |
| **`isMobile`** | `width < 768px` (< `md`) | Layar Smartphone. Menampilkan Bottom Navigation / Drawer, Mobile Card View, Stack Layout 1 kolom. |
| **`isCompact`** | `width < 1024px` | Kategori gabungan Mobile & Tablet (Layar ringkas). |
| **`isWide`** | `width >= 1024px` | Kategori layar lebar (Desktop). |

---

## 3. Pola Adaptasi UI Desktop vs Mobile

### A. Komponen Tabel (`TableModule.tsx`)
- **Desktop (`isDesktop`)**: Menampilkan elemen `<table>`, `<thead>`, `<tbody>` dengan scroll horizontal jika kolom sangat banyak.
- **Mobile (`isMobile`)**: Otomatis merender urutan *Card Component* khusus untuk tiap baris data dengan informasi kunci (*Primary Badge/Status* di atas, informasi rinci di bawah, serta tombol aksi cepat yang dapat di-tap).

### B. Form & Input
- **Desktop**: Form dengan layout 2 atau 3 kolom berdampingan untuk efisiensi ruang.
- **Mobile**: Form menjadi 1 kolom vertikal (*single column stack*) dengan *spacing* (ruang tekan) yang cukup untuk jari (*minimum 44px touch target*).

### C. Modal & Dialog
- **Desktop**: Dialog overlay centered di tengah layar dengan backdrop blur.
- **Mobile**: Menempel dari bagian bawah layar (*Bottom Sheet Drawer*) dengan sudut melengkung di bagian atas.

### D. Navigasi & Header
- **Desktop**: Sidebar kiri yang persistent dengan menu bertingkat.
- **Mobile**: Header ringkas dengan tombol hamburger menu / slide-over drawer navigasi.

---

## 4. Penempatan Kode & Integrasi (Modular Monolith)

Sesuai ketentuan `AGENTS.md`:

1. **Global Context (`src/logic/context/ViewportContext.tsx`)**:
   - Mengelola listener `resize` dengan debounce ringan untuk meng-update `isDesktop`, `isTablet`, `isMobile`, `isCompact`, dan `isWide`.

2. **Hook Usage (`useViewport`)**:
   - Komponen UI atau modul dapat langsung menggunakan:
     ```tsx
     import { useViewport } from '@/logic/context/ViewportContext';

     const MyComponent = () => {
       const { isMobile, isDesktop } = useViewport();
       return isMobile ? <MobileCardLayout /> : <DesktopTableLayout />;
     };
     ```

3. **HTML Metadata (`index.html`)**:
   - Memastikan Meta Viewport diset sebagai berikut:
     ```html
     <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
     ```

---

## 5. Checklist Implemetasi Adaptif

- [ ] Viewport meta tag terkonfigurasi dengan `user-scalable=no` di `index.html`.
- [ ] `ViewportProvider` terpasang di root aplikasi (`App.tsx` / `main.tsx`).
- [ ] Menggunakan `useViewport` untuk membedakan perlakuan komponen khusus Mobile vs Desktop.
- [ ] Touch target pada perangkat mobile terjamin minimal 44px × 44px.
- [ ] Bebas error linting (`lint_applet`) dan dapat di-compile dengan sukses (`compile_applet`).
