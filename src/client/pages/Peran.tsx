import React from 'react';
import { RbacManagement } from './RbacManagement';

/**
 * Peran Sistem : menu mandiri di grup Tata Kelola.
 * Mode "roles" hanya menampilkan daftar peran (tanpa tab & tanpa matriks izin).
 */
export const Peran: React.FC = () => <RbacManagement mode="roles" />;

export default Peran;
