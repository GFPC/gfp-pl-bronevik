import { defineStore } from "pinia";
import axios from "axios";

// Глобальная настройка axios для CORS и заголовков
axios.defaults.withCredentials = false;

export type LoginData = {
    login: string,
    password: string,
    type: string
}
export type AuthData = {
    token: string,
    u_hash: string
}
export type Config = {
    id: string,
    name: string,
    url?: string,
    status: string,
    description: string,
    isAuthed?: boolean
}

const api_url_pattern = "https://ibronevik.ru/taxi/c/^CONFIG_ID^/api/v1/"

const configs: Config[] = [
    {
        "id": "gruzvill",
        "name": "Gruzvill",
        "status": "active",
        "description": "Конфиг для перевозок",
    },
    {
        "id": "children",
        "name": "Children",
        "status": "active",
        "description": "Детское такси для Испании",
    },
]

export const useAuthStore = defineStore('authStore', {
    state: (): {
        configs: Config[],
        currentConfig?: Config,
        authData: {[key: string]: AuthData},
        isLoaded: boolean
    } => ({
        configs: configs,
        currentConfig: configs[0],
        authData: {},
        isLoaded: false,
    }),
    actions: {
        async init() {
            const authData = localStorage.getItem('authData')
            if (authData) {
                this.authData = JSON.parse(authData)
            }
            const savedConfigId = localStorage.getItem('currentConfigId')
            if (savedConfigId) {
                const fresh = this.getConfigs().find(cfg => cfg.id === savedConfigId)
                if (fresh) this.currentConfig = fresh
            }
            this.isLoaded = true
        },
        getConfigs() {
            return this.configs.map(cfg => ({
                ...cfg,
                isAuthed: !!this.authData[cfg.id],
                url: api_url_pattern.replace("^CONFIG_ID^", cfg.id)
            }));
        },
        getAuthDataByConfigId(configId: string) {
            return this.authData[configId];
        },
        async authenticate(data: LoginData, configId: string) {
            const config_url = api_url_pattern.replace("^CONFIG_ID^", configId)
            const formData = new FormData();
            formData.append('login', data.login);
            formData.append('password', data.password);
            formData.append('type', data.type);

            const token_response = await axios.post(
              config_url + "auth",
              formData,
              { withCredentials: false }
            )
            console.log(token_response.data.code,token_response.data.code==='200')
            if(token_response.data.code==='200'){
                const formData2 = new FormData();
                formData2.append('auth_hash', token_response.data.auth_hash);
                const auth_response = await axios.post(
                  config_url + "token",
                  formData2,
                  { withCredentials: false }
                )
                console.log('Auth response', auth_response.data)
                if (auth_response.data.code === '200') {
                    const authData = {
                        token: auth_response.data.data.token,
                        u_hash: auth_response.data.data.u_hash
                    }
                    this.authData[configId] = authData
                    localStorage.setItem('authData', JSON.stringify(this.authData))
                    return { status: 'success' }
                } else {
                    console.log(auth_response.data)
                    return {
                        "status": "error",
                        "message": auth_response.data.message
                    }
                }
            } else {
                return {
                    "status": "error",
                    "message": token_response.data.message
                }
            }
            return { status: 'error', message: 'Unexpected error' }
        },
        setCurrentConfig(config: Config) {
            const fresh = this.getConfigs().find(cfg => cfg.id === config.id)
            this.currentConfig = fresh || config
            localStorage.setItem('currentConfigId', config.id)
        }
    }
})