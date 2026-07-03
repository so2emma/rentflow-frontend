// import axios from 'axios';
// import { useAuthStore } from '@/store/authStore';
//
// export const api = axios.create({
//   baseURL: process.env.API_URL || 'http://localhost:8080',
//   headers: {
//     'Content-Type': 'application/json',
//   },
// });
//
// api.interceptors.request.use(
//   (config) => {
//     const token = useAuthStore.getState().token;
//     if (token && config.headers) {
//       config.headers.Authorization = `Bearer ${token}`;
//     }
//     return config;
//   },
//   (error) => {
//     return Promise.reject(error);
//   }
// );
//
// // Response Interceptor: Handle 401 Unauthorized by clearing storage and redirecting
// api.interceptors.response.use(
//   (response) => {
//     return response;
//   },
//   (error) => {
//     if (error.response && error.response.status === 401) {
//       if (typeof window !== 'undefined') {
//         useAuthStore.getState().clearSession();
//
//         // Prevent redirect loops if already on login page
//         if (!window.location.pathname.includes('/login')) {
//           window.location.href = '/login?expired=true';
//         }
//       }
//     }
//     return Promise.reject(error);
//   }
// );
