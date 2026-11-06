/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // Dua keluarga font yang sama-sama Plus Jakarta Sans: `sans` untuk teks
      // isi, `display` untuk judul. Dideklarasikan di sini agar `font-sans`
      // tidak lagi jatuh ke font bawaan sistem operasi.
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['"Plus Jakarta Sans"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        surat: {
          green: {
            DEFAULT: '#0A5C36',
            dark: '#064226',
            light: '#117A4A',
            50: '#F0FDF4',
            100: '#DCFCE7',
          },
          // Dua tingkat emas. `gold` (#D4AF37) hanya aman di atas hijau tua
          // #064226 (rasio 5.50). Di atas hijau #0A5C36 rasionya 3.85 sehingga
          // gagal WCAG AA untuk teks normal, jadi `gold-light` dipakai di sana
          // (rasio 4.84). Pakai `gold` bila latarnya hijau tua atau putih gelap.
          gold: '#D4AF37',
          'gold-light': '#E8C55A',
        },
      }
    },
  },
  plugins: [],
}
