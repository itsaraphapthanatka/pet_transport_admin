import { apiFetch } from '@/lib/api';

export interface PetType {
    id: number;
    name: string;
    icon?: string;
    is_active: boolean;
    image_url?: string;
}

export interface CreatePetTypeData {
    name: string;
    icon?: string;
    image_url?: string;
}

export interface UpdatePetTypeData {
    name?: string;
    icon?: string;
    is_active?: boolean;
    image_url?: string;
}

export const petTypeService = {
    getPetTypes: async (): Promise<PetType[]> => {
        const res = await apiFetch('/admin/pet-types');
        if (!res.ok) throw new Error('Failed to fetch pet types');
        return res.json();
    },

    createPetType: async (data: CreatePetTypeData): Promise<PetType> => {
        const res = await apiFetch('/admin/pet-types', {
            method: 'POST',
            body: JSON.stringify(data),
        });
        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.detail || 'Failed to create pet type');
        }
        return res.json();
    },

    updatePetType: async (id: number, data: UpdatePetTypeData): Promise<PetType> => {
        const res = await apiFetch(`/admin/pet-types/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.detail || 'Failed to update pet type');
        }
        return res.json();
    },

    deletePetType: async (id: number): Promise<void> => {
        const res = await apiFetch(`/admin/pet-types/${id}`, {
            method: 'DELETE',
        });
        if (!res.ok) throw new Error('Failed to delete pet type');
    },

    async uploadPetImage(file: File): Promise<string> {
        const formData = new FormData();
        formData.append('file', file);

        const res = await apiFetch('/admin/upload-pet-image', {
            method: 'POST',
            body: formData,
            headers: {
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
