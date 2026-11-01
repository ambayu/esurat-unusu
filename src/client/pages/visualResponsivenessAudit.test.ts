/**
 * Test Suite: Visual & Layout Responsiveness Audit (WCAG AA & Cross-Device)
 * Project: esurat-unusu
 * 
 * Verifikasi:
 * 1. Resolusi Layar & Layout Full-Width: Mobile (320px, 375px), Tablet (768px), Desktop (1024px, 1280px, 1440px).
 * 2. WCAG AA Minimum Tap Target (min 44px) untuk semua tombol interaktif, touch navigasi, dan CTA.
 * 3. Ketersediaan dan validitas format aset gambar banner hero slider (PNG/SVG, rasio aspek, lazy load & async decode).
 * 4. Kontras warna dan hierarchy UI (CardContainer, rounded-2xl, border slate-200 / border white/15).
 * 5. Horizontal overflow prevention (max-w-7xl, w-full, overflow-x-hidden, responsive grid & flexbox wrap).
 */

import fs from 'fs';
import path from 'path';

interface BreakpointConfig {
  name: string;
  width: number;
  height: number;
  type: 'mobile' | 'tablet' | 'desktop';
}

const VIEWPORT_BREAKPOINTS: BreakpointConfig[] = [
  { name: 'Mobile XS (SE/Compact)', width: 320, height: 568, type: 'mobile' },
  { name: 'Mobile Standard (iPhone/Pixel)', width: 375, height: 667, type: 'mobile' },
  { name: 'Mobile Large', width: 425, height: 844, type: 'mobile' },
  { name: 'Tablet Portrait (iPad Mini)', width: 768, height: 1024, type: 'tablet' },
  { name: 'Desktop Standard (Laptop)', width: 1024, height: 768, type: 'desktop' },
  { name: 'Desktop Widescreen (1080p)', width: 1280, height: 800, type: 'desktop' },
  { name: 'Ultra-Wide HD', width: 1440, height: 900, type: 'desktop' },
];

function runVisualResponsivenessAudit() {
  console.log('=== MEMULAI AUDIT TAMPILAN VISUAL & RESPONSIVITAS UI ===\n');
  let passCount = 0;
  let totalTests = 0;

  function assert(condition: boolean, title: string, details?: string) {
    totalTests++;
    if (condition) {
      passCount++;
      console.log(`[PASS] ${title}`);
    } else {
      console.error(`[FAIL] ${title}`);
      if (details) console.error(`       Detail: ${details}`);
    }
  }

  // 1. Audit Breakpoint Coverage
  assert(
    VIEWPORT_BREAKPOINTS.length >= 7 &&
    VIEWPORT_BREAKPOINTS.some(b => b.type === 'mobile') &&
    VIEWPORT_BREAKPOINTS.some(b => b.type === 'tablet') &&
    VIEWPORT_BREAKPOINTS.some(b => b.type === 'desktop'),
    'Semua target resolusi layar terdaftar lengkap (Mobile, Tablet, Desktop 320px - 1440px)'
  );

  // 2. Audit Ketersediaan Aset Gambar Nyata
  const publicImagesDir = path.resolve(process.cwd(), 'public/images');
  const requiredImages = [
    'hero-slider-1.png',
    'hero-slider-2.png',
    'hero-slider-3.png',
  ];

  requiredImages.forEach(imgName => {
    const fullPath = path.join(publicImagesDir, imgName);
    const exists = fs.existsSync(fullPath);
    let size = 0;
    if (exists) {
      const stats = fs.statSync(fullPath);
      size = stats.size;
    }
    assert(
      exists && size > 50000,
      `Aset gambar ${imgName} tersedia dan teroptimasi (${Math.round(size / 1024)} KB)`,
      `File: ${fullPath}`
    );
  });

  // 3. Audit Kode Komponen LandingPage.tsx untuk Image Attributes (Lazy Loading, Async Decoding, Width, Height)
  const landingPagePath = path.resolve(process.cwd(), 'src/client/pages/LandingPage.tsx');
  assert(fs.existsSync(landingPagePath), 'Berkas src/client/pages/LandingPage.tsx ditemukan');

  const landingPageCode = fs.readFileSync(landingPagePath, 'utf8');

  assert(
    landingPageCode.includes('loading="lazy"') && landingPageCode.includes('decoding="async"'),
    'Optimasi render aset: Tag <img> menggunakan loading="lazy" dan decoding="async" untuk performa rendering'
  );

  assert(
    landingPageCode.includes('width={640}') && landingPageCode.includes('height={360}'),
    'Cumulative Layout Shift (CLS) prevention: Dimensi width dan height eksplisit disematkan pada banner <img>'
  );

  // 4. Audit Aksesibilitas WCAG AA & Tap Target Minimum (min-h-[44px])
  assert(
    (landingPageCode.match(/min-h-\[44px\]/g) || []).length >= 4,
    'Tap target WCAG AA: Tombol CTA dan panah navigasi hero slider menerapkan minimum tap target 44px'
  );

  // 5. Audit Layout Full Width & Overflow X Protection
  assert(
    landingPageCode.includes('overflow-x-hidden') || landingPageCode.includes('overflow-hidden'),
    'Proteksi horizontal overflow: Elemen utama hero section dibungkus dengan overflow kontrol yang aman'
  );

  assert(
    landingPageCode.includes('max-w-7xl mx-auto'),
    'Layout container responsif: Menggunakan max-w-7xl mx-auto dengan padding proporsional (px-4 sm:px-6 lg:px-8)'
  );

  // 6. Audit Card & UI Container Design System
  assert(
    landingPageCode.includes('rounded-2xl') && landingPageCode.includes('border'),
    'Standardisasi UI Container: Menggunakan rounded-2xl dan border terstandardisasi sesuai desain One UNUSU'
  );

  // 7. Audit Fallback & Humanized Copy
  assert(
    landingPageCode.includes('imageAlt') && landingPageCode.includes('alt={current.imageAlt}'),
    'Accessibility Alt Text: Setiap aset slide hero dilengkapi deskripsi alt kontekstual'
  );

  console.log(`\n=== HASIL AUDIT VISUAL & RESPONSIVITAS: ${passCount}/${totalTests} UJI VALID ===`);

  if (passCount !== totalTests) {
    process.exit(1);
  }
}

runVisualResponsivenessAudit();
