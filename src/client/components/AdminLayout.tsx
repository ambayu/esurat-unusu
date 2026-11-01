import React, { useState } from 'react';
import { NavLink, Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Inbox, 
  Send, 
  FileText, 
  Layers, 
  ShieldCheck, 
  LogOut, 
  User, 
  Menu, 
  X, 
  Home, 
  ExternalLink,
  ChevronRight,
  ChevronLeft,
  ChevronDown
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getAssetUrl } from '../services/api';

export const AdminLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [imgError, setImgError] = useState(false);

  const navItems = [
    {
      to: '/admin',
      end: true,
      label: 'Dashboard',
      icon: LayoutDashboard,
      description: 'Statistik & metrik persuratan',
    },
    {
      to: '/admin/jenis-surat',
      label: 'Jenis Surat & Template',
      icon: Layers,
      description: 'Pola format nomor & template',
    },
    {
      to: '/admin/surat?tipe=masuk',
      label: 'Surat Masuk',
      icon: Inbox,
      description: 'Surat dinas dari luar/unit',
    },
    {
      to: '/admin/surat?tipe=keluar',
      label: 'Surat Keluar',
      icon: Send,
      description: 'Surat keluar & permohonan',
    },
    {
      to: '/admin/surat',
      label: 'Semua Agenda Surat',
      icon: FileText,
      description: 'Seluruh riwayat tata naskah',
    },
    {
      to: '/verifikasi',
      label: 'Verifikasi Dokumen QR',
      icon: ShieldCheck,
      description: 'Validasi token keaslian surat',
    },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getBreadcrumbLabel = (pathname: string) => {
    if (pathname === '/admin' || pathname === '/admin/dashboard') return 'Dashboard';
    if (pathname === '/admin/jenis-surat') return 'Jenis Surat & Template';
    if (pathname.startsWith('/admin/surat-form')) return 'Form Registrasi Surat';
    if (pathname.startsWith('/admin/surat') || pathname.startsWith('/surat')) return 'Agenda Persuratan';
    if (pathname.startsWith('/verifikasi')) return 'Verifikasi Dokumen QR';
    return 'Panel Tata Usaha & Biro';
  };

  const currentLabel = getBreadcrumbLabel(location.pathname);

  const isItemActive = (itemTo: string, itemEnd?: boolean) => {
    try {
      const [targetPath, targetQuery] = itemTo.split('?');
      const targetParams = new URLSearchParams(targetQuery || '');
      const currentParams = new URLSearchParams(location.search);

      // Pastikan pathname cocok
      if (itemEnd) {
        if (location.pathname !== targetPath) return false;
      } else {
        if (targetPath === '/admin') {
          if (location.pathname !== '/admin') return false;
        } else if (!location.pathname.startsWith(targetPath)) {
          return false;
        }
      }

      // Jika target menu memiliki query parameter spesifik (misal tipe=masuk atau tipe=keluar)
      const targetTipe = targetParams.get('tipe');
      if (targetTipe) {
        return currentParams.get('tipe') === targetTipe;
      }

      // Jika target menu adalah rute agenda umum tanpa query param tipe,
      // jangan aktifkan bila URL sedang memiliki parameter tipe spesifik (masuk/keluar)
      if (targetPath.includes('/surat') && !targetTipe) {
        const currentTipe = currentParams.get('tipe');
        if (currentTipe === 'masuk' || currentTipe === 'keluar') {
          return false;
        }
      }

      return true;
    } catch {
      return false;
    }
  };

  const renderSidebarContent = (isCollapsed: boolean) => (
    <div className="h-full flex flex-col justify-between bg-white text-slate-800 relative overflow-hidden select-none">
      <div className="relative z-10 flex flex-col h-full">
        {/* Brand Header — Exact 88px height matching topbar */}
        <div
          className={`h-[88px] border-b border-[#CBD5E1] flex items-center justify-between ${
            isCollapsed ? 'px-3 justify-center' : 'px-5'
          }`}
        >
          <Link to="/admin" className="flex items-center space-x-3 overflow-hidden group">
            <div className="w-11 h-11 rounded-[14px] bg-white border border-[#CBD5E1] p-1 shadow-2xs shrink-0 flex items-center justify-center">
              <div className="w-9 h-9 rounded-[10px] bg-emerald-700 flex items-center justify-center text-white shadow-xs">
                <Layers className="w-5 h-5 text-emerald-200" />
              </div>
            </div>
            {!isCollapsed && (
              <div className="leading-tight truncate">
                <div className="flex items-center space-x-1.5">
                  <span className="font-extrabold text-base text-slate-900 tracking-normal">E-SURAT</span>
                  <span className="font-extrabold text-base text-emerald-700 tracking-normal">ADMIN</span>
                </div>
                <p className="text-[11px] text-slate-500 font-medium tracking-wide mt-0.5">
                  Tata Naskah & Disposisi
                </p>
              </div>
            )}
          </Link>
          <button 
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer"
            aria-label="Tutup menu navigasi"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Menu Navigation */}
        <div className="flex-1 px-3 py-2 space-y-4 overflow-y-auto">
          <div>
            {!isCollapsed && (
              <p className="px-3 pb-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Menu Utama
              </p>
            )}
            <nav className="space-y-1" role="navigation" aria-label="Menu utama panel persuratan">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = isItemActive(item.to, item.end);
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.end}
                    onClick={() => setSidebarOpen(false)}
                    aria-label={item.label}
                    title={isCollapsed ? item.label : undefined}
                    className={() =>
                      `flex items-center rounded-[12px] text-xs font-semibold transition-all group min-h-[44px] ${
                        isCollapsed ? 'justify-center p-2.5' : 'px-3.5 py-2.5 gap-3'
                      } ${
                        active
                          ? 'bg-emerald-700 text-white font-bold shadow-xs'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                      }`
                    }
                  >
                    {() => (
                      <>
                        <div
                          className={`w-8 h-8 rounded-[8px] flex items-center justify-center shrink-0 transition-colors ${
                            active
                              ? 'bg-emerald-800 text-white shadow-2xs'
                              : 'bg-emerald-50 text-emerald-700 group-hover:bg-emerald-100'
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                        </div>
                        {!isCollapsed && (
                          <div className="truncate flex-1 min-w-0">
                            <div className="leading-tight">{item.label}</div>
                            <div className={`text-[10px] font-normal truncate mt-0.5 ${active ? 'text-emerald-100' : 'text-slate-400'}`}>
                              {item.description}
                            </div>
                          </div>
                        )}
                        {!isCollapsed && active && <ChevronRight className="w-3.5 h-3.5 text-emerald-200" />}
                      </>
                    )}
                  </NavLink>
                );
              })}
            </nav>
          </div>

          <div>
            {!isCollapsed && (
              <p className="px-3 pb-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Tautan Cepat
              </p>
            )}
            <div className="space-y-1">
              <Link
                to="/"
                aria-label="Kembali ke halaman depan"
                title={isCollapsed ? 'Halaman Depan' : undefined}
                className={`flex items-center rounded-[12px] text-xs text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition min-h-[44px] ${
                  isCollapsed ? 'justify-center p-2.5' : 'px-3.5 py-2.5 gap-3'
                }`}
              >
                <div className="w-8 h-8 rounded-[8px] flex items-center justify-center shrink-0 bg-slate-100 text-slate-600">
                  <Home className="w-4 h-4" />
                </div>
                {!isCollapsed && (
                  <>
                    <span className="truncate flex-1">Halaman Depan</span>
                    <ExternalLink className="w-3 h-3 text-slate-400" />
                  </>
                )}
              </Link>
            </div>
          </div>
        </div>

        {/* Sidebar Footer Logout */}
        <div className={`p-3 border-t border-[#CBD5E1] bg-slate-50/60 ${isCollapsed ? 'text-center' : ''}`}>
          {!isCollapsed ? (
            <div className="space-y-2">
              <div className="px-3 py-2 rounded-[12px] bg-white border border-[#CBD5E1] shadow-2xs flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[11px] font-semibold text-slate-700">SSO Gateway Aktif</span>
                </div>
                <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  E-SURAT
                </span>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                className="w-full flex items-center justify-center space-x-2 px-3 py-2.5 rounded-[12px] text-xs font-semibold text-rose-600 hover:bg-rose-50 border border-[#CBD5E1] hover:border-rose-200 bg-white shadow-2xs transition min-h-[44px] cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Keluar Sesi</span>
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleLogout}
              title="Keluar Sesi"
              aria-label="Keluar Sesi"
              className="p-2.5 text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-[12px] transition mx-auto cursor-pointer block border border-[#CBD5E1] bg-white shadow-2xs"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F1F5F9] flex flex-col md:flex-row font-sans text-slate-800">
      {/* Mobile Top Header */}
      <div className="md:hidden bg-white border-b border-[#CBD5E1] px-4 py-3 flex items-center justify-between sticky top-0 z-40 shadow-2xs">
        <div className="flex items-center space-x-2.5">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-[10px] border border-[#CBD5E1] text-slate-600 hover:bg-slate-100 min-h-[44px] min-w-[44px] flex items-center justify-center focus:outline-none"
            aria-label="Toggle Sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-[10px] bg-emerald-700 flex items-center justify-center text-white ring-1 ring-emerald-600">
              <Layers className="w-4 h-4 text-emerald-200" />
            </div>
            <div>
              <span className="font-extrabold text-sm text-slate-900">E-SURAT </span>
              <span className="font-extrabold text-sm text-emerald-700">ADMIN</span>
            </div>
          </div>
        </div>

        <Link
          to="/"
          className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-[10px] border border-emerald-200"
        >
          Beranda
        </Link>
      </div>

      {/* Sidebar Backdrop for Mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/40 z-40 md:hidden backdrop-blur-xs"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile Sidebar Overlay Drawer */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex" role="dialog" aria-modal="true" aria-label="Menu navigasi">
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="relative w-72 max-w-[85vw] h-full shadow-2xl z-10 animate-in slide-in-from-left duration-200">
            <div className="absolute top-3 right-3 z-20">
              <button
                type="button"
                onClick={() => setSidebarOpen(false)}
                className="p-1.5 rounded-[10px] bg-white/90 text-slate-600 hover:bg-white shadow-xs border border-[#CBD5E1] min-h-[44px] min-w-[44px] flex items-center justify-center"
                aria-label="Tutup menu navigasi"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            {renderSidebarContent(false)}
          </div>
        </div>
      )}

      {/* Desktop Sticky Sidebar — Identik dengan LPPM / ONE UNUSU */}
      <aside 
        className={`hidden md:block sticky top-0 h-screen bg-white border-r border-[#CBD5E1] transition-[width] duration-300 ease-in-out shrink-0 z-30 ${
          collapsed ? 'w-20' : 'w-64'
        }`}
        aria-label="Sidebar navigasi"
      >
        {renderSidebarContent(collapsed)}
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar/Headbar — Exact 88px height matching Sidebar Brand Header */}
        <header className="hidden md:flex sticky top-0 z-20 bg-white border-b border-[#CBD5E1] h-[88px] px-6 items-center justify-between shadow-2xs">
          {/* Left Controls: Sidebar toggle & Breadcrumbs */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setCollapsed(!collapsed)}
              className="p-2 rounded-[10px] border border-[#CBD5E1] text-slate-600 hover:bg-emerald-50 hover:text-emerald-800 transition-colors cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
              title={collapsed ? 'Perluas Sidebar' : 'Ciutkan Sidebar'}
              aria-label={collapsed ? 'Perluas Sidebar' : 'Ciutkan Sidebar'}
            >
              {collapsed ? (
                <ChevronRight className="w-4 h-4" />
              ) : (
                <ChevronLeft className="w-4 h-4" />
              )}
            </button>

            <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs sm:text-sm">
              <Link to="/admin" className="text-emerald-700 hover:text-emerald-900 font-medium flex items-center gap-1">
                <Home className="w-4 h-4" />
                <span className="font-bold">E-SURAT UNUSU</span>
              </Link>
              <span className="text-slate-400 font-bold">›</span>
              <span className="text-slate-600 font-medium">{currentLabel}</span>
            </nav>
          </div>

          {/* Right Controls: User Profile Dropdown */}
          <div className="flex items-center gap-3 relative">
            <div className="relative">
              <button
                type="button"
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center gap-2.5 p-1.5 pr-3 rounded-full border border-[#CBD5E1] bg-white hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer min-h-[44px]"
                aria-label="Menu profil pengguna"
              >
                <div className="w-8 h-8 rounded-full bg-emerald-700 text-white flex items-center justify-center font-bold text-xs ring-1 ring-emerald-600">
                  {user?.nama ? user.nama.charAt(0).toUpperCase() : 'A'}
                </div>
                <div className="text-left hidden xl:block leading-tight">
                  <div className="text-xs font-bold text-slate-800 truncate max-w-[140px]">
                    {user?.nama || 'Administrator'}
                  </div>
                  <div className="text-[10px] text-emerald-700 font-semibold">{user?.role || 'Staff Biro'}</div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {/* Profile Dropdown Popup */}
              {profileDropdownOpen && (
                <div
                  className="absolute right-0 mt-2 w-56 rounded-[14px] bg-white shadow-md border border-[#CBD5E1] py-1.5 z-50 text-xs"
                  onMouseLeave={() => setProfileDropdownOpen(false)}
                >
                  <div className="px-4 py-2 border-b border-slate-100">
                    <p className="font-bold text-slate-900">{user?.nama || 'Administrator'}</p>
                    <p className="text-[11px] text-slate-500 font-normal">{user?.email || 'esurat@unusu.ac.id'}</p>
                    <span className="inline-block mt-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-900 text-[10px] font-bold border border-emerald-200 uppercase">
                      {user?.role || 'Admin'}
                    </span>
                  </div>
                  <Link
                    to="/"
                    onClick={() => setProfileDropdownOpen(false)}
                    className="flex items-center gap-2 px-4 py-2 text-slate-700 hover:bg-emerald-50 hover:text-emerald-900 transition-colors min-h-[40px]"
                  >
                    <Home className="w-4 h-4 text-slate-400" />
                    <span>Halaman Depan Publik</span>
                  </Link>
                  <Link
                    to="/admin/surat"
                    onClick={() => setProfileDropdownOpen(false)}
                    className="flex items-center gap-2 px-4 py-2 text-slate-700 hover:bg-emerald-50 hover:text-emerald-900 transition-colors min-h-[40px]"
                  >
                    <FileText className="w-4 h-4 text-slate-400" />
                    <span>Agenda Persuratan</span>
                  </Link>
                  <Link
                    to="/verifikasi"
                    onClick={() => setProfileDropdownOpen(false)}
                    className="flex items-center gap-2 px-4 py-2 text-slate-700 hover:bg-emerald-50 hover:text-emerald-900 transition-colors min-h-[40px]"
                  >
                    <ShieldCheck className="w-4 h-4 text-slate-400" />
                    <span>Verifikasi Dokumen QR</span>
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      handleLogout();
                    }}
                    className="w-full flex items-center gap-2 px-4 py-2 text-rose-700 hover:bg-rose-50 transition-colors text-left font-semibold cursor-pointer border-t border-slate-100 min-h-[40px]"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Keluar Sesi</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content Canvas */}
        <main className="flex-1 p-5 sm:p-7 min-w-0 w-full overflow-y-auto">
          <Outlet />
        </main>

        {/* Subtle Clean Footer Standar LPPM */}
        <footer className="py-5 px-6 text-center text-xs text-slate-500 border-t border-[#CBD5E1] bg-white">
          &copy; {new Date().getFullYear()} E-Surat UNUSU — Tata Naskah & Disposisi Elektronik Universitas Nahdlatul Ulama
        </footer>
      </div>
    </div>
  );
};
