import React from 'react';
import { RbacManagement } from './RbacManagement';

/**
 * Manajemen Pengguna : menu umum wajib (urutan 2).
 * Membungkus RbacManagement mode "users" agar tidak ada duplikasi UI.
 */
export const ManajemenPengguna: React.FC = () => <RbacManagement mode="users" />;

export default ManajemenPengguna;
