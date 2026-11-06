# E-Surat UNUSU : Documentation Hub

Pusat dokumentasi arsitektur, aturan sistem tata naskah dinas, design system, dan tata kelola modul E-Surat UNUSU (Sistem Persuratan & Disposisi Digital Universitas Nahdlatul Ulama Sumatera Utara).

---

## 📁 Struktur Dokumentasi

```
docs/
├── README.md                  ← Gambaran umum dokumentasi & cara menjalankan project
├── PROJECT_RULES.md           ← Aturan global rekayasa software & integritas persuratan
└── design-system/
    ├── DESIGN_RULES.md        ← Filosofi, token elevasi, layout card & aturan UI/UX
    ├── COLORS.md              ← Token warna kelembagaan UNUSU & slate ramp
    ├── TYPOGRAPHY.md          ← Skala & aturan Plus Jakarta Sans / Inter
    ├── COMPONENTS.md          ← Registri komponen bersama (Shared Components)
    └── PAGE_TEMPLATES.md      ← Registri template halaman (AdminPanelTemplate, CardContainer, dll)
```

---

## 🚀 Menjalankan Project

### Prerequisites
- Node.js >= 18
- MySQL Server (Database persuratan UNUSU)
- npm

### Development
```bash
# Menjalankan server Express (tsx watch) dan client Vite secara simultan
npm run dev

# Hanya backend server
npm run dev:server

# Hanya frontend client (Vite)
npm run dev:client
```

### Production Build & Run
```bash
# Build client (Vite) dan server (TypeScript)
npm run build

# Menjalankan server production
npm start
```

---

## 🏛️ Konvensi Tim & Boundary
1. **Aturan Prioritas Tertinggi**: Baca `docs/PROJECT_RULES.md` dan panduan `docs/design-system/*` sebelum memodifikasi kode.
2. **Build Once, Reuse Everywhere**: Setiap halaman terikat pada template halaman yang sesuai (`AdminPanelTemplate`, `CardContainer`). Dilarang menduplikasi struktur halaman dari scratch.
3. **Persuratan & Keabsahan Digital**: Verifikasi surat publik (`/verifikasi/:token`) dilindungi oleh cryptographic token dan QR code validator yang tidak memerlukan login.
4. **Disiplin Build**: Frontend dan backend dibangun terpisah melalui `npm run build:client` dan `npm run build:server`.
