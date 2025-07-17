import { defineStore } from 'pinia'
import axios from 'axios'
import { useAuthStore } from './auth'

// Глобальная настройка axios для CORS и заголовков
axios.defaults.withCredentials = false;

export const useApiStore = defineStore('api', {
    state: () => ({}),
    actions: {
        async getUser(configId: string, params: any, token: string, u_hash: string) {
            const authStore = useAuthStore()
            const config = authStore.getConfigs().find(cfg => cfg.id === configId)
            if (!config || !config.url) throw new Error('Config not found or missing url')
            const url = config.url + 'user'
            const formData = new FormData()
            for (const key in params) {
                formData.append(key, params[key])
            }
            formData.append('token', token)
            formData.append('u_hash', u_hash)
            const response = await axios.post(url, formData, {
                withCredentials: false
            })
            return response.data
        },
        async getConstants(configId: string) {
            const authStore = useAuthStore()
            const config = authStore.getConfigs().find(cfg => cfg.id === configId)
            if (!config || !config.url) throw new Error('Config not found or missing url')
            const url = config.url + 'data'
            const response = await axios.get(url)
            return response.data
        },
        // Добавляйте другие методы API по аналогии
        async uploadLangValues(configId: string, token: string, u_hash: string, langVls: Record<string, any>) {
            const authStore = useAuthStore();
            const config = authStore.getConfigs().find(cfg => cfg.id === configId);
            if (!config || !config.url) throw new Error('Config not found or missing url');
            const url = config.url + 'data';
            const formData = new FormData();
            formData.append('token', token);
            formData.append('u_hash', u_hash);
            formData.append('data', JSON.stringify({ lang_vls: langVls }));
            const response = await axios.post(url, formData, { withCredentials: false });
            return response.data;
        },
        async deleteLangValues(configId: string, token: string, u_hash: string, langVls: Record<string, any>) {
            const authStore = useAuthStore();
            const config = authStore.getConfigs().find(cfg => cfg.id === configId);
            if (!config || !config.url) throw new Error('Config not found or missing url');
            const url = config.url + 'data';
            const formData = new FormData();
            formData.append('token', token);
            formData.append('u_hash', u_hash);
            formData.append('data', JSON.stringify({ lang_vls: langVls }));
            const response = await axios.post(url, formData, { withCredentials: false });
            return response.data;
        },
    }
})