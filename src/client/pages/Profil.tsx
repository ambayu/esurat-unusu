import React from 'react';

import { PageShell } from '../components/PageShell';
import { CardContainer } from '../components/CardContainer';
import { useAuth } from '../context/AuthContext';
import {
  AcademicCapIcon,
  BuildingOffice2Icon,
  EnvelopeIcon,
  IdentificationIcon,
  ShieldCheckIcon,
  UserCircleIcon,
} from '@heroicons/react/24/outline';

/**
 * Profil: halaman biodata pengguna yang sedang login.
 * Menu umum wajib (Dashboard → Profil).
 * Palet mengikuti warna dasar E-Surat: surat-green (#0A5C36) + surat-gold (#D4AF37).
 *
 * Kerangka memakai `PageShell` : sama dengan seluruh halaman panel lain :
 * tanpa `max-w-*`/`mx-auto` karena kanvas & padding sudah disediakan `AdminLayout`.
 */
export const Profil: React.FC = () => {
  const { user } = useAuth();

  const rows: Array<{ label: string; value: string; icon: React.ElementType }> = [
    { label: 'Nama Lengkap', value: user?.nama || ':', icon: UserCircleIcon },
    { label: 'Username', value: user?.username || ':', icon: IdentificationIcon },
    { label: 'Email', value: user?.email || ':', icon: EnvelopeIcon },
    { label: 'Peran', value: user?.role || ':', icon: ShieldCheckIcon },
    { label: 'NIM', value: user?.nim || ':', icon: IdentificationIcon },
    { label: 'NIDN', value: user?.nidn || ':', icon: IdentificationIcon },
    { label: 'Program Studi', value: user?.prodi || ':', icon: AcademicCapIcon },
    { label: 'Fakultas / Unit', value: user?.fakultas || ':', icon: BuildingOffice2Icon },
  ];

  const initial = (user?.nama || user?.username || '?').trim().charAt(0).toUpperCase();

  return (
    <PageShell
      badge={
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-surat-green-50 text-surat-green uppercase tracking-wider">
          Akun Saya
        </span>
      }
      title="Profil"
      description="Biodata pengguna yang sedang aktif. Data mengikuti akun SSO UNUSU : perubahan dilakukan dari pusat SSO."
    >
      <CardContainer>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 rounded-[14px] border border-slate-200 bg-slate-50/60">
          <div className="w-14 h-14 shrink-0 rounded-full overflow-hidden bg-surat-green text-white flex items-center justify-center text-xl font-bold">
            {user?.foto ? (
              <img src={user.foto} alt={user.nama} className="w-full h-full object-cover" />
            ) : (
              initial
            )}
          </div>
          <div className="min-w-0">
            <p className="text-base font-bold text-slate-900 truncate">{user?.nama || 'Pengguna'}</p>
            <p className="text-xs text-slate-500 truncate">
              {user?.username} · {user?.role || 'tanpa peran'}
            </p>
          </div>
          <div className="sm:ml-auto">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold bg-white border border-surat-gold/60 text-surat-green">
              <span className="w-1.5 h-1.5 rounded-full bg-surat-gold" />
              Sesi Aktif
            </span>
          </div>
        </div>

        <dl className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-px bg-slate-200 rounded-[14px] overflow-hidden border border-slate-200">
          {rows.map((row) => {
            const Icon = row.icon;
            return (
              <div key={row.label} className="bg-white p-4 flex items-start gap-3 min-w-0">
                <Icon className="w-4 h-4 mt-0.5 shrink-0 text-surat-green" />
                <div className="min-w-0">
                  <dt className="text-[11px] uppercase tracking-wider font-bold text-slate-400">
                    {row.label}
                  </dt>
                  <dd className="text-sm font-semibold text-slate-800 break-words">{row.value}</dd>
                </div>
              </div>
            );
          })}
        </dl>
      </CardContainer>
    </PageShell>
  );
};

export default Profil;
