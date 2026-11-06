import React from 'react';
import { RbacManagement } from './RbacManagement';

/**
 * Matriks Izin Akses : menu mandiri di grup Tata Kelola.
 * Mode "permissions" hanya menampilkan matriks pemetaan izin per peran.
 */
export const Izin: React.FC = () => <RbacManagement mode="permissions" />;

export default Izin;
