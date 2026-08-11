# GUIDANCE: Environment Switching & Isomorphic SSR Safety Rule (EnvironmentSwitchingRule)

Dokumen ini merupakan panduan dan prinsip arsitektur standar untuk menjamin aplikasi bersifat **Isomorphic / Universal** sehingga dapat dijalankan dan dideploy tanpa konflik baik di lingkungan **Google AI Studio (Vite Client/Dev)** maupun **Vercel / Cloud Run (Node.js ESM Strict / SSR Production)**.

---

## 1. Masalah Utama & Latar Belakang

1. **Aturan Ekstensi Import Node.js ESM (`.js` extension)**:
   - Di lingkungan Node.js dengan ES Modules (`"type": "module"`), resolution specifier membutuhkan ekstensi file eksplisit (`.js`).
   - Meskipun berkas sumber bertipe TypeScript (`.ts`), import relatif di layer `src/logic/` **WAJIB** mencantumkan ekstensi `.js` agar tidak terjadi error `ERR_MODULE_NOT_FOUND` saat dibundle oleh Vercel / Node.js ESM runtime.

2. **Server-Side Rendering (SSR) & Browser Object Access**:
   - Saat dijalankan atau dibuild di lingkungan SSR / Edge runtime, objek browser seperti `window`, `document`, `localStorage`, `sessionStorage`, `navigator`, `location`, serta UI Notification library (misal SweetAlert2, Toast) **TIDAK TERSEDIA**.
   - Akses langsung tanpa pemeriksaan (*guard*) akan menyebabkan error fatal `ReferenceError: window is not defined` yang merusak proses render/build.

---

## 2. Aturan Wajib (Mandatory Rules)

### A. Dot JS Rule untuk Relative Imports (`src/logic/`)
Setiap import relatif antar-file TypeScript di dalam folder `/src/logic/` **harus menyertakan ekstensi `.js`**:

```typescript
// ❌ SALAH (Akan memicu ESM Module Resolution Error di Node.js/Vercel)
import { realtimeService } from '../services/realtimeService';
import { getLimitForPage } from '../services/fetchingCenter';

// ✅ BENAR (Lolos ESM Strict Check di Vercel & Vite)
import { realtimeService } from '../services/realtimeService.js';
import { getLimitForPage } from '../services/fetchingCenter.js';
```

### B. Isomorphic Guards (SSR Safety)
Semua kode logic, hooks, dan service yang mengakses Browser APIs wajib menggunakan Isomorphic Guard:

```typescript
// Safe Window & Document Guard
export const isBrowser = typeof window !== 'undefined' && typeof document !== 'undefined';

// Contoh penggunaan Safe Storage Access
export function getSafeLocalStorage(key: string, fallbackValue: string = ''): string {
  if (!isBrowser) return fallbackValue;
  try {
    return window.localStorage.getItem(key) || fallbackValue;
  } catch (error) {
    console.warn(`[Storage] Failed to read ${key}:`, error);
    return fallbackValue;
  }
}
```

### C. Environment-Agnostic Config (`src/logic/config.ts`)
Variabel lingkungan (*Environment Variables*) harus dibaca secara fleksibel dengan mendukung baik format Vite (`import.meta.env.VITE_*`) maupun format Node.js/Vercel (`process.env.*`):

```typescript
export function getEnvVar(key: string, fallback: string = ''): string {
  // Check Vite client-side env
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    const viteKey = key.startsWith('VITE_') ? key : `VITE_${key}`;
    if (import.meta.env[viteKey]) return import.meta.env[viteKey];
    if (import.meta.env[key]) return import.meta.env[key];
  }

  // Check Node.js / Vercel server-side env
  if (typeof process !== 'undefined' && process.env) {
    if (process.env[key]) return process.env[key];
    const viteKey = key.startsWith('VITE_') ? key : `VITE_${key}`;
    if (process.env[viteKey]) return process.env[viteKey];
  }

  return fallback;
}
```

### D. Defensive Storage Key Sanitization
Fungsi penghapusan file atau pengaksesan key storage harus melakukan ekstraksi key murni secara otomatis (membersihkan proxy URL atau full URL path jika ada) sebelum mengeksekusi operasi hapus/get.

---

## 3. Checklist Deployment Vercel & AI Studio

- [ ] Seluruh relative import di `/src/logic/` menggunakan ekstensi `.js`.
- [ ] Objek `window`, `localStorage`, dan `document` terproteksi `typeof window !== 'undefined'`.
- [ ] Pengaksesan environment variables terpusat menggunakan `config.ts`.
- [ ] Pengecekan `lint_applet` dan `compile_applet` lolos tanpa error.
