import type { AxiosRequestConfig, AxiosResponse } from 'axios';

import axios from 'axios';

const instance = axios.create({
    baseURL: 'http://192.168.0.23:23333',
    timeout: 200000,
    headers: {
        'Content-Type': 'application/json',
    },
});

instance.interceptors.request.use(
    (config) => {
        if (config.data instanceof FormData) {
            delete config.headers['Content-Type'];
        }
        return config;
    },
    (error) => Promise.reject(error),
);

instance.interceptors.response.use(
    (response: AxiosResponse) => response.data,
    (error) => {
        const message = error.response?.data?.message ?? error.message ?? '请求失败';
        return Promise.reject(new Error(message));
    },
);

const request = <T = unknown>(config: AxiosRequestConfig): Promise<T> => {
    return instance(config) as unknown as Promise<T>;
};

export default request;
