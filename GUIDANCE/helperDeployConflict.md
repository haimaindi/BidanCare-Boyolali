# HELPER: Resolving Deployment Conflicts (Google AI Studio vs Vercel/Node.js)

Dokumen ini berisi panduan penyelesaian masalah (*troubleshooting guide*) jika terjadi konflik build atau deployment antara Google AI Studio (Vite Development) dan Vercel (Node.js ESM Strict Production).

---

## 1. Top Issues & Quick Resolutions

### Issue 1: `ERR_MODULE_NOT_FOUND` / Cannot find module
- **Penyebab**: Import file relatif di folder `src/logic/` tidak mencantumkan ekstensi `.js`.
- **Gejala**: Applet jalan normal di Vite dev server, namun GAGAL (*build failure*) saat dideploy ke Vercel/Node.js.
- **Solusi**: Tambahkan `.js` pada semua relative import di berkas `src/logic/`.
  ```typescript
  // Ubah dari:
  import { myService } from './myService';
  // Menjadi:
  import { myService } from './myService.js';
  ```

### Issue 2: `ReferenceError: window is not defined` / `localStorage is not defined`
- **Penyebab**: Akses langsung ke `window` atau `localStorage` saat Vercel melakukan Server-Side Pre-rendering / Static Site Generation.
- **Solusi**: Bungkus pengaksesan dengan Isomorphic Guard.
  ```typescript
  if (typeof window !== 'undefined') {
    // Akses window / localStorage di sini
  }
  ```

### Issue 3: Missing Environment Variables (`undefined`)
- **Penyebab**: Vercel menggunakan `process.env.MY_VAR` sedangkan Vite menggunakan `import.meta.env.VITE_MY_VAR`.
- **Solusi**: Gunakan `getEnvVar('MY_VAR')` dari `src/logic/config.ts`.

---

## 2. Best Practices Checklist Before Push/Deploy

1. **Jalankan Linter**: Pastikan `npm run lint` (`lint_applet`) lulus tanpa error.
2. **Jalankan Production Build Check**: Pastikan `npm run build` (`compile_applet`) lulus tanpa error ESM resolution.
3. **Pemeriksaan SSR**: Pastikan tidak ada komponen global di `src/logic/` yang mengeksekusi efek samping browser (*browser side effects*) di luar `useEffect` atau tanpa `isBrowser` check.
