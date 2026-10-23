import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { SuratList } from './pages/SuratList';
import { AjukanSurat } from './pages/AjukanSurat';
import { SuratDetail } from './pages/SuratDetail';
import { VerifikasiDokumen } from './pages/VerifikasiDokumen';

export function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans">
        <Navbar />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<SuratList />} />
            <Route path="/ajukan" element={<AjukanSurat />} />
            <Route path="/surat/:id" element={<SuratDetail />} />
            <Route path="/verifikasi" element={<VerifikasiDokumen />} />
            <Route path="/verifikasi/:token" element={<VerifikasiDokumen />} />
          </Routes>
        </main>
        <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500">
          <p>© {new Date().getFullYear()} E-Surat UNUSU • Tata Naskah & Disposisi Digital Universitas Nahdlatul Ulama Sumatera Utara</p>
        </footer>
      </div>
    </Router>
  );
}

export default App;
