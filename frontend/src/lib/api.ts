import axios, { type AxiosInstance, type AxiosRequestConfig } from 'axios';
import {
  errorInterceptor,
  requestInterceptor,
  successInterceptor,
} from './interceptors';

const axiosRequestConfig: AxiosRequestConfig = {
  baseURL: import.meta.env.VITE_API_END_POINT as string,
  responseType: 'json',
  headers: {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
  },
  timeout: 300000, // 5 minutes timeout for all requests
};

const api: AxiosInstance = axios.create(axiosRequestConfig);

api.interceptors.request.use(requestInterceptor);
api.interceptors.response.use(successInterceptor, errorInterceptor);

export { api };
