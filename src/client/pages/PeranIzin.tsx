import React from 'react';
import { RbacManagement } from './RbacManagement';

/**
 * Peran & Izin : menu umum wajib (urutan 3).
 * Mode "roles" menampilkan daftar peran + matriks izin, tanpa tab pengguna.
 */
export const PeranIzin: React.FC = () => <RbacManagement mode="roles" />;

export default PeranIzin;
