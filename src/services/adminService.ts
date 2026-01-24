import { apiFetch } from '@/lib/api';

export interface Admin {
    id: number;
    full_name: string;
    email: string;
    role: string;
    last_login?: string;
    created_at?: string;
    phone?: string;
}

export interface CreateAdminData {
    full_name: string;
    email: string;
    password?: string;
    role: string;
    phone?: string;
}

export interface UpdateAdminData {
    full_name?: string;
    email?: string;
    password?: string;
    role?: string;
    phone?: string;
}

export const adminService = {
    getAdmins: async (skip: number = 0, limit: number = 100): Promise<Admin[]> => {
        const res = await apiFetch(`/admin/admins?skip=${skip}&limit=${limit}`);
        return res.json();
    },

    createAdmin: async (data: CreateAdminData): Promise<Admin> => {
        const res = await apiFetch('/admin/admins', {
            method: 'POST',
            body: JSON.stringify(data),
        });
        return res.json();
    },

    updateAdmin: async (id: number, data: UpdateAdminData): Promise<Admin> => {
        const res = await apiFetch(`/admin/admins/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
        return res.json();
    },

    deleteAdmin: async (id: number): Promise<Admin> => {
        const res = await apiFetch(`/admin/admins/${id}`, {
            method: 'DELETE',
        });
        return res.json();
    }
};
