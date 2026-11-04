# DESIGN RULES — E-SURAT UNUSU DESIGN SYSTEM

Dokumen ini mendefinisikan prinsip estetika, visual hierarchy, elevasi, spacing, dan layout aturan form section pada aplikasi E-Surat UNUSU.

---

## 1. Prinsip Desain Utama

1. **Institutional Dignity & Cleanliness**:
   - Memadukan karakter kelembagaan Universitas Nahdlatul Ulama Sumatera Utara dengan kerapian sistem administrasi digital modern.
   - Menggunakan warna hijau kelembagaan wibawa (`#0A5C36`) dan aksen emas (`#D4AF37`) yang bersih dan terbaca dengan baik.
2. **Keteraturan Visual & Bebas Emptiness**:
   - Dilarang membuat layar putih polos tanpa kontainer pembatas.
   - Canvas panel administrasi menggunakan `#F8FAFC` atau `#F1F5F9`, kontainer utama menggunakan `AdminPanelTemplate` putih dengan border `#CBD5E1`.
3. **No Slop & No Over-Decoration**:
   - Hindari icon dekoratif berlebihan atau animasi yang mendistraksi tugas persuratan.
   - Seluruh elemen harus fungsional, berorientasi efisiensi staf tata usaha dan pimpinan universitas.

---

## 2. Visual Hierarchy & Surface Mapping

| Elemen UI | Token / Hex | Karakteristik |
|---|---|---|
| Main Admin Canvas | `#F8FAFC` / `#F1F5F9` | Canvas abu-abu keperakan lembut |
| Unified Panel Container | `#FFFFFF` | Kontainer utama `AdminPanelTemplate` (border `#CBD5E1`, radius `16px`) |
| Standard Card | `#FFFFFF` | Kontainer data `CardContainer` (border `#CBD5E1`, radius `14px`) |
| Primary Action Button | `#0A5C36` (`surat-green`) | Hover `#064226`, teks putih, font-semibold |
| Secondary Action Button | `#F8FAFC` | Border `#CBD5E1`, teks `#0F172A`, hover `#F1F5F9` |
| Table Header Row | `#F8FAFC` | Latar header tabel dengan border bawah `#E2E8F0` |
| Active Sidebar Item | `#0A5C36` / `#F0FDF4` | Indikator aktif hijau dengan teks tegas |

---

## 3. Form Section Layout Rule

1. **Wajib Memakai Card Container**:
   - Setiap grup field form (misal: "Informasi Surat", "Tujuan & Pengirim", "Lampiran Berkas") **wajib dibungkus di dalam kartu (`CardContainer` atau kontainer ber-border `#CBD5E1`)**.
   - Dilarang meletakkan label atau input langsung di atas background canvas tanpa pembatas.
2. **Section Heading & Deskripsi**:
   - Setiap grup form harus memiliki heading 14–16px font-bold dengan keterangan ringkas 12px teks sekunder.
3. **Action Button Placement**:
   - Tombol simpan draft dan kirim surat diletakkan pada bilah aksi yang jelas di bawah form atau header panel.

---

## 4. Spacing & Touch Accessibility

- **Spacing**: Mengikuti kelipatan 4px Tailwind (`p-4`, `p-5`, `p-6`, `gap-3`, `gap-4`, `gap-6`).
- **Touch Target**: Seluruh tombol, pagination control, dan trigger aksi wajib memiliki tinggi dan lebar minimal 44px (`min-h-[44px] min-w-[44px]`).
- **Border Radius**:
  - `8px` (`rounded-[8px]` / `rounded-lg`): Input field, filter selector.
  - `10px` (`rounded-[10px]`): Wadah icon, status badge.
  - `14px` (`rounded-[14px]`): `CardContainer` dan tabel card.
  - `16px` (`rounded-[16px]`): `AdminPanelTemplate` utama.
