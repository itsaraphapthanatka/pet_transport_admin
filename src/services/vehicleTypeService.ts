import { apiFetch } from '@/lib/api';

export interface VehicleType {
    id: number;
    key: string;
    name: string;
    description?: string;
    icon?: string;
    base_fare: number;
    per_km: number;
    per_min: number;
    min_fare: number;
    is_active: boolean;
    image_url?: string;
    created_at: string;
}

export interface VehicleTypeCreate {
    key: string;
    name: string;
    description?: string;
    icon?: string;
    base_fare: number;
    per_km: number;
    per_min: number;
    min_fare: number;
    image_url?: string;
}

export interface VehicleTypeUpdate {
    name?: string;
    description?: string;
    icon?: string;
    base_fare?: number;
    per_km?: number;
    per_min?: number;
    min_fare?: number;
    is_active?: boolean;
    image_url?: string;
}

export const vehicleTypeService = {
    getVehicleTypes: async (): Promise<VehicleType[]> => {
        const res = await apiFetch('/admin/vehicle-types');
        if (!res.ok) throw new Error('Failed to fetch vehicle types');
        return res.json();
    },

    async createVehicleType(data: VehicleTypeCreate): Promise<VehicleType> {
        const res = await apiFetch('/admin/vehicle-types', {
            method: 'POST',
            body: JSON.stringify(data),
        });
        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.detail || 'Failed to create vehicle type');
        }
        return res.json();
    },

    async updateVehicleType(id: number, data: VehicleTypeUpdate): Promise<VehicleType> {
        const res = await apiFetch(`/admin/vehicle-types/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.detail || 'Failed to update vehicle type');
        }
        return res.json();
    },

    deleteVehicleType: async (id: number): Promise<void> => {
        const res = await apiFetch(`/admin/vehicle-types/${id}`, {
            method: 'DELETE',
        });
        if (!res.ok) throw new Error('Failed to delete vehicle type');
    },

    async uploadVehicleImage(file: File): Promise<string> {
        const formData = new FormData();
        formData.append('file', file);

        const res = await apiFetch('/admin/upload-vehicle-image', {
            method: 'POST',
            body: formData,
            headers: {
                // Important: Don't set Content-Type, fetch will set it with boundary
                'Content-Type': 'none' as any
            }
        });

        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.detail || 'Failed to upload image');
        }

        const data = await res.json();
        return data.url;
    }
};
