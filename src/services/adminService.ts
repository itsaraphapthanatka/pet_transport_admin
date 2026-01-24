import { get, post, put, del } from './api';

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
        return get(`/admin/admins?skip=${skip}&limit=${limit}`);
    },

    createAdmin: async (data: CreateAdminData): Promise<Admin> => {
        return post('/admin/admins', data);
    },

    updateAdmin: async (id: number, data: UpdateAdminData): Promise<Admin> => {
        return put(`/admin/admins/${id}`, data);
    },

    deleteAdmin: async (id: number): Promise<Admin> => {
        return del(`/admin/admins/${id}`);
    }
};
